import type { GlobalMarket, MarketQuote, CmcPerformance } from '../services/core/types';
import type { ResearchProject } from './projects';
import type { SeriesPoint } from '../services/intelligence/types';
export type MarketView = 'leaders' | 'gainers' | 'losers' | 'volume';
export function marketRows<T extends MarketQuote>(quotes: T[], view: MarketView, query = '') {
  const term = query.trim().toLowerCase();
  let rows = quotes.filter(q => !term || `${q.name} ${q.symbol}`.toLowerCase().includes(term));
  if (view === 'gainers' || view === 'losers') rows = rows.filter(q => q.rank !== null && q.rank <= 200 && (q.volume24h ?? 0) >= 1000000 && q.change24hPercent !== null && (view === 'gainers' ? q.change24hPercent > 0 : q.change24hPercent < 0));
  return rows.slice().sort((a, b) => view === 'leaders' ? (a.rank ?? Infinity) - (b.rank ?? Infinity) : view === 'volume' ? (b.volume24h ?? -1) - (a.volume24h ?? -1) : view === 'gainers' ? b.change24hPercent! - a.change24hPercent! : a.change24hPercent! - b.change24hPercent!);
}
export function periodChange(points: SeriesPoint[], days: number): number | null {
  const last = points[points.length - 1]; if (!last) return null;
  const target = Date.parse(last.date) - days * 86400000;
  // Require the exact reference day; a missing observation must not shorten the interval.
  const previous = points.find(p => Date.parse(p.date) === target);
  return previous && previous.value > 0 ? (last.value / previous.value - 1) * 100 : null;
}
export function portfolioRows(projects: ResearchProject[], quotes: MarketQuote[]) {
  const byId = new Map(quotes.map(q => [q.asset.coinpaprikaId, q]));
  return projects.filter(p => p.status !== 'Archived' && (p.position !== null ? Number(p.position.quantity) > 0 : ['Owned', 'Taking Profit'].includes(p.status))).map(project => {
    const quote = byId.get(project.coinpaprikaId);
    const quantity = project.position ? Number(project.position.quantity) : null;
    const avgCost = project.position?.averageCostUsd === null || project.position == null ? null : Number(project.position.averageCostUsd);
    const value = quantity !== null && quote?.price != null ? quantity * quote.price : null;
    const cost = quantity !== null && avgCost !== null ? quantity * avgCost : null;
    return { project, quote, quantity, value, cost, unrealized: value !== null && cost !== null ? value - cost : null };
  });
}


export interface MarketRow extends MarketQuote {
  change4hPercent?: number | null; change12hPercent?: number | null;
  change1hBtcPercent?: number | null; change24hBtcPercent?: number | null;
}
export type MarketSort = 'rank' | 'name' | 'price' | 'change1hPercent' | 'change4hPercent' | 'change12hPercent' | 'change24hPercent' | 'change7dPercent' | 'marketCap' | 'volume24h' | 'change1hBtcPercent' | 'change24hBtcPercent';
export interface MarketRange { metric: Exclude<MarketSort, 'name'>; min: string; max: string }
export function rangeValue(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value); return Number.isFinite(n) ? n : NaN;
}
export function invalidRange(range: MarketRange): boolean {
  const min = rangeValue(range.min), max = rangeValue(range.max);
  return (min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max)) || (min !== null && max !== null && min > max);
}
export function filterMarketRows<T extends MarketRow>(rows: T[], minimumCap: number, minimumVolume: number, sort: MarketSort | null, descending: boolean, ranges: MarketRange[] = []): T[] {
  const filtered = rows.filter(q => (!minimumCap || (q.marketCap !== null && q.marketCap >= minimumCap)) && (!minimumVolume || (q.volume24h !== null && q.volume24h >= minimumVolume)) && ranges.every(range => {
    if (invalidRange(range)) return false;
    const min = rangeValue(range.min), max = rangeValue(range.max);
    if (min === null && max === null) return true;
    const value = q[range.metric];
    return value != null && Number.isFinite(value) && (min === null || value >= min) && (max === null || value <= max);
  }));
  if (!sort) return filtered;
  return filtered.sort((a, b) => {
    const av = a[sort], bv = b[sort];
    // Optional/missing values stay last in either direction.
    if (av == null) return bv == null ? 0 : 1;
    if (bv == null) return -1;
    const comparison = typeof av === 'string' ? av.localeCompare(String(bv)) : av - Number(bv);
    return descending ? -comparison : comparison;
  });
}
export function marketMetrics(quotes: MarketQuote[], performance?: CmcPerformance | null): MarketRow[] {
  const btc = quotes.find(q => q.asset.coinmarketcapId === 1 || q.asset.coinpaprikaId === 'btc-bitcoin');
  const history = new Map(performance?.rows.map(row => [row.id, row]) ?? []);
  return quotes.map(q => {
    const sameProvider = btc && (q.asset.coinmarketcapId !== undefined ? btc.asset.coinmarketcapId === 1 : btc.asset.coinpaprikaId === 'btc-bitcoin');
    const aligned = sameProvider && q.sourceUpdatedAt && btc.sourceUpdatedAt && Math.abs(Date.parse(q.sourceUpdatedAt) - Date.parse(btc.sourceUpdatedAt)) <= 300000;
    const relative = (value: number | null | undefined, benchmark: number | null | undefined) => {
      if (!aligned || value == null || benchmark == null || value < -100 || benchmark <= -100) return null;
      const result = ((1 + value / 100) / (1 + benchmark / 100) - 1) * 100;
      return Number.isFinite(result) ? result : null;
    };
    const h = q.asset.coinmarketcapId !== undefined ? history.get(q.asset.coinmarketcapId) : undefined;
    const historyAligned = h?.observedAt && q.sourceUpdatedAt && Math.abs(Date.parse(h.observedAt) - Date.parse(q.sourceUpdatedAt)) <= 300000;
    return { ...q, change1hBtcPercent: relative(q.change1hPercent, btc?.change1hPercent), change24hBtcPercent: relative(q.change24hPercent, btc?.change24hPercent), change4hPercent: historyAligned ? h!.change4hPercent : null, change12hPercent: historyAligned ? h!.change12hPercent : null };
  });
}
export function structureSummary(global: GlobalMarket | null, quotes: MarketQuote[]) {
  const total = global?.marketCap ?? null;
  const positiveTotal = total !== null && total > 0;
  const dominance = global?.btcDominancePercent ?? null;
  const exBtc = positiveTotal && dominance !== null ? total * (1 - dominance / 100) : null;
  const alignedCap = (q: MarketQuote | undefined): number | null => {
    if (!q || q.marketCap === null || !q.sourceUpdatedAt || !global?.sourceUpdatedAt) return null;
    const gap = Math.abs(Date.parse(q.sourceUpdatedAt) - Date.parse(global.sourceUpdatedAt));
    return Number.isFinite(gap) && gap <= 600000 ? q.marketCap : null;
  };
  const eth = positiveTotal && global?.ethDominancePercent != null ? total * global.ethDominancePercent / 100 : alignedCap(quotes.find(q => q.asset.coinpaprikaId === 'eth-ethereum'));
  // Callers only supply quotes from the global provider's own universe.
  const top10 = Array.from({ length: 10 }, (_, i) => quotes.filter(q => q.rank === i + 1));
  const topCaps = top10.map(rows => rows.length === 1 ? alignedCap(rows[0]) : null);
  const subtract = (value: number | null, excluded: number | null) => value !== null && excluded !== null && excluded <= value ? value - excluded : null;
  const outside10 = positiveTotal && topCaps.every(c => c !== null) ? subtract(total, topCaps.reduce<number>((sum, c) => sum + c!, 0)) : null;
  return [
    { label: 'All crypto', cap: total, share: positiveTotal ? 100 : null, change: global?.marketCapChange24hPercent ?? null, estimated: false },
    { label: 'Excl. Bitcoin', cap: exBtc, share: positiveTotal && exBtc !== null ? exBtc / total * 100 : null, change: null, estimated: true },
    { label: 'Excl. BTC & ETH', cap: subtract(exBtc, eth), share: positiveTotal && subtract(exBtc, eth) !== null ? subtract(exBtc, eth)! / total * 100 : null, change: null, estimated: true },
    { label: 'Outside top 10', cap: outside10, share: positiveTotal && outside10 !== null ? outside10 / total * 100 : null, change: null, estimated: true },
  ];
}

export function marketAssetKey(quote: MarketQuote): string {
  return quote.asset.coinmarketcapId !== undefined ? `cmc:${quote.asset.coinmarketcapId}` : `paprika:${quote.asset.coinpaprikaId ?? ''}`;
}
export function marketAssetHref(quote: MarketQuote): string {
  return quote.asset.coinmarketcapId !== undefined ? `/tokens/cmc/${quote.asset.coinmarketcapId}` : `/markets?asset=${encodeURIComponent(quote.asset.coinpaprikaId ?? '')}`;
}
export function savedMarketProject(quote: MarketQuote, projects: ResearchProject[]): ResearchProject | undefined {
  return quote.asset.coinmarketcapId !== undefined ? projects.find(p => p.cmcId === String(quote.asset.coinmarketcapId)) : quote.asset.coinpaprikaId ? projects.find(p => p.coinpaprikaId === quote.asset.coinpaprikaId) : undefined;
}
