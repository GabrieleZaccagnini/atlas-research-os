import type { ChartRow, ViewResult } from '@/lib/bitcoin-cycle';

export type SpecialistView = 'sth-realized-price' | 'etf-flow' | 'hashprice';
export const specialistViews: SpecialistView[] = ['sth-realized-price', 'etf-flow', 'hashprice'];

const fields: Record<SpecialistView, string> = {
  'sth-realized-price': 'sthRealizedPrice',
  'etf-flow': 'etfFlow',
  hashprice: 'hashprice',
};

export function parseSpecialistHistory(input: unknown, view: SpecialistView): ViewResult {
  if (!Array.isArray(input) || input.length > 2500) throw new Error('Invalid specialist history');
  const field = fields[view];
  const unique = new Map<string, ChartRow>();
  for (const item of input) {
    if (!item || typeof item !== 'object' || !('d' in item) || !('unixTs' in item) || !(field in item)) continue;
    const row = item as Record<string, unknown>;
    const date = row.d;
    const value = Number(row[field]);
    const time = Number(row.unixTs);
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      time !== Date.parse(`${date}T00:00:00Z`) / 1000 ||
      !Number.isFinite(value) || (view !== 'etf-flow' && value <= 0)) continue;
    unique.set(date, { date, value });
  }
  const rows = Array.from(unique.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length < 30) throw new Error('Insufficient specialist history');
  const latestDate = rows.at(-1)!.date;
  const daysBehind = Math.max(0, Math.floor((Date.now() - Date.parse(`${latestDate}T00:00:00Z`)) / 86400000));
  return {
    rows,
    firstDate: rows[0].date,
    latestDate,
    note: view === 'etf-flow'
      ? `Daily net ETF flow in BTC. The latest observation is ${daysBehind} calendar day${daysBehind === 1 ? '' : 's'} old; market closures can create gaps. This is not ETF holdings or ETF price performance.`
      : `The free feed withholds approximately seven recent days. Its latest observation is ${daysBehind} calendar day${daysBehind === 1 ? '' : 's'} old; do not read it as today's value.`,
  };
}

export type MarginBucket = { price: number; longUsd: number; shortUsd: number; count: number };
export type MarginCluster = { price: number; side: 'long_liquidated' | 'short_liquidated'; estimatedUsd: number };
export type MarginEvent = { time: number; exchange: string; side: 'long_liquidated' | 'short_liquidated'; price: number; notionalUsd: number };

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const positive = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const side = (value: unknown): value is MarginCluster['side'] => value === 'long_liquidated' || value === 'short_liquidated';

export function parseMarginRecent(input: unknown): { updatedAt: number; buckets: MarginBucket[] } {
  if (!isRecord(input) || input.symbol !== 'BTC' || input.minutes !== 1440 || !positive(input.updatedAt) || !Array.isArray(input.buckets) || input.buckets.length > 2000) throw new Error('Invalid observed liquidation profile');
  const buckets = input.buckets.flatMap((item: unknown) => {
    if (!isRecord(item) || !positive(item.price) || !nonnegative(item.long) || !nonnegative(item.short) || !nonnegative(item.count)) return [];
    return [{ price: item.price as number, longUsd: item.long as number, shortUsd: item.short as number, count: item.count as number }];
  }).sort((a, b) => a.price - b.price);
  return { updatedAt: input.updatedAt as number, buckets };
}

export function parseMarginClusters(input: unknown): { updatedAt: number; clusters: MarginCluster[] } {
  if (!isRecord(input) || input.symbol !== 'BTC' || input.model !== true || !positive(input.updatedAt) || !Array.isArray(input.clusters) || input.clusters.length > 5000) throw new Error('Invalid modeled liquidation clusters');
  const clusters = input.clusters.flatMap((item: unknown) => {
    if (!isRecord(item) || !positive(item.price) || !side(item.side) || !nonnegative(item.est_notional)) return [];
    return [{ price: item.price as number, side: item.side, estimatedUsd: item.est_notional as number }];
  });
  return { updatedAt: input.updatedAt as number, clusters };
}

export function parseMarginEvents(input: unknown): MarginEvent[] {
  if (!isRecord(input) || input.symbol !== 'BTC' || !Array.isArray(input.events) || input.events.length > 1000) throw new Error('Invalid observed liquidation events');
  return input.events.flatMap((item: unknown) => {
    if (!isRecord(item) || item.symbol !== 'BTC' || !positive(item.ts) || typeof item.exchange !== 'string' || !/^[a-z0-9_-]{2,24}$/i.test(item.exchange) || !side(item.side) || !positive(item.price) || !positive(item.notional)) return [];
    return [{ time: item.ts as number, exchange: item.exchange, side: item.side, price: item.price as number, notionalUsd: item.notional as number }];
  }).sort((a, b) => b.time - a.time);
}
