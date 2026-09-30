import type { MarketSort } from './market-dashboard';
export interface MarketColumn { key: Exclude<MarketSort, 'name'>; label: string; kind: 'number' | 'price' | 'money' | 'change' }
export const marketColumns: MarketColumn[] = [
  { key: 'rank', label: '#', kind: 'number' }, { key: 'price', label: 'Price', kind: 'price' },
  { key: 'change1hPercent', label: '1h %', kind: 'change' }, { key: 'change4hPercent', label: '4h %', kind: 'change' }, { key: 'change12hPercent', label: '12h %', kind: 'change' },
  { key: 'change24hPercent', label: '24h %', kind: 'change' }, { key: 'change7dPercent', label: '7d %', kind: 'change' },
  { key: 'marketCap', label: 'Market cap', kind: 'money' }, { key: 'volume24h', label: 'Volume (24h)', kind: 'money' },
  { key: 'change1hBtcPercent', label: '1h % in BTC', kind: 'change' }, { key: 'change24hBtcPercent', label: '24h % in BTC', kind: 'change' },
];
export const defaultMarketColumns = marketColumns.filter(c => !['change1hBtcPercent', 'change24hBtcPercent'].includes(c.key)).map(c => c.key);
export function validMarketColumns(raw: unknown): typeof defaultMarketColumns | null {
  return Array.isArray(raw) && raw.length > 0 && raw.length <= marketColumns.length && new Set(raw).size === raw.length && raw.every(key => marketColumns.some(c => c.key === key)) ? raw : null;
}
export const unavailableMarketColumns = [
  { label: 'Sentiment', reason: 'Token sentiment feed is not connected.' },
  { label: 'Mindshare', reason: 'CMC token mindshare is not available in our connected feed.' },
  { label: '7d mini-chart', reason: 'Seven-day price history is not connected to the table.' },
  { label: 'YTD %', reason: 'A January 1 UTC price baseline is not connected.' },
];
