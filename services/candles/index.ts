import { z } from 'zod';
import { chartMarkets, chartIntervals, chartDatasetSchema, intervalMs, type ChartMarket, type ChartInterval } from '../../lib/chart-plans';
import type { ProviderRuntime } from '../core/runtime';
const numeric = z.string().regex(/^\d+(\.\d+)?$/).transform(Number).pipe(z.number().finite());
const row = z.tuple([z.number().int().nonnegative(),numeric,numeric,numeric,numeric,numeric,z.number().int().nonnegative()]).rest(z.unknown());
export function decodeCandles(value: unknown, market: ChartMarket, interval: ChartInterval, now = Date.now()) {
  const rows = z.array(row).min(1).max(500).parse(value);
  const candles = rows.map(r => ({time:r[0],open:r[1],high:r[2],low:r[3],close:r[4],volume:r[5],closeTime:r[6]}));
  if (candles.some(c => c.closeTime-c.time !== intervalMs[interval]-1 || c.time > now)) throw Error('Unexpected candle time');
  return chartDatasetSchema.parse({market,interval,source:'Binance spot',quote:'USDT',candles:candles.filter(c => c.closeTime < now)});
}
export function createCandleService(runtime: ProviderRuntime) {
  return { get(market: unknown, interval: unknown) {
    const m = z.enum(chartMarkets).parse(market); const i = z.enum(chartIntervals).parse(interval);
    return runtime.query('binance','api/v3/klines',{symbol:m,interval:i,limit:'500'},60000,raw => decodeCandles(raw,m,i));
  }};
}
