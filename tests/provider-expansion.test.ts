import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../services/core/config';
import { ProviderRuntime } from '../services/core/runtime';
import { coinMarketCap, decodeCmcGlobal, decodeCmcSentiment, decodeAltcoinSeason, preferredGlobal, decodeCmcListings, decodeCmcProfile, cmcId } from '../services/market/coinmarketcap';
import { decodeNews, intelligenceAdapters } from '../services/intelligence/adapters';
import { newProject } from '../lib/projects';
import { monthlyChange } from '../lib/macro';
import { marketAssetKey, marketAssetHref, savedMarketProject, structureSummary } from '../lib/market-dashboard';
const observed = '2026-09-28T10:00:00Z';
const envelope = (data: unknown, code: number | string = 0) => ({ status: { error_code: code }, data });
const globalFixture = envelope({ btc_dominance: 60, eth_dominance: 10, last_updated: observed, quote: { USD: { total_market_cap: 1000, total_volume_24h: 0, derivatives_volume_24h: 0, total_market_cap_yesterday_percentage_change: -2, last_updated: observed } } });
test('CMC keeps its own cap, reported changes, derivatives and timestamps; nulls and zero survive', () => {
  const global = decodeCmcGlobal(globalFixture);
  assert.equal(global.marketCap, 1000); assert.equal(global.volume24h, 0); assert.equal(global.volumeChange24hPercent, null); assert.equal(global.derivativesVolume24h, 0);
  assert.equal(global.marketCapChange24hPercent, -2); assert.equal(global.sourceUpdatedAt, observed);
  const rows = structureSummary(global, []);
  assert.equal(rows[1].cap, 400); assert.equal(rows[2].cap, 300); assert.equal(rows[3].cap, null);
});
test('CMC validates error envelopes, score bounds and timestamped observations without leaking messages', () => {
  assert.equal(decodeCmcSentiment(envelope({ value: 0, value_classification: 'Extreme Fear', update_time: observed }, '0')).value, 0);
  assert.equal(decodeAltcoinSeason(envelope({ altcoin_index: 100, snapshot_time: observed })).yearlyHigh, null);
  for (const score of [-1, 101, '70']) assert.throws(() => decodeCmcSentiment(envelope({ value: score, value_classification: 'Greed', update_time: observed })));
  assert.throws(() => decodeAltcoinSeason(envelope({ altcoin_index: 50, snapshot_time: 'not-a-date' })));
  assert.throws(() => decodeCmcGlobal({ ...globalFixture, status: { error_code: 1001, error_message: 'private-secret' } }), /CoinMarketCap returned an API error/);
  assert.throws(() => decodeCmcGlobal({ data: globalFixture.data }));
});
test('CMC public access sends no secrets; optional authenticated access uses a header and caches calls', async () => {
  for (const key of ['', 'cmc-secret']) {
    let url = ''; let headers = new Headers(); let calls = 0;
    const runtime = new ProviderRuntime(readConfig({ CMC_API_KEY: key, COINGECKO_DEMO_API_KEY: 'other-secret' }), (async (input, init) => { calls++; url = String(input); headers = new Headers(init?.headers); return new Response(JSON.stringify(globalFixture)); }) as typeof fetch);
    const adapter = coinMarketCap(runtime);
    assert.equal((await adapter.global()).ok, true); assert.equal((await adapter.global()).ok, true); assert.equal(calls, 1);
    assert.equal(new URL(url).pathname, `${key ? '' : '/public-api'}/v1/global-metrics/quotes/latest`);
    assert.equal(headers.get('X-CMC_PRO_API_KEY'), key || null); assert.equal(headers.has('x-cg-demo-api-key'), false); assert.equal(url.includes('secret'), false);
    assert.equal(JSON.stringify(runtime.status()).includes('secret'), false);
    const disabled = new ProviderRuntime(readConfig({ ATLAS_CMC_ENABLED: 'false' }), (async () => { throw Error('Unexpected request'); }) as typeof fetch);
    const result = await coinMarketCap(disabled).global(); assert.equal(result.ok, false); if (!result.ok) assert.equal(result.error.code, 'disabled');
  }
});
test('global fallback is lazy and preserves the complete selected universe and visible provenance', async () => {
  const data = decodeCmcGlobal(globalFixture); let calls = 0;
  const meta = { provider: 'coinmarketcap' as const, fetchedAt: observed, expiresAt: observed, cache: 'live' as const };
  const primary = { ok: true as const, data, meta };
  const secondary = async () => { calls++; return { ok: true as const, data: { ...data, marketCap: 2000 }, meta: { ...meta, provider: 'coinpaprika' as const } }; };
  assert.equal((await preferredGlobal(async () => primary, secondary)), primary); assert.equal(calls, 0);
  const failed = { ok: false as const, data: null, provider: 'coinmarketcap' as const, error: { code: 'upstream' as const, message: 'failed' } };
  const fallback = await preferredGlobal(async () => failed, secondary); assert.ok(fallback.ok); assert.equal(fallback.data.marketCap, 2000); assert.equal(fallback.meta.provider, 'coinpaprika'); assert.match(fallback.warning!.message, /using CoinPaprika/);
});
test('inflation calculations require exact calendar months; missing months and zero baselines stay unknown', () => {
  const points = [{ date: '2025-02-01', value: 100 }, { date: '2026-01-01', value: 102 }, { date: '2026-02-01', value: 103 }];
  assert.ok(Math.abs(monthlyChange(points, 12)! - 3) < 1e-9); assert.ok(Math.abs(monthlyChange(points, 1)! - (103 / 102 - 1) * 100) < 1e-9);
  assert.equal(monthlyChange([points[0], points[2]], 1), null); assert.equal(monthlyChange([{ ...points[0], value: 0 }, points[2]], 12), null);
  assert.equal(monthlyChange([{ date: '2026-02-28', value: 100 }], 1), null); assert.equal(monthlyChange([], 12), null);
});
test('new RSS sources normalize canonical links and reject wrong hosts, credentials and markup URLs', () => {
  for (const [source, host] of [['Cointelegraph', 'cointelegraph.com'], ['ECB', 'www.ecb.europa.eu']] as const) {
    const item = (link: string) => `<item><title><![CDATA[<b>News &amp; policy</b>]]></title><link>${link}</link><pubDate>Mon, 28 Sep 2026 10:00:00 GMT</pubDate></item>`;
    const rss = `<rss><channel>${item(`https://${host}//news/a?utm_source=rss`)}${item(`https://${host}/news/a`)}${item(`https://${host}.attacker.invalid/a`)}${item(`https://secret:password@${host}/a`)}</channel></rss>`;
    const rows = decodeNews(rss, source); assert.equal(rows.length, 1); assert.equal(rows[0].source, source); assert.equal(rows[0].url, `https://${host}/news/a`); assert.equal(rows[0].title, 'News & policy');
  }
});
test('news feeds fail independently and use bounded fixed-source requests', async () => {
  const rss = '<rss><channel><item><title>Policy</title><link>https://www.ecb.europa.eu/press/a</link><pubDate>Mon, 28 Sep 2026 10:00:00 GMT</pubDate></item></channel></rss>';
  const runtime = new ProviderRuntime(readConfig({}), (async input => new URL(String(input)).hostname === 'cointelegraph.com' ? new Response('', { status: 503 }) : new Response(rss)) as typeof fetch);
  const service = intelligenceAdapters(runtime);
  assert.equal((await service.news('cointelegraph')).ok, false); const ecb = await service.news('ecb'); assert.ok(ecb.ok); assert.equal(ecb.data[0].source, 'ECB');
});

const listingFixture = (id = 1, rank = 1) => ({ id, name: 'Same symbol asset', symbol: 'SAME', cmc_rank: rank,
  circulating_supply: 0, total_supply: 100, max_supply: null,
  quote: [{ symbol: 'USD', price: 0, market_cap: 0, volume_24h: 0, percent_change_24h: -1, last_updated: observed }] });
test('CMC v3 listings select explicit USD quotes, preserve null/zero and keep provider identity', () => {
  const row = decodeCmcListings(envelope([listingFixture()]))[0];
  assert.deepEqual(row.asset, { coinmarketcapId: 1 }); assert.equal(row.price, 0); assert.equal(row.fdv, null);
  assert.equal(row.maxSupply, null); assert.equal(row.circulatingSupply, 0); assert.equal(row.change1hPercent, null);
  assert.equal(row.change30dPercent, null); assert.equal(row.sourceUpdatedAt, observed);
  assert.equal(marketAssetKey(row), 'cmc:1'); assert.equal(marketAssetHref(row), '/tokens/cmc/1');
  assert.equal(savedMarketProject(row, [{ ...newProject('Same symbol asset', 'SAME'), coinpaprikaId: 'different-provider-id' }]), undefined);
  const linked = { ...newProject('Bitcoin research', 'SAME'), cmcId: '1' };
  assert.equal(savedMarketProject(row, [linked]), linked);
  for (const rows of [[], [listingFixture(), listingFixture()], [{ ...listingFixture(), id: -1 }], [{ ...listingFixture(), quote: [] }], [{ ...listingFixture(), quote: [...listingFixture().quote, ...listingFixture().quote] }], [{ ...listingFixture(), quote: [{ ...listingFixture().quote[0], symbol: 'EUR' }] }]]) assert.throws(() => decodeCmcListings(envelope(rows)));
});
test('CMC metadata uses exact ID, safe deduplicated links and no investment inference', () => {
  const fixture = envelope({ '1027': { id: 1027, name: 'Ethereum', symbol: 'ETH', slug: 'ethereum', description: '<b>Project</b>',
    tags: ['some-vc-portfolio'], urls: { website: ['https://ethereum.org/', 'https://ethereum.org/', 'javascript:alert(1)', 'https://user:secret@example.com/'], source_code: ['https://github.com/ethereum/'] } } });
  const profile = decodeCmcProfile(fixture, 1027);
  assert.equal(profile.id, 1027); assert.equal(profile.description, 'Project'); assert.equal(profile.listedAt, null);
  assert.equal(profile.sourceUrl, 'https://coinmarketcap.com/currencies/ethereum/'); assert.equal(profile.links.length, 2);
  assert.deepEqual(profile.tags, ['some-vc-portfolio']); assert.equal('investors' in profile, false);
  assert.throws(() => decodeCmcProfile(fixture, 1));
  for (const invalid of ['0', '01', '-1', '1,2', '1e3', 'undefined', '10000000000']) assert.throws(() => cmcId.parse(invalid));
});
test('CMC list/profile requests are bounded and cached; invalid metadata IDs make no request', async () => {
  const requests: string[] = []; let now = Date.parse(observed);
  const runtime = new ProviderRuntime(readConfig({}), (async input => { const url = new URL(String(input)); requests.push(url.href);
    return new Response(JSON.stringify(url.pathname.includes('listings') ? envelope([listingFixture()]) : envelope({ '1': { id: 1, name: 'Bitcoin', symbol: 'BTC', slug: 'bitcoin' } })));
  }) as typeof fetch, () => now);
  const adapter = coinMarketCap(runtime);
  assert.equal((await adapter.listings()).ok, true); assert.equal((await adapter.listings()).ok, true);
  assert.equal(new URL(requests[0]).searchParams.get('limit'), '100'); assert.equal(new URL(requests[0]).searchParams.get('sort'), 'market_cap');
  assert.throws(() => adapter.profile('1,1027')); assert.equal(requests.length, 1);
  now += 1001; assert.equal((await adapter.profile('1')).ok, true); assert.equal((await adapter.profile('1')).ok, true); assert.equal(requests.length, 2);
  now += 300001; assert.equal((await adapter.profile('1')).ok, true); assert.equal(requests.length, 2);
  assert.equal(new URL(requests[1]).searchParams.get('id'), '1');
});
test('CMC outside-top-ten cap requires complete ranks and aligned observations', () => {
  const rows = decodeCmcListings(envelope(Array.from({ length: 10 }, (_, i) => ({ ...listingFixture(i + 1, i + 1), quote: [{ ...listingFixture().quote[0], market_cap: 50 }] }))));
  const global = decodeCmcGlobal(globalFixture);
  assert.equal(structureSummary(global, rows)[3].cap, 500);
  assert.equal(structureSummary(global, rows.slice(0, 9))[3].cap, null);
  assert.equal(structureSummary(global, rows.map(row => ({ ...row, sourceUpdatedAt: '2026-09-27T10:00:00Z' })))[3].cap, null);
});
