import { z } from 'zod';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { ProviderRuntime } from '../core/runtime';
import { ProviderError } from '../core/errors';
import { newsSources, type NewsSourceId, macroSeries, type MacroId, type MacroSeries, type ChainSnapshot, type RevenueRow, type StablecoinSupply, type Sentiment, type NewsItem, type DexActivity, type TrendingCoin } from './types';
const n = z.number().finite().nullish().transform(v => v ?? null);
const positive = z.number().finite().nonnegative().nullish().transform(v => v ?? null);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
const invalid = () => new ProviderError('invalid_response', 'Provider returned an unexpected data format');
export function decodeFred(raw: unknown, id: MacroId): MacroSeries {
  if (typeof raw !== 'string') throw invalid();
  const lines = raw.trim().split(/\r?\n/);
  if (lines.shift()?.replace(/^\uFEFF/, '') !== `observation_date,${id}`) throw invalid();
  const points = lines.flatMap(line => {
    const [date, value, extra] = line.split(',');
    if (extra !== undefined || !day.safeParse(date).success) throw invalid();
    if (!value?.trim() || value.trim() === '.') return [];
    const number = Number(value); if (!Number.isFinite(number)) throw invalid();
    return [{ date, value: number }];
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (!points.length || new Set(points.map(p => p.date)).size !== points.length) throw invalid();
  return { id, points };
}
export function decodeChains(raw: unknown): ChainSnapshot[] {
  return z.array(z.object({ name: z.string().min(1), tvl: positive })).min(1).max(2000).parse(raw)
    .map(c => ({ name: c.name, tvlUsd: c.tvl })).sort((a, b) => (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1));
}
export function decodeRevenue(raw: unknown): RevenueRow[] {
  const rows = z.object({ protocols: z.array(z.object({ name: z.string(), slug: z.string(), category: z.string().nullish(), protocolType: z.string().nullish(), total24h: n, total7d: n, change_1d: n })).max(10000) }).parse(raw);
  return rows.protocols.map(p => ({ name: p.name, slug: p.slug, category: p.category ?? null, kind: p.protocolType ?? null, revenue24h: p.total24h, revenue7d: p.total7d, change24h: p.change_1d })).sort((a, b) => (b.revenue24h ?? -Infinity) - (a.revenue24h ?? -Infinity));
}
export function decodeStablecoins(raw: unknown): StablecoinSupply {
  const rows = z.array(z.object({ date: z.string().regex(/^\d+$/), totalCirculatingUSD: z.record(z.number().finite().nonnegative()) })).min(1).max(20000).parse(raw);
  const points = rows.filter(r => Object.keys(r.totalCirculatingUSD).length).map(r => ({ date: day.parse(new Date(Number(r.date) * 1000).toISOString().slice(0, 10)), value: Object.values(r.totalCirculatingUSD).reduce((sum, n) => sum + n, 0) })).sort((a, b) => a.date.localeCompare(b.date));
  if (!points.length || new Set(points.map(p => p.date)).size !== points.length) throw invalid();
  return { points: points.slice(-365) };
}
export function decodeSentiment(raw: unknown): Sentiment {
  const rows = z.object({ data: z.array(z.object({ value: z.string().regex(/^\d+$/), value_classification: z.string(), timestamp: z.string().regex(/^\d+$/) })).min(1).max(366) }).parse(raw);
  return { points: rows.data.map(p => ({ date: day.parse(new Date(Number(p.timestamp) * 1000).toISOString().slice(0, 10)), value: z.number().min(0).max(100).parse(Number(p.value)), label: p.value_classification })).sort((a, b) => a.date.localeCompare(b.date)) };
}
function headlineText(value: string) {
  const named: Record<string, string> = { amp: '&', quot: '\"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&#(\d+);|&#x([0-9a-f]+);|&(amp|quot|apos|lt|gt);/gi, (all, decimal, hex, name) => {
    if (name) return named[name.toLowerCase()];
    const code = parseInt(decimal || hex, decimal ? 10 : 16);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : all;
  }).replace(/<[^>]*>/g, '').trim().slice(0, 400);
}
export function decodeNews(raw: unknown, source: NewsItem['source']): NewsItem[] {
  if (typeof raw !== 'string' || /<!DOCTYPE|<!ENTITY/i.test(raw) || XMLValidator.validate(raw) !== true) throw invalid();
  const parsed = new XMLParser({ parseTagValue: false, ignoreAttributes: true }).parse(raw);
  if (!parsed?.rss?.channel) throw invalid();
  const items = parsed.rss.channel.item ?? [];
  const list = Array.isArray(items) ? items : [items];
  const seen = new Set<string>();
  const host = Object.values(newsSources).find(s => s.name === source)!.host;
  return list.slice(0, 200).flatMap((item: Record<string, unknown>) => {
    if (typeof item.title !== 'string' || typeof item.link !== 'string' || typeof item.pubDate !== 'string') return [];
    let url: URL; try { url = new URL(item.link.trim()); } catch { return []; }
    if (url.protocol !== 'https:' || url.username || url.password || !(url.hostname === host || url.hostname === `www.${host}`) || !Number.isFinite(Date.parse(item.pubDate))) return [];
    url.pathname = url.pathname.replace(/\/{2,}/g, '/'); url.hash = ''; for (const key of Array.from(url.searchParams.keys())) if (key.startsWith('utm_')) url.searchParams.delete(key);
    if (seen.has(url.href)) return []; seen.add(url.href);
    const categories = Array.isArray(item.category) ? item.category : [item.category];
    return [{ title: headlineText(item.title), url: url.href, publishedAt: new Date(item.pubDate).toISOString(), source, categories: categories.filter((v): v is string => typeof v === 'string').slice(0, 10) }];
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function intelligenceAdapters(runtime: ProviderRuntime) {
  return {
    macro(id: MacroId) {
      if (!(id in macroSeries)) throw new Error('Unknown macro series');
      const start = new Date(); start.setUTCFullYear(start.getUTCFullYear() - 2);
      return runtime.query('fred', 'graph/fredgraph.csv', { id, cosd: start.toISOString().slice(0, 10) }, 3600000, raw => decodeFred(raw, id), 'text');
    },
    trending: () => runtime.query<TrendingCoin[]>('coingecko-public', 'search/trending', {}, 900000, raw => {
      const rows = z.object({ coins: z.array(z.object({ item: z.object({ id: z.string().regex(/^[a-z0-9_-]+$/), name: z.string(), symbol: z.string(), market_cap_rank: positive, data: z.object({ price: positive, price_change_percentage_24h: z.object({ usd: n }).nullish() }).nullish() }) })).max(50) }).parse(raw);
      return rows.coins.map(({ item: p }) => ({ id: p.id, name: p.name, symbol: p.symbol, rank: p.market_cap_rank, price: p.data?.price ?? null, change24h: p.data?.price_change_percentage_24h?.usd ?? null }));
    }),
    chains: () => runtime.query('defillama', 'v2/chains', {}, 900000, decodeChains),
    revenue: () => runtime.query('defillama', 'overview/fees', { excludeTotalDataChart: 'true', excludeTotalDataChartBreakdown: 'true', dataType: 'dailyRevenue' }, 3600000, decodeRevenue),
    dexActivity: () => runtime.query<DexActivity>('defillama', 'overview/dexs', { excludeTotalDataChart: 'true', excludeTotalDataChartBreakdown: 'true' }, 900000, raw => {
      const d = z.object({ total24h: positive, change_1d: n, protocols: z.array(z.object({ name: z.string(), total24h: positive })).max(10000) }).parse(raw);
      return { volume24h: d.total24h, change24h: d.change_1d, venues: d.protocols.map(p => ({ name: p.name, volume24h: p.total24h })).sort((a, b) => (b.volume24h ?? -1) - (a.volume24h ?? -1)) };
    }),
    stablecoins: () => runtime.query('llama-stablecoins', 'stablecoincharts/all', {}, 3600000, decodeStablecoins),
    sentiment: () => runtime.query('alternative', 'fng/', { limit: '30' }, 3600000, decodeSentiment),
    news: (source: NewsSourceId) => {
      const meta = newsSources[source];
      return runtime.query(source, meta.path, source === 'coindesk' ? { outputType: 'xml' } : {}, meta.category === 'crypto' ? 300000 : 1800000, raw => decodeNews(raw, meta.name), 'text');
    },
  };
}
