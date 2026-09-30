import { test } from 'node:test';
import { createMarketService } from '../services/market';
import { formatPrice } from '../lib/format';
import assert from 'node:assert/strict';
import { ProviderRuntime } from '../services/core/runtime';
import { readConfig } from '../services/core/config';
import { coinPaprikaMarket, coinPaprikaId } from '../services/market/coinpaprika';
import { newProject, projectFileSchema, projectSchema } from '../lib/projects';
import { newDetail } from '../lib/project-details';
import { localDay, calendarDate } from '../lib/research-routine';
import { researchCoverage, reviewQueue, reviewHistory, projectEvents } from '../lib/research-desk';
const ticker = (id = 'btc-bitcoin') => ({ id, name: 'Bitcoin', symbol: 'BTC', rank: 1,
  last_updated: '2026-09-28T00:00:00Z', quotes: { USD: { price: 0, volume_24h: 0, percent_change_24h: -2 } } });
const runtime = (body: unknown) => new ProviderRuntime(readConfig({}), (async () => new Response(JSON.stringify(body))) as typeof fetch);
test('key-free market adapter preserves missing supply/FDV and valid zero values', async () => {
  let requested = ''; let headers: HeadersInit | undefined;
  const r = new ProviderRuntime(readConfig({}), (async (url, init) => { requested = String(url); headers = init?.headers; return new Response(JSON.stringify([ticker()])); }) as typeof fetch);
  const result = await coinPaprikaMarket(r).assets(); assert.ok(result.ok);
  assert.equal(new URL(requested).origin, 'https://api.coinpaprika.com');
  assert.equal(new Headers(headers).has('x-cg-demo-api-key'), false);
  assert.equal(result.data[0].price, 0); assert.equal(result.data[0].volume24h, 0);
  assert.equal(result.data[0].circulatingSupply, null); assert.equal(result.data[0].fdv, null);
  assert.equal(result.data[0].asset.coinpaprikaId, 'btc-bitcoin');
  assert.equal(result.meta.provider, 'coinpaprika');
});
test('asset quotes match IDs, not identical symbols, and reuse a shared snapshot', async () => {
  let calls = 0;
  const r = new ProviderRuntime(readConfig({}), (async () => { calls++; return new Response(JSON.stringify([ticker('btc-bitcoin'), ticker('btc-unrelated')])); }) as typeof fetch);
  const provider = coinPaprikaMarket(r);
  await provider.assets(); const selected = await provider.quotes(['btc-unrelated']); assert.ok(selected.ok);
  assert.equal(selected.data.length, 1); assert.equal(selected.data[0].asset.coinpaprikaId, 'btc-unrelated'); assert.equal(calls, 1);
  const missing = await provider.quotes(['unknown-asset']); assert.ok(missing.ok); assert.deepEqual(missing.data, []);
  await assert.rejects(provider.quotes(['../bad']));
});
test('malformed or duplicate assets do not become valid market snapshots', async () => {
  for (const data of [[ticker(), ticker()], [{ ...ticker(), quotes: { USD: { price: -1 } } }], { error: 'quota reached' }]) {
    const result = await coinPaprikaMarket(runtime(data)).assets(); assert.equal(result.ok, false);
  }
});
test('global metrics preserve absent ETH dominance and provider observation time', async () => {
  const result = await coinPaprikaMarket(runtime({ market_cap_usd: 100, bitcoin_dominance_percentage: 50, last_updated: 1000 })).global();
  assert.ok(result.ok); assert.equal(result.data.ethDominancePercent, null); assert.equal(result.data.volume24h, null);
  assert.equal(result.data.sourceUpdatedAt, '1970-01-01T00:16:40.000Z');
});
test('profiles reject identity mismatches and remove dangerous provider links', async () => {
  const fixture = { id: 'btc-bitcoin', name: 'Bitcoin', symbol: 'BTC', links: { website: ['javascript:alert(1)', 'https://user:secret@example.com', 'https://example.com'] } };
  const provider = coinPaprikaMarket(runtime(fixture)); const result = await provider.profile('btc-bitcoin');
  assert.ok(result.ok); assert.deepEqual(result.data.links, [{ label: 'website', url: 'https://example.com' }]);
  assert.equal(result.data.description, '');
  const wrong = await coinPaprikaMarket(runtime(fixture)).profile('eth-ethereum'); assert.equal(wrong.ok, false);
});
test('legacy records gain empty routine fields without changing manual research', () => {
  const { review, events, coinpaprikaId, providerProfile, ...old } = newProject('Legacy', 'LEG');
  old.thesis = 'Keep my original evidence';
  const migrated = projectFileSchema.parse({ version: 2, projects: [old] });
  assert.equal(migrated.version, 4); assert.equal(migrated.projects[0].thesis, old.thesis);
  assert.deepEqual(migrated.projects[0].review, { nextAction: '', nextReviewOn: '', entries: [] });
  assert.equal(migrated.projects[0].providerProfile, null); assert.deepEqual(migrated.projects[0].events, []);
});
test('reviews and events round-trip through backup and reject duplicate IDs', () => {
  const p = newProject('Project', 'P');
  p.review = { nextAction: 'Read the audit', nextReviewOn: '2026-09-29', entries: [{ id: crypto.randomUUID(), recordedAt: '2026-09-28T01:00:00Z', note: 'Thesis α\nUnverified assumption', nextAction: 'Read the audit', nextReviewOn: '2026-09-29' }] };
  p.events = [{ id: crypto.randomUUID(), title: 'Upgrade', date: '2026-10-01', sourceUrl: 'https://example.com', notes: '' }];
  const file = { version: 4, projects: [p] };
  assert.deepEqual(projectFileSchema.parse(JSON.parse(JSON.stringify(file))), file);
  p.events.push(p.events[0]); assert.equal(projectSchema.safeParse(p).success, false);
  p.events.pop(); p.review.entries.push(p.review.entries[0]); assert.equal(projectSchema.safeParse(p).success, false);
});
test('dates are calendar-valid and local-day formatting does not use UTC dates', () => {
  assert.equal(calendarDate.safeParse('2026-02-30').success, false);
  assert.equal(calendarDate.safeParse('2028-02-29').success, true);
  assert.equal(localDay(new Date(2026, 8, 28, 0, 5)), '2026-09-28');
});
test('research coverage ignores blank records and distinguishes verification', () => {
  const p = newProject('Project', 'P'); p.details.team.push(newDetail('team')); p.details.tokenomics.push(newDetail('tokenomics'));
  assert.equal(researchCoverage(p).filled, 0); assert.equal(researchCoverage(p).toVerify, 0);
  p.details.team[0].name = 'Founder'; p.risks = '   '; p.thesis = 'A thesis';
  assert.equal(researchCoverage(p).filled, 2); assert.equal(researchCoverage(p).toVerify, 1);
});
test('review queue prioritizes due dates and excludes archived projects', () => {
  const queued = newProject('Queue', 'Q'); const due = newProject('Due', 'D'); due.status = 'Watching'; due.review.nextReviewOn = '2026-09-27';
  const archived = newProject('Archived', 'A'); archived.status = 'Archived'; archived.review.nextReviewOn = '2026-01-01';
  const rows = reviewQueue([queued, archived, due], '2026-09-28');
  assert.equal(rows.length, 2); assert.equal(rows[0].project.id, due.id); assert.equal(rows[0].due, true); assert.equal(rows[1].due, false);
});
test('journal preserves archived history while calendar excludes archived catalysts', () => {
  const p = newProject('Archived', 'A'); p.status = 'Archived';
  p.events = [{ id: crypto.randomUUID(), title: 'Past event', date: '2026-09-28', sourceUrl: '', notes: '' }];
  p.review.entries = [{ id: crypto.randomUUID(), recordedAt: '2026-09-28T01:00:00Z', note: 'Recorded then', nextAction: '', nextReviewOn: '' }];
  assert.equal(projectEvents([p]).length, 0); assert.equal(reviewHistory([p]).length, 1);
});
test('saved profile must match explicit provider ID and never replaces manual fields', async () => {
  const result = await coinPaprikaMarket(runtime({ id: 'btc-bitcoin', name: 'Bitcoin', symbol: 'BTC', description: 'Provider description' })).profile('btc-bitcoin'); assert.ok(result.ok);
  const p = newProject('Bitcoin', 'BTC'); p.summary = 'My edited summary'; p.providerProfile = result.data;
  assert.equal(projectSchema.safeParse(p).success, false);
  p.coinpaprikaId = 'btc-bitcoin'; const saved = projectSchema.parse(p);
  assert.equal(saved.summary, 'My edited summary'); assert.equal(saved.providerProfile?.description, 'Provider description');
});

test('legitimate leading-hyphen provider IDs remain usable without permitting URL paths', async () => {
  const result = await createMarketService(coinPaprikaMarket(runtime([ticker('-example')])), coinPaprikaId).getQuotes(['-example']);
  assert.ok(result.ok); assert.equal(result.data[0].asset.coinpaprikaId, '-example');
  assert.throws(() => coinPaprikaMarket(runtime({})).profile('../secret'));
});

test('small positive token prices never format as zero', () => { assert.equal(formatPrice(0), '$0.0000'); assert.ok(!/^\$0\.0+$/.test(formatPrice(0.000000012345))); });

test('global change fields preserve signed percentages, zero and missing coverage', async () => {
  const result = await coinPaprikaMarket(runtime({ market_cap_usd: 100, market_cap_change_24h: -3, volume_24h_change_24h: 0 })).global();
  assert.ok(result.ok); if (result.ok) { assert.equal(result.data.marketCapChange24hPercent, -3); assert.equal(result.data.volumeChange24hPercent, 0); }
  const missing = await coinPaprikaMarket(runtime({ market_cap_usd: 100 })).global();
  assert.ok(missing.ok); if (missing.ok) assert.equal(missing.data.marketCapChange24hPercent, null);
});
