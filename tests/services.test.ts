import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../services/core/config';
import { ProviderRuntime } from '../services/core/runtime';
import { MemoryCache } from '../services/core/cache';
import { createMarketService } from '../services/market';
import { coinGeckoMarket } from '../services/market/coingecko';
import { coinGeckoExchanges } from '../services/exchanges/coingecko';
import { dexScreener } from '../services/dex/dexscreener';
import { createDexService } from '../services/dex';
import { defiLlama } from '../services/defi/defillama';
import { createDefiService } from '../services/defi';
import { summarizeDexLiquidity } from '../services/liquidity';
const json = (body: unknown) => new Response(JSON.stringify(body));
const config = () => readConfig({ COINGECKO_DEMO_API_KEY: 'test-secret' });
const fetcher = (f: (...args: Parameters<typeof fetch>) => Promise<Response>) => f as typeof fetch;

test('config validates flags/ranges without reflecting values', () => {
  assert.equal(readConfig({}).providers.coingecko.apiKey, undefined);
  assert.throws(() => readConfig({ ATLAS_API_TIMEOUT_MS: 'NaN' }), /Invalid Atlas/);
  assert.throws(() => readConfig({ ATLAS_DEXSCREENER_ENABLED: 'yes' }), /true or false/);
});
test('missing key and disabled providers make no requests, status contains no secret', async () => {
  const c = readConfig({ ATLAS_DEXSCREENER_ENABLED: 'false' });
  const r = new ProviderRuntime(c, fetcher(async () => { throw Error('should never fetch'); }));
  assert.equal((await r.query('coingecko', 'global', {}, 1, x => x)).ok, false);
  assert.equal((await r.query('dexscreener', 'x', {}, 1, x => x)).ok, false);
  assert.deepEqual(r.status().map(s => s.state), ['missing_key', 'disabled', 'idle']);
  assert.ok(!JSON.stringify(new ProviderRuntime(config()).status()).includes('test-secret'));
});
test('deduplicates in-flight requests and uses canonical fresh cache', async () => {
  let calls = 0;
  const r = new ProviderRuntime(config(), fetcher(async () => { calls++; return json({ value: 5 }); }));
  const run = () => r.query('defillama', 'protocols', { a: '1' }, 100, x => x);
  const results = await Promise.all([run(), run(), run()]);
  assert.equal(calls, 1); assert.ok(results.every(x => x.ok));
  const cached = await run(); assert.ok(cached.ok); assert.equal(cached.meta.cache, 'fresh');
  assert.equal(calls, 1);
});
test('bounded stale fallback preserves original timestamps and stops at expiry', async () => {
  let now = 100000; let fail = false;
  const c = config(); c.staleMs = 5000;
  const r = new ProviderRuntime(c, fetcher(async () => fail ? new Response('bad', { status: 503 }) : json([1])), () => now);
  const run = () => r.query('defillama', 'protocols', {}, 1000, x => x);
  const first = await run(); assert.ok(first.ok);
  now += 2000; fail = true;
  const stale = await run(); assert.ok(stale.ok); assert.equal(stale.meta.cache, 'stale');
  assert.equal(stale.meta.fetchedAt, first.meta.fetchedAt); assert.equal(stale.warning?.code, 'upstream');
  now += 5000; const expired = await run(); assert.equal(expired.ok, false);
  assert.equal(r.status().find(s => s.id === 'defillama')?.state, 'degraded');
});
test('429 honors Retry-After and prevents calls during cooldown', async () => {
  let now = 100000; let calls = 0;
  const r = new ProviderRuntime(config(), fetcher(async () => { calls++; return new Response('', { status: 429, headers: { 'Retry-After': '60' } }); }), () => now);
  const first = await r.query('defillama', 'protocols', {}, 1, x => x);
  assert.ok(!first.ok); assert.equal(first.error.retryAt, new Date(now + 60000).toISOString());
  now += 1000;
  const second = await r.query('defillama', 'other', {}, 1, x => x);
  assert.ok(!second.ok); assert.equal(second.error.code, 'rate_limited'); assert.equal(calls, 1);
});
test('timeout aborts requests and sanitizes network failures', async () => {
  const c = config(); c.timeoutMs = 10;
  const r = new ProviderRuntime(c, fetcher(async (_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(Error('secret-url')), { once: true });
  })));
  const result = await r.query('defillama', 'protocols', {}, 1, x => x);
  assert.ok(!result.ok); assert.equal(result.error.code, 'timeout');
  const network = new ProviderRuntime(c, fetcher(async () => { throw Error('test-secret'); }));
  const failed = await network.query('defillama', 'protocols', {}, 1, x => x);
  assert.ok(!failed.ok); assert.equal(failed.error.code, 'network'); assert.ok(!JSON.stringify(failed).includes('test-secret'));
});
test('invalid JSON and malformed payloads are not cached as successes', async () => {
  const r = new ProviderRuntime(config(), fetcher(async () => new Response('<html>')));
  const broken = await defiLlama(r).protocols(); assert.ok(!broken.ok); assert.equal(broken.error.code, 'invalid_response');
  const malformed = await defiLlama(new ProviderRuntime(config(), fetcher(async () => json({ error: 'broken' })))).protocols();
  assert.ok(!malformed.ok); assert.equal(malformed.error.code, 'invalid_response');
});
test('market service canonicalizes IDs, keeps nulls and rejects invalid input', async () => {
  let url = ''; let key = '';
  const r = new ProviderRuntime(config(), fetcher(async (input, init) => {
    url = String(input); key = (init?.headers as Record<string, string>)['x-cg-demo-api-key'];
    return json([{ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 0, market_cap: null }]);
  }));
  const service = createMarketService(coinGeckoMarket(r));
  assert.throws(() => service.getQuotes(['../bad'])); assert.throws(() => service.getQuotes([]));
  const result = await service.getQuotes(['ethereum', 'bitcoin', 'bitcoin']);
  assert.ok(result.ok); assert.equal(result.data[0].price, 0); assert.equal(result.data[0].marketCap, null);
  assert.equal(new URL(url).searchParams.get('ids'), 'bitcoin,ethereum'); assert.equal(key, 'test-secret');
  assert.ok(!url.includes('test-secret'));
});
test('exchange tickers retain USD units, unknown venue type and pagination', async () => {
  const fixture = { base: 'BTC', target: 'USDT', market: { name: 'Example', identifier: 'example' }, converted_last: { usd: 100 }, converted_volume: { usd: 1000 }, bid_ask_spread_percentage: 0.1, is_stale: true };
  const r = new ProviderRuntime(config(), fetcher(async () => json({ tickers: Array(100).fill(fixture) })));
  const result = await coinGeckoExchanges(r).list('bitcoin', 2);
  assert.ok(result.ok); assert.equal(result.data.page, 2); assert.equal(result.data.mayHaveMore, true);
  assert.equal(result.data.markets[0].exchangeType, 'unknown'); assert.equal(result.data.markets[0].volume24hUsd, 1000);
  assert.equal(result.data.markets[0].isStale, true);
});
test('DEX normalizes numeric strings, missing liquidity, zero transactions and quote identity', async () => {
  const fixture = { chainId: 'solana', dexId: 'example', pairAddress: 'abc', url: 'https://dexscreener.com/solana/abc', baseToken: { address: 'base', symbol: 'BASE', name: 'Base' }, quoteToken: { address: 'quote', symbol: 'QUOTE' }, priceUsd: '0.002', priceNative: '2e-3', txns: { h24: { buys: 0, sells: 2 } } };
  const r = new ProviderRuntime(config(), fetcher(async () => json([fixture])));
  const service = createDexService(dexScreener(r)); assert.throws(() => service.getPools('solana', '../bad'));
  const result = await service.getPools('solana', 'quote'); assert.ok(result.ok);
  const pool = result.data[0]; assert.equal(pool.basePriceUsd, 0.002); assert.equal(pool.base.address, 'base');
  assert.equal(pool.liquidityUsd, null); assert.equal(pool.buys24h, 0);
  assert.equal(summarizeDexLiquidity([pool, pool]).poolCount, 1);
  assert.equal(summarizeDexLiquidity([pool]).reportedLiquidityUsd, null);
});
test('DefiLlama sorts and limits without mutating cached provider data', async () => {
  const r = new ProviderRuntime(config(), fetcher(async () => json([
    { id: '1', slug: 'a', name: 'A', chains: [], tvl: null }, { id: '2', slug: 'b', name: 'B', chains: ['Ethereum'], tvl: 20 },
  ])));
  const service = createDefiService(defiLlama(r));
  const first = await service.getProtocols(1); assert.ok(first.ok); assert.equal(first.data[0].slug, 'b');
  const second = await service.getProtocols(2); assert.ok(second.ok); assert.equal(second.data.length, 2);
  await assert.rejects(() => service.getProtocols(101));
});
test('memory cache evicts and removes expired records', async () => {
  let now = 0; const c = new MemoryCache(1, () => now);
  const entry = { data: 1, meta: { provider: 'defillama' as const, fetchedAt: '', expiresAt: '', cache: 'live' as const }, freshUntil: 5, staleUntil: 10 };
  await c.set('a', entry); await c.set('b', entry); assert.equal(await c.get('a'), undefined);
  now = 10; assert.equal(await c.get('b'), undefined);
});
