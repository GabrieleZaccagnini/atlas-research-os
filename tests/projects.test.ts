import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newProject, filterProjects, projectFileSchema, projectSchema, upcomingTokenProjects } from '../lib/projects';
test('new records contain no fabricated holdings, prices or conviction', () => {
  const p = newProject(' Example ', 'test');
  assert.equal(p.name, 'Example'); assert.equal(p.symbol, 'TEST');
  assert.equal(p.cmcId, ''); assert.equal(p.status, 'Research Queue'); assert.equal(p.conviction, 'Unrated');
  assert.equal(p.thesis, ''); assert.equal(p.tokenLaunch.stage, 'Not tracked'); assert.equal(projectSchema.safeParse(p).success, true);
});
test('backup preserves Unicode and note text through JSON round trip', () => {
  const p = { ...newProject('Example', 'TEST'), thesis: 'Thesis: α → adoption\nSource: https://example.com', narratives: ['AI', 'Privacy'] };
  const raw = JSON.stringify({ version: 1, projects: [p] });
  assert.deepEqual(projectFileSchema.parse(JSON.parse(raw)).projects[0], p);
});
test('backup validation rejects duplicate IDs, invalid versions and unsafe asset identifiers', () => {
  const p = newProject('Example', 'TEST');
  assert.equal(projectFileSchema.safeParse({ version: 1, projects: [p, p] }).success, false);
  assert.equal(projectFileSchema.safeParse({ version: 4, projects: [{ ...p, cmcId: '1' }, { ...newProject('Other', 'SAME'), cmcId: '1' }] }).success, false);
  assert.equal(projectFileSchema.safeParse({ version: 99, projects: [p] }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, coingeckoId: '../bitcoin' }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, cmcId: '001' }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, cmcId: 'ETH' }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, updatedAt: 'yesterday' }).success, false);
});
test('project filters combine narrative/status and case-insensitive search', () => {
  const a = { ...newProject('Alpha', 'AAA'), status: 'Buy List' as const, narratives: ['Privacy', 'AI'] };
  const b = { ...newProject('Beta', 'BBB'), status: 'Watching' as const, narratives: ['Privacy'] };
  assert.deepEqual(filterProjects([a, b], ' PRIVACY ', 'Buy List', 'AI'), [a]);
  assert.deepEqual(filterProjects([a, b], 'bbb', 'all', 'all'), [b]);
  assert.deepEqual(filterProjects([a, b], 'zzz', 'all', 'all'), []);
});

test('legacy backups migrate without changing research or storage identity', () => {
  const { details, tokenLaunch, ...legacy } = newProject('Legacy project', 'OLD');
  legacy.capital = 'Private round notes\nDo not lose this';
  const raw = { version: 1, projects: [legacy] };
  const parsed = projectFileSchema.parse(raw);
  assert.equal(parsed.version, 4);
  assert.equal(parsed.projects[0].capital, legacy.capital);
  assert.equal(parsed.projects[0].id, legacy.id);
  assert.deepEqual(parsed.projects[0].details, { links: [], team: [], funding: [], tokenomics: [] });
  assert.deepEqual(parsed.projects[0].tokenLaunch, tokenLaunch);
  assert.equal('details' in raw.projects[0], false);
  assert.equal('tokenLaunch' in raw.projects[0], false);
});

test('upcoming tokens support unknown tickers and tentative dates without provider mappings', () => {
  const undated = { ...newProject('Early protocol', ''), tokenLaunch: { stage: 'Potential' as const, expectedOn: '', sourceUrl: 'https://example.com/announcement', reason: 'Interesting distribution design' } };
  const dated = { ...newProject('Announced token', 'TBD'), tokenLaunch: { stage: 'Announced' as const, expectedOn: '2027-03-20', sourceUrl: '', reason: 'Watch tokenomics' } };
  const live = { ...newProject('Live token', 'LIVE'), tokenLaunch: { stage: 'Live' as const, expectedOn: '', sourceUrl: '', reason: '' } };
  const archived = { ...undated, id: crypto.randomUUID(), status: 'Archived' as const };
  assert.equal(projectSchema.safeParse(undated).success, true);
  assert.equal(projectSchema.safeParse({ ...dated, tokenLaunch: { ...dated.tokenLaunch, expectedOn: '2027-02-30' } }).success, false);
  assert.equal(projectSchema.safeParse({ ...dated, tokenLaunch: { ...dated.tokenLaunch, sourceUrl: 'javascript:alert(1)' } }).success, false);
  assert.deepEqual(upcomingTokenProjects([undated, live, archived, dated]), [dated, undated]);
  assert.deepEqual(projectFileSchema.parse(JSON.parse(JSON.stringify({ version: 4, projects: [undated] }))).projects[0].tokenLaunch, undated.tokenLaunch);
});

import { newDetail } from '../lib/project-details';
test('structured research survives backup round trips including zero vs unknown', () => {
  const p = newProject('Research', 'RES');
  p.details.links.push({ ...newDetail('links'), label: 'Website', url: 'https://example.com' });
  p.details.team.push({ ...newDetail('team'), name: 'Research subject', role: 'Founder' });
  p.details.funding.push({ ...newDetail('funding'), round: 'Public sale', amountRaised: '', tokenPrice: '0' });
  p.details.tokenomics.push({ ...newDetail('tokenomics'), metric: 'Max supply', value: '1000000000', unit: 'tokens', asOf: '2026-09-27' });
  const file = { version: 4, projects: [p] };
  assert.deepEqual(projectFileSchema.parse(JSON.parse(JSON.stringify(file))), file);
});
test('evidence rejects unsafe links, impossible dates and unsupported verified claims', () => {
  const p = newProject('Research', 'RES');
  const link = { ...newDetail('links'), label: 'Website', url: 'javascript:alert(1)' };
  p.details.links = [link];
  assert.equal(projectSchema.safeParse(p).success, false);
  link.url = 'https://example.com';
  link.reviewStatus = 'Verified';
  assert.equal(projectSchema.safeParse(p).success, false);
  link.sourceUrl = 'https://example.com/about'; link.reviewedOn = '2026-02-30';
  assert.equal(projectSchema.safeParse(p).success, false);
  link.reviewedOn = '2026-02-28';
  assert.equal(projectSchema.safeParse(p).success, true);
  link.sourceUrl = 'https://user:password@example.com';
  assert.equal(projectSchema.safeParse(p).success, false);
});
test('funding requires nonnegative decimal strings and unique record IDs', () => {
  const p = newProject('Research', 'RES');
  const round = { ...newDetail('funding'), tokenPrice: '-1' };
  p.details.funding = [round];
  assert.equal(projectSchema.safeParse(p).success, false);
  round.tokenPrice = '0.000000000000001';
  assert.equal(projectSchema.safeParse(p).success, true);
  p.details.funding.push(round);
  assert.equal(projectSchema.safeParse(p).success, false);
});
