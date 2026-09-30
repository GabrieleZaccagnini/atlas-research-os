import test from 'node:test';
import assert from 'node:assert/strict';
import { marketMetrics, filterMarketRows, invalidRange, type MarketRow } from '../lib/market-dashboard';
import { validMarketColumns, defaultMarketColumns } from '../lib/market-columns';
import { coinMarketCap, decodeCmcPerformance } from '../services/market/coinmarketcap';
import { ProviderRuntime } from '../services/core/runtime';
import { readConfig } from '../services/core/config';
const at = '2026-09-29T00:00:00.000Z';
const row = (id: number, change1hPercent: number | null = 10): MarketRow => ({ asset: { coinmarketcapId: id }, name: String(id), symbol: 'SAME', currency: 'USD', rank: id, price: 10, marketCap: 100, fdv: null, volume24h: 1000, change1hPercent, change24hPercent: 20, change7dPercent: 5, circulatingSupply: null, totalSupply: null, maxSupply: null, sourceUpdatedAt: at });
const history = (points: { date: string; price: number | null }[], id = 2) => ({ status: { error_code: 0 }, data: { [id]: { id, quotes: points.map(p => ({ timestamp: p.date, quote: { USD: { price: p.price, timestamp: p.date } } })) } } });
test('BTC returns use compounded ratio and exact provider identity with aligned observations', () => {
  const btc = row(1, 5), token = row(2, 10);
  const metrics = marketMetrics([btc, token]);
  assert.equal(metrics[0].change1hBtcPercent, 0);
  assert.ok(Math.abs(metrics[1].change1hBtcPercent! - (1.1 / 1.05 - 1) * 100) < 1e-8);
  assert.equal(marketMetrics([token])[0].change1hBtcPercent, null);
  assert.equal(marketMetrics([btc, { ...token, sourceUpdatedAt: '2026-09-28T23:00:00Z' }])[1].change1hBtcPercent, null);
  assert.equal(marketMetrics([{ ...btc, change1hPercent: -100 }, token])[1].change1hBtcPercent, null);
  assert.equal(marketMetrics([btc, { ...token, asset: { coinpaprikaId: 'other' } }])[1].change1hBtcPercent, null);
});
test('signed ranges combine with cap/volume; empty bounds and missing optional sorts behave correctly', () => {
  const rows = [row(1, -5), row(2, 0), row(3, 10), { ...row(4), change1hPercent: undefined }];
  assert.deepEqual(filterMarketRows(rows, 0, 0, null, false, [{ metric: 'change1hPercent', min: '-5', max: '0' }, { metric: 'price', min: '10', max: '10' }]).map(q => q.rank), [1, 2]);
  assert.equal(filterMarketRows(rows, 101, 0, null, false).length, 0);
  assert.equal(filterMarketRows(rows, 0, 0, null, false, [{ metric: 'change1hPercent', min: '', max: '' }]).length, 4);
  assert.equal(filterMarketRows(rows, 0, 0, null, false, [{ metric: 'price', min: '20', max: '10' }]).length, 0);
  assert.equal(invalidRange({ metric: 'price', min: 'Infinity', max: '' }), true);
  assert.deepEqual(filterMarketRows(rows, 0, 0, 'change1hPercent', true).map(q => q.rank), [3, 2, 1, 4]);
  assert.deepEqual(filterMarketRows(rows, 0, 0, 'change1hPercent', false).map(q => q.rank), [1, 2, 3, 4]);
  assert.equal(rows[0].rank, 1);
});
test('column preferences reject unknown, duplicate, empty and oversized selections', () => {
  assert.deepEqual(validMarketColumns(defaultMarketColumns), defaultMarketColumns);
  for (const raw of [null, [], ['mindshare'], ['price', 'price'], Array(20).fill('price')]) assert.equal(validMarketColumns(raw), null);
});
test('4h/12h history requires exact assets and timestamp coverage; zero and absent baselines stay unknown', () => {
  const points = [{ date: at, price: 120 }, { date: '2026-09-28T20:00:00Z', price: 100 }, { date: '2026-09-28T16:00:00Z', price: 90 }, { date: '2026-09-28T12:00:00Z', price: 80 }];
  const data = decodeCmcPerformance(history(points), [2, 3], at);
  assert.ok(Math.abs(data.rows[0].change4hPercent! - 20) < 1e-8);
  assert.equal(data.rows[0].change12hPercent, 50); assert.equal(data.rows[1].change4hPercent, null);
  assert.equal(marketMetrics([row(2)], data)[0].change12hPercent, 50);
  assert.equal(marketMetrics([{ ...row(2), sourceUpdatedAt: '2026-09-29T01:00:00Z' }], data)[0].change12hPercent, null);
  assert.equal(decodeCmcPerformance(history([points[0], { ...points[1], price: 0 }]), [2], at).rows[0].change4hPercent, null);
  assert.equal(decodeCmcPerformance(history([points[0], { ...points[1], date: '2026-09-28T20:20:00Z' }]), [2], at).rows[0].change4hPercent, null);
  assert.throws(() => decodeCmcPerformance(history(points, 3), [2], at));
  assert.throws(() => decodeCmcPerformance(history([points[0], points[0]]), [2], at));
  assert.throws(() => decodeCmcPerformance(history([{ date: '2026-09-29T01:00:00Z', price: 100 }]), [2], at));
});
test('historical access without a key performs no requests; keyed history is batched, bounded and cached', async () => {
  let calls = 0; const urls: string[] = [];
  const runtime = new ProviderRuntime(readConfig({}), async () => { calls++; throw new Error('Must not call'); });
  const missing = await coinMarketCap(runtime).performance(); assert.equal(missing.ok, false); assert.equal(calls, 0);
  let now = Date.parse(at);
  const authenticated = new ProviderRuntime(readConfig({ CMC_API_KEY: 'fixture-key' }), async input => {
    const url = new URL(String(input)); urls.push(url.href); now += 1001;
    if (url.pathname.endsWith('listings/latest')) return new Response(JSON.stringify({ status: { error_code: 0 }, data: [{ id: 2, name: 'Token', symbol: 'T', quote: [{ symbol: 'USD', price: 120, last_updated: at }] }] }));
    assert.equal(url.searchParams.get('id'), '2'); assert.equal(url.searchParams.get('interval'), '4h'); assert.equal(url.searchParams.get('count'), '4'); assert.equal(url.searchParams.get('time_end'), at);
    return new Response(JSON.stringify(history([{ date: at, price: 120 }, { date: '2026-09-28T20:00:00Z', price: 100 }])));
  }, () => now);
  const cmc = coinMarketCap(authenticated); assert.equal((await cmc.performance()).ok, true); assert.equal((await cmc.performance()).ok, true);
  assert.equal(urls.length, 2); assert.ok(urls.every(u => !u.includes('fixture-key') && !u.includes('public-api')));
});
