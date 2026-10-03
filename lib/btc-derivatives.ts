export type OpenInterestPoint = { time: number; btc: number; usdt: number };
export type FundingPoint = { time: number; rate: number };
export type CurrentOpenInterest = { time: number; btc: number };

export type BtcDerivatives = {
  source: 'Binance USDⓈ-M Futures';
  symbol: 'BTCUSDT';
  fetchedAt: string;
  currentOpenInterest: CurrentOpenInterest | null;
  openInterestHistory: OpenInterestPoint[];
  fundingHistory: FundingPoint[];
  unavailable: string[];
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function number(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function timestamp(value: unknown): number | null {
  const parsed = number(value);
  return parsed !== null && Number.isInteger(parsed) && parsed >= Date.UTC(2019, 0, 1) && parsed < Date.UTC(2100, 0, 1) ? parsed : null;
}

export function parseCurrentOpenInterest(value: unknown): CurrentOpenInterest {
  const row = record(value);
  const time = timestamp(row?.time);
  const btc = number(row?.openInterest);
  if (row?.symbol !== 'BTCUSDT' || time === null || btc === null || btc < 0) throw new Error('Invalid current open interest');
  return { time, btc };
}

export function parseOpenInterestHistory(value: unknown): OpenInterestPoint[] {
  if (!Array.isArray(value)) throw new Error('Invalid open-interest history');
  const points = value.flatMap(item => {
    const row = record(item);
    const time = timestamp(row?.timestamp);
    const btc = number(row?.sumOpenInterest);
    const usdt = number(row?.sumOpenInterestValue);
    return row?.symbol === 'BTCUSDT' && time !== null && btc !== null && btc >= 0 && usdt !== null && usdt >= 0 ? [{ time, btc, usdt }] : [];
  });
  if (!points.length || points.length > 500) throw new Error('Empty open-interest history');
  return Array.from(new Map(points.map(point => [point.time, point])).values()).sort((a, b) => a.time - b.time);
}

export function parseFundingHistory(value: unknown): FundingPoint[] {
  if (!Array.isArray(value)) throw new Error('Invalid funding history');
  const points = value.flatMap(item => {
    const row = record(item);
    const time = timestamp(row?.fundingTime);
    const rate = number(row?.fundingRate);
    return row?.symbol === 'BTCUSDT' && time !== null && rate !== null && Math.abs(rate) <= 1 ? [{ time, rate }] : [];
  });
  if (!points.length || points.length > 500) throw new Error('Empty funding history');
  return Array.from(new Map(points.map(point => [point.time, point])).values()).sort((a, b) => a.time - b.time);
}
