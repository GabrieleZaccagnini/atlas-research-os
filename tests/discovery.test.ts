import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiscoveryService, decodePaprikaAdditions, decodeCmcAdditions } from '../services/discovery';
import { readConfig } from '../services/core/config';
import { ProviderRuntime } from '../services/core/runtime';
import { discoveryCoverage, discoverySources, discoveryKinds } from '../lib/discovery';
const paprika = (id: string, rank = 0, active = true, isNew = true) => ({ id, name: 'Duplicate ticker', symbol: 'SAME', rank, is_new: isNew, is_active: active, type: 'token' });
const added = '2026-09-28T12:00:00Z';
const cmc = (id: number, date = added) => ({ id, name: 'Token', symbol: 'SAME', date_added: date, cmc_rank: null,
  quote: [{ symbol: 'USD', price: 0, percent_change_24h: -2, last_updated: added }] });
test('new Paprika additions preserve exact identities, flags, null quotes and bounded rank order', () => {
  const result = decodePaprikaAdditions([paprika('inactive', 1, false), paprika('unranked'), paprika('ranked', 10), paprika('old', 2, true, false), paprika('战旗-战旗', 0, false, false)]);
  assert.deepEqual(result.items.map(r => r.id), ['ranked', 'unranked', 'inactive']);
  assert.equal(result.total, 3); assert.equal(result.items[0].price, null); assert.equal(result.items[0].addedAt, null);
  assert.equal(result.items[1].marketRank, null); assert.equal(result.items[2].active, false);
  const many = decodePaprikaAdditions(Array.from({ length: 120 }, (_, i) => paprika(`token-${i}`, i + 1)));
  assert.equal(many.total, 120); assert.equal(many.items.length, 100);
  assert.throws(() => decodePaprikaAdditions([paprika('same'), paprika('same')]));
  assert.throws(() => decodePaprikaAdditions([{ ...paprika('test'), is_new: 'true' }]));
  assert.throws(() => decodePaprikaAdditions([paprika('../unsafe')]));
  assert.deepEqual(decodePaprikaAdditions([]), { items: [], total: 0 });
});
test('CMC additions validate identity, dates and USD quotes, sorting returned dates without merging tickers', () => {
  const envelope = (data: unknown) => ({ status: { error_code: '0' }, data });
  const result = decodeCmcAdditions(envelope([cmc(2, '2026-09-27T12:00:00Z'), cmc(3)]));
  assert.deepEqual(result.items.map(r => r.id), ['3', '2']);
  assert.equal(result.items[0].price, 0); assert.equal(result.items[0].change24h, -2);
  assert.equal(result.items[0].href, '/tokens/cmc/3'); assert.equal(result.items[0].addedAt, added);
  assert.deepEqual(decodeCmcAdditions(envelope([])), { items: [], total: 0 });
  assert.throws(() => decodeCmcAdditions(envelope([cmc(3), cmc(3)])));
  assert.throws(() => decodeCmcAdditions(envelope([cmc(3, 'not-date')])));
  assert.throws(() => decodeCmcAdditions(envelope([{ ...cmc(3), quote: [{ symbol: 'EUR', last_updated: added }] }])));
  assert.throws(() => decodeCmcAdditions({ status: { error_code: 1001 }, data: [] }));
  assert.throws(() => decodeCmcAdditions(envelope(Array.from({ length: 51 }, (_, i) => cmc(i + 1)))));
});
test('unavailable discovery combinations perform zero upstream requests, even with keys configured', async () => {
  let calls = 0;
  const runtime = new ProviderRuntime(readConfig({ CMC_API_KEY: 'secret', COINGECKO_DEMO_API_KEY: 'secret' }), (async () => { calls++; throw Error('Unexpected fetch'); }) as typeof fetch);
  const service = createDiscoveryService(runtime);
  for (const source of discoverySources) for (const kind of discoveryKinds) {
    if (discoveryCoverage(source, kind).access !== 'available') {
      const result = await service.list(source, kind); assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error.code, 'disabled');
    }
  }
  assert.equal(calls, 0); assert.equal(runtime.status().reduce((n, r) => n + r.requests, 0), 0);
});
test('free discovery calls are fixed, bounded, cached and independently fail without another-source fallback', async () => {
  const urls: string[] = [];
  const runtime = new ProviderRuntime(readConfig({}), (async input => {
    const u = new URL(String(input)); urls.push(u.href);
    if (u.hostname === 'api.coinpaprika.com') return new Response(JSON.stringify([paprika('new-token', 2)]));
    return new Response(JSON.stringify({ status: { error_code: 0 }, data: [cmc(123)] }));
  }) as typeof fetch);
  const service = createDiscoveryService(runtime);
  for (let i = 0; i < 2; i++) {
    assert.equal((await service.list('coinpaprika', 'new')).ok, true);
    assert.equal((await service.list('coinmarketcap', 'new')).ok, true);
  }
  assert.equal(urls.length, 2); const u = new URL(urls[1]);
  assert.equal(u.pathname, '/public-api/v3/cryptocurrency/listings/latest');
  assert.equal(u.searchParams.get('limit'), '50'); assert.equal(u.searchParams.get('sort'), 'date_added');
  assert.equal(u.searchParams.get('sort_dir'), 'desc');
  const broken = new ProviderRuntime(readConfig({}), (async () => new Response('', { status: 503 })) as typeof fetch);
  assert.equal((await createDiscoveryService(broken).list('coinpaprika', 'new')).ok, false);
  assert.equal(broken.status().filter(s => s.requests).length, 1);
});
test('CoinGecko trending preserves provider order and does not confuse trending rank with market rank', async () => {
  const coins = ['rank-lower', 'rank-higher'].map((id, i) => ({ item: { id, name: id, symbol: 'SAME', market_cap_rank: i ? 2 : 200, data: { price: 1, price_change_percentage_24h: { usd: 0 } } } }));
  const runtime = new ProviderRuntime(readConfig({}), (async input => { assert.match(String(input), /search\/trending/); return new Response(JSON.stringify({ coins })); }) as typeof fetch);
  const result = await createDiscoveryService(runtime).list('coingecko', 'trending');
  assert.ok(result.ok); assert.deepEqual(result.data.items.map(r => r.id), ['rank-lower', 'rank-higher']);
  assert.equal(result.data.items[0].marketRank, 200); assert.equal(result.data.items[0].change24h, 0);
  assert.equal(result.meta.provider, 'coingecko-public');
});
