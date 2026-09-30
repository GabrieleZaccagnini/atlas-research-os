import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeFred, decodeNews, decodeStablecoins, decodeRevenue, decodeSentiment } from '../services/intelligence/adapters';
import { ProviderRuntime } from '../services/core/runtime';
import { readConfig } from '../services/core/config';
import { marketRows, filterMarketRows, structureSummary, periodChange, portfolioRows } from '../lib/market-dashboard';
import { projectFileSchema, newProject } from '../lib/projects';
import { positionSchema } from '../lib/positions';
import type { MarketQuote } from '../services/core/types';
const quote = (id: string, rank: number, change: number | null, volume = 2000000): MarketQuote => ({ asset: { coinpaprikaId: id }, name: id, symbol: 'SAME', rank, change24hPercent: change, change7dPercent: null, currency: 'USD', price: 20, marketCap: null, volume24h: volume, fdv: null, circulatingSupply: null, totalSupply: null, maxSupply: null, sourceUpdatedAt: null });
test('FRED parsing skips missing values, preserves zero and validates identity/dates', () => {
  assert.deepEqual(decodeFred('observation_date,DGS10\n2026-01-01,.\n2026-01-02,\n2026-01-03,0\n2026-01-04,4.2', 'DGS10').points, [{ date: '2026-01-03', value: 0 }, { date: '2026-01-04', value: 4.2 }]);
  for (const text of ['observation_date,DGS2\n2026-01-01,1', 'observation_date,DGS10\n2026-02-30,1', 'observation_date,DGS10\n2026-01-01,Infinity', 'observation_date,DGS10\n2026-01-01,.']) assert.throws(() => decodeFred(text, 'DGS10'));
});
test('RSS emits dated source links, strips markup, deduplicates and rejects entities', () => {
  const item = (url: string) => `<item><title><![CDATA[<b>A headline</b>]]></title><link>${url}</link><pubDate>Mon, 28 Sep 2026 10:00:00 GMT</pubDate><category>Markets</category></item>`;
  const rss = `<rss><channel>${item('https://www.coindesk.com/a?utm_source=x')}${item('https://www.coindesk.com/a')}${item('javascript:alert(1)')}${item('https://attacker.invalid/a')}${item('https://user:pass@www.coindesk.com/a')}</channel></rss>`;
  const rows = decodeNews(rss, 'CoinDesk');
  assert.equal(rows.length, 1); assert.equal(rows[0].title, 'A headline'); assert.equal(rows[0].url, 'https://www.coindesk.com/a'); assert.deepEqual(rows[0].categories, ['Markets']);
  assert.throws(() => decodeNews('<!DOCTYPE rss [<!ENTITY attack "x">]>' + rss, 'CoinDesk'));
  assert.throws(() => decodeNews('<html>blocked</html>', 'CoinDesk'));
});
test('stablecoin supply uses USD-converted fields and requires an exact seven-day baseline', () => {
  const supply = decodeStablecoins([{ date: '1767225600', totalCirculatingUSD: { peggedUSD: 100, peggedEUR: 10 }, totalCirculating: { peggedEUR: 999 } }, { date: '1767830400', totalCirculatingUSD: { peggedUSD: 121 } }]);
  assert.equal(supply.points[0].value, 110); assert.ok(Math.abs(periodChange(supply.points, 7)! - 10) < 1e-9); assert.equal(periodChange(supply.points, 30), null);
  assert.equal(periodChange([{ date: '2026-01-01', value: 0 }, { date: '2026-01-08', value: 1 }], 7), null);
});
test('revenue and sentiment retain measured zero and missing fields without inventing profit', () => {
  const rows = decodeRevenue({ protocols: [{ name: 'A', slug: 'a', total24h: 0 }, { name: 'B', slug: 'b' }] });
  assert.equal(rows[0].revenue24h, 0); assert.equal(rows[1].revenue24h, null); assert.equal(rows[0].revenue7d, null);
  assert.equal(decodeRevenue({ protocols: [{ name: 'Signed', slug: 'signed', total24h: -10 }] })[0].revenue24h, -10);
  assert.throws(() => decodeSentiment({ data: [{ value: '101', value_classification: 'Invalid', timestamp: '1767225600' }] }));
});
test('movers use explicit direction, liquidity and top-200 coverage; do not mutate input', () => {
  const rows = [quote('low-volume', 10, 50, 100), quote('small', 201, 100), quote('up', 5, 10), quote('down', 8, -12), quote('missing', 3, null), quote('flat', 2, 0)];
  assert.deepEqual(marketRows(rows, 'gainers').map(q => q.name), ['up']);
  assert.deepEqual(marketRows(rows, 'losers').map(q => q.name), ['down']);
  assert.equal(rows[0].name, 'low-volume');
});
test('position backups migrate v1-v3 to v4 without inventing holdings; decimals round trip', () => {
  const old = newProject('Legacy', 'OLD'); const { position, ...withoutPosition } = old;
  for (const version of [1, 2, 3]) { const backup = projectFileSchema.parse({ version, projects: [withoutPosition] }); assert.equal(backup.version, 4); assert.equal(backup.projects[0].position, null); }
  const p = { ...old, position: positionSchema.parse({ quantity: '0.000000000000000001', averageCostUsd: '0', recordedAt: old.updatedAt }) };
  assert.deepEqual(projectFileSchema.parse(JSON.parse(JSON.stringify({ version: 4, projects: [p] }))).projects[0], p);
  for (const quantity of ['-1', '1e6', 'NaN', '1,000', '']) assert.equal(positionSchema.safeParse({ quantity, averageCostUsd: null, recordedAt: old.updatedAt }).success, false);
});
test('portfolio joins explicit IDs and leaves incomplete valuation/cost unknown', () => {
  const p = { ...newProject('A', 'SAME'), status: 'Owned' as const, coinpaprikaId: 'a', position: { quantity: '2', averageCostUsd: '5', recordedAt: new Date().toISOString() } };
  const rows = portfolioRows([p, { ...newProject('B', 'SAME'), status: 'Owned' }], [quote('a', 1, 3), quote('b', 2, 4)]);
  assert.equal(rows[0].value, 40); assert.equal(rows[0].unrealized, 30); assert.equal(rows[1].quantity, null); assert.equal(rows[1].value, null);
  assert.equal(portfolioRows([{ ...p, coinpaprikaId: 'missing' }], [quote('a', 1, 1)])[0].value, null);
  assert.equal(portfolioRows([{ ...p, position: { ...p.position, averageCostUsd: null } }], [quote('a', 1, 1)])[0].unrealized, null);
  assert.equal(portfolioRows([{ ...p, status: 'Archived' }], [quote('a', 1, 1)]).length, 0);
  assert.equal(portfolioRows([{ ...p, position: { ...p.position, quantity: '0' } }], [quote('a', 1, 1)]).length, 0);
});
test('text providers share caching/status and bound response size before parsing', async () => {
  let calls = 0;
  const runtime = new ProviderRuntime(readConfig({}), (async () => { calls++; return new Response('observation_date,DGS10\n2026-01-01,4'); }) as typeof fetch);
  const run = () => runtime.query('fred', 'graph/fredgraph.csv', { id: 'DGS10' }, 10000, raw => decodeFred(raw, 'DGS10'), 'text');
  assert.equal((await run()).ok, true); assert.equal((await run()).ok, true); assert.equal(calls, 1);
  assert.equal(runtime.status().find(s => s.id === 'fred')?.state, 'healthy');
  await assert.rejects(() => runtime.query('fred', 'https://attacker.invalid/', {}, 1, raw => raw, 'text'));
  const large = new ProviderRuntime(readConfig({}), (async () => new Response('x'.repeat(2000001))) as typeof fetch);
  const result = await large.query('coindesk', 'arc/outboundfeeds/rss/', {}, 1, raw => raw, 'text');
  assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, 'invalid_response');
});

test('market filters exclude missing values and sorts keep unknowns last in both directions', () => {
  const rows = [{ ...quote('a', 1, 3), marketCap: 200 }, { ...quote('b', 2, 4), marketCap: 100 }, quote('missing', 3, null)];
  assert.deepEqual(filterMarketRows(rows, 150, 1000000, null, false).map(q => q.name), ['a']);
  assert.deepEqual(filterMarketRows(rows, 0, 0, 'marketCap', false).map(q => q.name), ['b', 'a', 'missing']);
  assert.deepEqual(filterMarketRows(rows, 0, 0, 'marketCap', true).map(q => q.name), ['a', 'b', 'missing']);
  assert.equal(rows[0].name, 'a');
});
test('structure estimates need aligned caps and complete top ten; changes never substitute price returns', () => {
  const global = { currency: 'USD' as const, marketCap: 1000, volume24h: null, btcDominancePercent: 50, ethDominancePercent: null, marketCapChange24hPercent: -2, sourceUpdatedAt: '2026-09-28T10:00:00Z' };
  const rows = Array.from({ length: 10 }, (_, i) => ({ ...quote(i === 1 ? 'eth-ethereum' : `coin-${i}`, i + 1, 20), marketCap: i === 0 ? 500 : i === 1 ? 100 : 10, sourceUpdatedAt: global.sourceUpdatedAt }));
  const result = structureSummary(global, rows);
  assert.equal(result[0].change, -2); assert.equal(result[1].cap, 500); assert.equal(result[1].share, 50);
  assert.equal(result[2].cap, 400); assert.equal(result[3].cap, 320); assert.equal(result[3].share, 32);
  assert.equal(result[1].change, null); assert.equal(result[2].change, null);
  assert.equal(structureSummary(global, rows.slice(0, 9))[3].cap, null);
  assert.equal(structureSummary(global, [...rows, rows[0]])[3].cap, null);
  assert.equal(structureSummary(global, rows.map(q => ({ ...q, sourceUpdatedAt: '2026-09-28T09:00:00Z' })))[2].cap, null);
  assert.equal(structureSummary(global, rows.map(q => ({ ...q, marketCap: 5000 })))[3].cap, null);
  assert.equal(structureSummary({ ...global, marketCap: 0 }, rows)[0].share, null);
  assert.equal(structureSummary(null, rows)[0].cap, null);
});
