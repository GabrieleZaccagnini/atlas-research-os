import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newProject, filterProjects, projectFileSchema, projectSchema } from '../lib/projects';
test('new records contain no fabricated holdings, prices or conviction', () => {
  const p = newProject(' Example ', 'test');
  assert.equal(p.name, 'Example'); assert.equal(p.symbol, 'TEST');
  assert.equal(p.status, 'Research Queue'); assert.equal(p.conviction, 'Unrated');
  assert.equal(p.thesis, ''); assert.equal(projectSchema.safeParse(p).success, true);
});
test('backup preserves Unicode and note text through JSON round trip', () => {
  const p = { ...newProject('Example', 'TEST'), thesis: 'Thesis: α → adoption\nSource: https://example.com', narratives: ['AI', 'Privacy'] };
  const raw = JSON.stringify({ version: 1, projects: [p] });
  assert.deepEqual(projectFileSchema.parse(JSON.parse(raw)).projects[0], p);
});
test('backup validation rejects duplicate IDs, invalid versions and unsafe asset identifiers', () => {
  const p = newProject('Example', 'TEST');
  assert.equal(projectFileSchema.safeParse({ version: 1, projects: [p, p] }).success, false);
  assert.equal(projectFileSchema.safeParse({ version: 2, projects: [p] }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, coingeckoId: '../bitcoin' }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, updatedAt: 'yesterday' }).success, false);
});
test('project filters combine narrative/status and case-insensitive search', () => {
  const a = { ...newProject('Alpha', 'AAA'), status: 'Buy List' as const, narratives: ['Privacy', 'AI'] };
  const b = { ...newProject('Beta', 'BBB'), status: 'Watching' as const, narratives: ['Privacy'] };
  assert.deepEqual(filterProjects([a, b], ' PRIVACY ', 'Buy List', 'AI'), [a]);
  assert.deepEqual(filterProjects([a, b], 'bbb', 'all', 'all'), [b]);
  assert.deepEqual(filterProjects([a, b], 'zzz', 'all', 'all'), []);
});
