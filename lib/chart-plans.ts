import { z } from 'zod';
export const chartMarkets = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'LINKUSDT'] as const;
export const chartIntervals = ['1h', '4h', '1d', '1w'] as const;
export type ChartMarket = typeof chartMarkets[number];
export type ChartInterval = typeof chartIntervals[number];
export const intervalMs: Record<ChartInterval, number> = { '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000 };
const time = z.number().int().min(0).max(4102444800000);
const price = z.number().finite().positive().max(1e12);
export const candleSchema = z.object({ time, closeTime: time, open: price, high: price, low: price, close: price, volume: z.number().finite().nonnegative() }).refine(c => c.high >= Math.max(c.open, c.close, c.low) && c.low <= Math.min(c.open, c.close) && c.closeTime > c.time, 'Invalid candle');
export type Candle = z.infer<typeof candleSchema>;
export const chartDatasetSchema = z.object({ market: z.enum(chartMarkets), interval: z.enum(chartIntervals), source: z.literal('Binance spot'), quote: z.literal('USDT'), candles: z.array(candleSchema).min(1).max(500) }).superRefine((d, ctx) => {
  d.candles.forEach((c, i) => { if (i && c.time - d.candles[i - 1].time !== intervalMs[d.interval]) ctx.addIssue({code:'custom',message:'Candle history is unordered or has a gap'}); });
});
export type ChartDataset = z.infer<typeof chartDatasetSchema>;
const point = z.object({ time, price });
export const drawingSchema = z.object({ id: z.string().uuid(), kind: z.enum(['level', 'trend', 'note']), label: z.string().max(120), a: point, b: point.nullable() }).refine(d => d.kind !== 'trend' || (d.b !== null && d.a.time !== d.b.time), 'A trend line needs two different times');
export type Drawing = z.infer<typeof drawingSchema>;
export const chartPlanSchema = z.object({
  id: z.string().uuid(), projectId: z.string().regex(/^[a-z0-9_-]{1,100}$/), name: z.string().trim().min(1).max(100),
  market: z.enum(chartMarkets), interval: z.enum(chartIntervals), style: z.enum(['candles','line']),
  indicators: z.object({ sma50: z.boolean(), sma200: z.boolean(), ema50: z.boolean(), rsi14: z.boolean(), volume: z.boolean() }),
  drawings: z.array(drawingSchema).max(50), thesis: z.string().max(10000), invalidation: z.string().max(10000),
  dataset: chartDatasetSchema, fetchedAt: z.string().datetime(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
}).superRefine((p, ctx) => {
  if (p.market !== p.dataset.market || p.interval !== p.dataset.interval) ctx.addIssue({code:'custom',message:'Plan and dataset must identify the same market and timeframe'});
  if (new Set(p.drawings.map(d => d.id)).size !== p.drawings.length) ctx.addIssue({code:'custom',message:'Duplicate drawing IDs'});
});
export type ChartPlan = z.infer<typeof chartPlanSchema>;
const fileSchema = z.object({ version: z.literal(1), plans: z.array(chartPlanSchema).max(20) }).refine(f => new Set(f.plans.map(p => p.id)).size === f.plans.length, 'Duplicate plan IDs');
export type ChartPlansFile = z.infer<typeof fileSchema>;
export function parseChartPlans(raw: string | null): ChartPlansFile {
  if (raw === null) return {version:1,plans:[]};
  if (raw.length > 4000000) throw Error('Chart plan backup is too large.');
  return fileSchema.parse(JSON.parse(raw));
}
export function saveChartPlan(raw: string | null, expected: string | null, plan: ChartPlan, expectedUpdatedAt?: string): ChartPlansFile {
  if (raw !== expected) throw Error('Chart plans changed in another tab. Your draft is kept. Export it, then reload saved plans.');
  const current = parseChartPlans(raw); const parsed = chartPlanSchema.parse(plan);
  const previous = current.plans.find(p => p.id === plan.id);
  if (expectedUpdatedAt !== undefined && previous?.updatedAt !== expectedUpdatedAt) throw Error('This plan changed. Export your draft, then open the latest saved plan.');
  return fileSchema.parse({version:1,plans:current.plans.some(p => p.id === plan.id) ? current.plans.map(p => p.id === plan.id ? parsed : p) : [...current.plans,parsed]});
}
export function mergeChartPlans(raw: string | null, incoming: string): ChartPlansFile {
  const current = parseChartPlans(raw); const backup = parseChartPlans(incoming); const ids = new Set(current.plans.map(p => p.id));
  return fileSchema.parse({version:1,plans:[...current.plans,...backup.plans.filter(p => !ids.has(p.id))]});
}
export function indicators(candles: Candle[], period: number, kind: 'sma'|'ema'|'rsi'): (number|null)[] {
  const output: (number|null)[] = candles.map(() => null);
  if (period < 1 || !Number.isInteger(period)) return output;
  let average = 0, gain = 0, loss = 0;
  for (let i = 0; i < candles.length; i++) {
    if (kind === 'rsi') {
      if (!i) continue;
      const delta = candles[i].close - candles[i-1].close;
      if (i <= period) { gain += Math.max(0,delta)/period; loss += Math.max(0,-delta)/period; }
      else { gain = (gain*(period-1)+Math.max(0,delta))/period; loss = (loss*(period-1)+Math.max(0,-delta))/period; }
      if (i >= period) output[i] = loss === 0 ? gain === 0 ? 50 : 100 : 100-100/(1+gain/loss);
    } else if (i < period) {
      average += candles[i].close/period;
      if (i === period-1) output[i] = average;
    } else {
      average = kind === 'ema' ? average+(candles[i].close-average)*2/(period+1) : average+(candles[i].close-candles[i-period].close)/period;
      output[i] = average;
    }
  }
  return output;
}

export function parseUtcMinute(value: string): number {
  const normalized = value.trim().replace(' ', 'T');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) throw Error('Use YYYY-MM-DD HH:mm in UTC.');
  const timestamp = Date.parse(`${normalized}:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0,16) !== normalized) throw Error('Use a valid UTC date and time.');
  return timestamp;
}
