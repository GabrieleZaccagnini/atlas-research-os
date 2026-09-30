import { z } from 'zod';
import type { ProviderRuntime } from '../core/runtime';
import type { GlobalMarket, MarketQuote, CmcProfile, CmcPerformance, ServiceResult } from '../core/types';
import type { CmcSentiment, AltcoinSeason } from '../intelligence/types';
import { ProviderError } from '../core/errors';
const nullable = z.number().finite().nullish().transform(v => v ?? null);
const positive = z.number().finite().nonnegative().nullish().transform(v => v ?? null);
const dominance = z.number().finite().min(0).max(100).nullish().transform(v => v ?? null);
const timestamp = z.string().datetime({ offset: true });
function envelope(raw: unknown): unknown {
  const response = z.object({ status: z.object({ error_code: z.union([z.number(), z.string().regex(/^\d+$/)]) }), data: z.unknown() }).parse(raw);
  if (Number(response.status.error_code) !== 0) throw new ProviderError('upstream', 'CoinMarketCap returned an API error');
  return response.data;
}
export function decodeCmcGlobal(raw: unknown): GlobalMarket {
  const d = z.object({ btc_dominance: dominance, eth_dominance: dominance, last_updated: timestamp, quote: z.object({ USD: z.object({ total_market_cap: positive, total_volume_24h: positive, derivatives_volume_24h: positive, total_market_cap_yesterday_percentage_change: nullable, total_volume_24h_yesterday_percentage_change: nullable, last_updated: timestamp }) }) }).parse(envelope(raw));
  const q = d.quote.USD;
  return { currency: 'USD', marketCap: q.total_market_cap, volume24h: q.total_volume_24h, btcDominancePercent: d.btc_dominance, ethDominancePercent: d.eth_dominance, marketCapChange24hPercent: q.total_market_cap_yesterday_percentage_change, volumeChange24hPercent: q.total_volume_24h_yesterday_percentage_change, derivativesVolume24h: q.derivatives_volume_24h, sourceUpdatedAt: q.last_updated };
}
export function decodeCmcSentiment(raw: unknown): CmcSentiment {
  const d = z.object({ value: z.number().finite().min(0).max(100), value_classification: z.string().min(1).max(100), update_time: timestamp }).parse(envelope(raw));
  return { value: d.value, label: d.value_classification, observedAt: d.update_time };
}
export function decodeAltcoinSeason(raw: unknown): AltcoinSeason {
  const d = z.object({ altcoin_index: z.number().finite().min(0).max(100), snapshot_time: timestamp, yearly_high: dominance, yearly_low: dominance }).parse(envelope(raw));
  return { value: d.altcoin_index, observedAt: d.snapshot_time, yearlyHigh: d.yearly_high, yearlyLow: d.yearly_low };
}
export const cmcId = z.string().regex(/^[1-9]\d{0,9}$/).transform(Number).refine(Number.isSafeInteger);
const usdQuote = z.object({
  symbol: z.literal('USD'), price: positive, market_cap: positive, fully_diluted_market_cap: positive,
  volume_24h: positive, percent_change_1h: nullable, percent_change_24h: nullable,
  percent_change_7d: nullable, percent_change_30d: nullable, last_updated: timestamp,
});
export function decodeCmcListings(raw: unknown): MarketQuote[] {
  const rows = z.array(z.object({
    id: z.number().int().positive().max(9999999999), name: z.string().min(1).max(200), symbol: z.string().min(1).max(100),
    cmc_rank: z.number().int().positive().nullish(), circulating_supply: positive, total_supply: positive, max_supply: positive,
    quote: z.array(z.unknown()).min(1).max(10),
  })).min(1).max(100).parse(envelope(raw));
  if (new Set(rows.map(r => r.id)).size !== rows.length) throw new ProviderError('invalid_response', 'CoinMarketCap returned duplicate asset IDs');
  return rows.map(row => {
    const usd = row.quote.filter(q => q !== null && typeof q === 'object' && 'symbol' in q && q.symbol === 'USD');
    if (usd.length !== 1) throw new ProviderError('invalid_response', 'CoinMarketCap returned ambiguous USD quotes');
    const q = usdQuote.parse(usd[0]);
    return { asset: { coinmarketcapId: row.id }, name: row.name, symbol: row.symbol, currency: 'USD',
      price: q.price, marketCap: q.market_cap, fdv: q.fully_diluted_market_cap, volume24h: q.volume_24h,
      rank: row.cmc_rank ?? null, circulatingSupply: row.circulating_supply, totalSupply: row.total_supply, maxSupply: row.max_supply,
      change1hPercent: q.percent_change_1h, change24hPercent: q.percent_change_24h, change7dPercent: q.percent_change_7d,
      change30dPercent: q.percent_change_30d, sourceUpdatedAt: q.last_updated };
  });
}
function safeLink(value: string): string | null {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function decodeCmcProfile(raw: unknown, id: number): CmcProfile {
  const map = z.record(z.unknown()).parse(envelope(raw));
  const row = z.object({ id: z.literal(id), name: z.string().min(1).max(200), symbol: z.string().min(1).max(100), slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
    description: z.string().max(30000).nullish(), date_added: timestamp.nullish(),
    urls: z.record(z.array(z.string().max(2000)).max(100)).nullish(),
    tags: z.array(z.string().max(200)).max(500).nullish(),
  }).parse(map[String(id)]);
  const labels: Record<string, string> = { website: 'Website', twitter: 'X', reddit: 'Reddit', technical_doc: 'Whitepaper / docs', source_code: 'Source code', explorer: 'Explorer', chat: 'Chat', message_board: 'Community', announcement: 'Announcement' };
  const links = Object.entries(labels).flatMap(([key, label]) => (row.urls?.[key] ?? []).flatMap(value => { const url = safeLink(value); return url ? [{ label, url }] : []; }));
  return { id, name: row.name, symbol: row.symbol, description: (row.description ?? '').replace(/<[^>]*>/g, ''),
    listedAt: row.date_added ?? null, sourceUrl: `https://coinmarketcap.com/currencies/${row.slug}/`,
    links: Array.from(new Map(links.map(link => [link.url, link])).values()).slice(0, 50), tags: row.tags ?? [] };
}
// Four same-source quotes cover the present, 4h, 8h and 12h anchors.
export function decodeCmcPerformance(raw: unknown, ids: number[], anchorAt: string): CmcPerformance {
  const map = z.record(z.unknown()).parse(envelope(raw));
  const expected = new Set(ids.map(String));
  if (Object.keys(map).some(key => !expected.has(key))) throw new ProviderError('invalid_response', 'Unexpected historical asset ID');
  const pricePoint = z.object({ price: positive, timestamp: timestamp.nullish(), last_updated: timestamp.nullish() });
  const rows = ids.map(id => {
    if (map[String(id)] === undefined) return { id, change4hPercent: null, change12hPercent: null, observedAt: null, baseline4hAt: null, baseline12hAt: null };
    const asset = z.object({ id: z.literal(id), quotes: z.array(z.object({ timestamp, quote: z.unknown() })).max(4) }).parse(map[String(id)]);
    const points = asset.quotes.map(point => {
      let usd: unknown;
      if (Array.isArray(point.quote)) {
        const matches = point.quote.filter(q => q && q.symbol === 'USD');
        if (matches.length !== 1) throw new ProviderError('invalid_response', 'Ambiguous historical USD quote');
        usd = matches[0];
      } else usd = z.object({ USD: z.unknown() }).parse(point.quote).USD;
      const q = pricePoint.parse(usd); const date = q.timestamp ?? q.last_updated ?? point.timestamp;
      return { date, time: Date.parse(date), price: q.price };
    });
    if (new Set(points.map(p => p.time)).size !== points.length || points.some(p => p.time > Date.parse(anchorAt) + 60000)) throw new ProviderError('invalid_response', 'Invalid historical observation times');
    const near = (target: number) => points.slice().sort((a, b) => Math.abs(a.time - target) - Math.abs(b.time - target)).find(p => Math.abs(p.time - target) <= 300000);
    const last = near(Date.parse(anchorAt));
    const change = (hours: number) => {
      const base = last && near(last.time - hours * 3600000);
      const value = last?.price != null && base?.price != null && base.price > 0 ? (last.price / base.price - 1) * 100 : null;
      return { value: value !== null && Number.isFinite(value) ? value : null, date: base?.date ?? null };
    };
    const four = change(4), twelve = change(12);
    return { id, change4hPercent: four.value, change12hPercent: twelve.value, observedAt: last?.date ?? null, baseline4hAt: four.date, baseline12hAt: twelve.date };
  });
  return { anchorAt, rows };
}
export function coinMarketCap(runtime: ProviderRuntime) {
  const listings = () => runtime.query('coinmarketcap', 'v3/cryptocurrency/listings/latest', { start: '1', limit: '100', convert: 'USD', sort: 'market_cap' }, 300000, decodeCmcListings);
  return {
    listings,
    async performance(): Promise<ServiceResult<CmcPerformance>> {
      const disabled = runtime.status().find(s => s.id === 'coinmarketcap')?.state === 'disabled';
      if (disabled || !runtime.hasApiKey('coinmarketcap')) return { ok: false, data: null, provider: 'coinmarketcap', error: { code: disabled ? 'disabled' : 'missing_key', message: disabled ? 'CMC is disabled.' : '4h and 12h changes need a CMC API key with historical-price access.' } };
      const latest = await listings();
      if (!latest.ok) return latest;
      const dates = latest.data.flatMap(q => q.sourceUpdatedAt ? [Date.parse(q.sourceUpdatedAt)] : []);
      if (!dates.length) return { ok: false, data: null, provider: 'coinmarketcap', error: { code: 'invalid_response', message: 'CMC quote timestamps unavailable.' } };
      // A fixed five-minute anchor shares the request/cache across all table instances.
      const anchorAt = new Date(Math.floor(Math.max(...dates) / 300000) * 300000).toISOString();
      const ids = latest.data.map(q => q.asset.coinmarketcapId!);
      return runtime.query('coinmarketcap', 'v3/cryptocurrency/quotes/historical', { id: ids.join(','), time_end: anchorAt, interval: '4h', count: '4', convert: 'USD' }, 300000, raw => decodeCmcPerformance(raw, ids, anchorAt));
    },
    profile: (id: string) => { const parsed = cmcId.parse(id); return runtime.query('coinmarketcap', 'v2/cryptocurrency/info', { id: String(parsed) }, 86400000, raw => decodeCmcProfile(raw, parsed)); },
    global: () => runtime.query('coinmarketcap', 'v1/global-metrics/quotes/latest', { convert: 'USD' }, 600000, decodeCmcGlobal),
    sentiment: () => runtime.query('coinmarketcap', 'v3/fear-and-greed/latest', {}, 900000, decodeCmcSentiment),
    altseason: () => runtime.query('coinmarketcap', 'v1/altcoin-season-index/latest', {}, 900000, decodeAltcoinSeason),
  };
}
// Lazy fallback keeps a single global universe. Never merge fields from two providers.
export async function preferredGlobal(primary: () => Promise<ServiceResult<GlobalMarket>>, fallback: () => Promise<ServiceResult<GlobalMarket>>): Promise<ServiceResult<GlobalMarket>> {
  const result = await primary();
  if (result.ok) return result;
  const secondary = await fallback();
  return secondary.ok ? { ...secondary, warning: { ...secondary.warning, code: result.error.code, message: `CoinMarketCap unavailable; using CoinPaprika. ${secondary.warning?.message ?? ''}`.trim(), ...(result.error.retryAt ? { retryAt: result.error.retryAt } : {}) } } : result;
}
