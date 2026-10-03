export type LiquidationSide = 'long' | 'short';
export type LiquidationEvent = { time: number; price: number; btc: number; usdt: number; side: LiquidationSide };
export type CoverageWindow = { start: number; end: number };
export type LiquidationTape = { version: 1; events: LiquidationEvent[]; coverage: CoverageWindow[] };
export type LiquidationTotal = { time: number; longUsd: number; shortUsd: number };

const day = 86_400_000;
const maxEvents = 5000;
const maxWindows = 500;
const minTime = Date.UTC(2020, 0, 1);

const object = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const finite = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const validTime = (value: number | null) => value !== null && Number.isInteger(value) && value >= minTime && value < Date.UTC(2100, 0, 1);

export function parseBinanceLiquidation(value: unknown): LiquidationEvent | null {
  const message = object(value);
  const order = object(message?.o);
  const time = finite(order?.T ?? message?.E);
  const price = finite(order?.ap);
  const btc = finite(order?.z);
  if (message?.e !== 'forceOrder' || order?.s !== 'BTCUSDT' || !validTime(time) || price === null || price <= 0 || btc === null || btc <= 0) return null;
  if (order.S !== 'SELL' && order.S !== 'BUY') return null;
  const usdt = price * btc;
  if (!Number.isFinite(usdt)) return null;
  return { time: time!, price, btc, usdt, side: order.S === 'SELL' ? 'long' : 'short' };
}

export function parseCoinalyzeHistory(value: unknown): LiquidationTotal[] {
  if (!Array.isArray(value) || value.length !== 1) throw new Error('Unexpected Coinalyze liquidation response');
  const result = object(value[0]);
  if (result?.symbol !== 'BTCUSDT_PERP.A' || !Array.isArray(result.history) || result.history.length > 2000) throw new Error('Unexpected Coinalyze contract or history');
  const points = result.history.flatMap((item: unknown) => {
    const row = object(item);
    const seconds = finite(row?.t);
    const longUsd = finite(row?.l);
    const shortUsd = finite(row?.s);
    if (seconds === null || !validTime(seconds * 1000) || longUsd === null || longUsd < 0 || shortUsd === null || shortUsd < 0) return [];
    return [{ time: seconds * 1000, longUsd, shortUsd }];
  });
  if (!points.length) throw new Error('Coinalyze liquidation history is empty');
  return Array.from(new Map(points.map(point => [point.time, point])).values()).sort((a, b) => a.time - b.time);
}

export function emptyLiquidationTape(): LiquidationTape { return { version: 1, events: [], coverage: [] }; }
export function liquidationTapeKey(scope: string) { return `atlas.liquidation-tape.v1:${encodeURIComponent(scope)}`; }
export function parseLiquidationTape(raw: string | null): LiquidationTape {
  if (raw === null) return emptyLiquidationTape();
  const value = object(JSON.parse(raw));
  if (value?.version !== 1 || !Array.isArray(value.events) || !Array.isArray(value.coverage) || value.events.length > maxEvents || value.coverage.length > maxWindows) throw new Error('Invalid saved liquidation tape');
  const events = value.events.map((item: unknown) => {
    const row = object(item);
    const time = finite(row?.time); const price = finite(row?.price); const btc = finite(row?.btc); const usdt = finite(row?.usdt);
    if (!validTime(time) || price === null || price <= 0 || btc === null || btc <= 0 || usdt === null || usdt <= 0 || (row?.side !== 'long' && row?.side !== 'short')) throw new Error('Invalid saved liquidation event');
    return { time: time!, price, btc, usdt, side: row.side } as LiquidationEvent;
  });
  const coverage = value.coverage.map((item: unknown) => {
    const row = object(item); const start = finite(row?.start); const end = finite(row?.end);
    if (!validTime(start) || !validTime(end) || end! < start!) throw new Error('Invalid saved liquidation coverage');
    return { start: start!, end: end! };
  });
  return { version: 1, events, coverage };
}

export function appendLiquidation(tape: LiquidationTape, event: LiquidationEvent, now = Date.now()): LiquidationTape {
  const recent = tape.events.filter(row => row.time >= now - 7 * day);
  if (recent.some(row => row.time === event.time && row.side === event.side && row.price === event.price && row.btc === event.btc)) return { ...tape, events: recent };
  return { ...tape, events: [...recent, event].sort((a, b) => a.time - b.time).slice(-maxEvents) };
}

export function mergeLiquidationTapes(left: LiquidationTape, right: LiquidationTape, now = Date.now()): LiquidationTape {
  const events = new Map<string, LiquidationEvent>();
  for (const event of [...left.events, ...right.events]) if (event.time >= now - 7 * day) events.set(`${event.time}:${event.side}:${event.price}:${event.btc}`, event);
  const coverage = new Map<number, CoverageWindow>();
  for (const window of [...left.coverage, ...right.coverage]) if (window.end >= now - 7 * day) {
    const previous = coverage.get(window.start);
    coverage.set(window.start, { start: window.start, end: Math.max(previous?.end ?? window.end, window.end) });
  }
  return { version: 1,
    events: Array.from(events.values()).sort((a, b) => a.time - b.time).slice(-maxEvents),
    coverage: Array.from(coverage.values()).sort((a, b) => a.start - b.start).slice(-maxWindows) };
}

export function recordCoverage(tape: LiquidationTape, start: number, end: number, now = Date.now()): LiquidationTape {
  if (!validTime(start) || !validTime(end) || end < start) return tape;
  const coverage = new Map<number, CoverageWindow>();
  for (const window of tape.coverage) if (window.end >= now - 7 * day) coverage.set(window.start, window);
  coverage.set(start, { start, end: Math.max(coverage.get(start)?.end ?? end, end) });
  return { ...tape, coverage: Array.from(coverage.values()).sort((a, b) => a.start - b.start).slice(-maxWindows) };
}

export function coveredMilliseconds(windows: CoverageWindow[], from: number, to: number): number {
  const clipped = windows.map(window => ({ start: Math.max(from, window.start), end: Math.min(to, window.end) }))
    .filter(window => window.end > window.start).sort((a, b) => a.start - b.start);
  let total = 0;
  let current: CoverageWindow | null = null;
  for (const window of clipped) {
    if (current && window.start <= current.end) current.end = Math.max(current.end, window.end);
    else { if (current) total += current.end - current.start; current = { ...window }; }
  }
  if (current) total += current.end - current.start;
  return total;
}

export type HeatCell = { time: number; price: number; longUsdt: number; shortUsdt: number; count: number };
export function observedHeatmap(events: LiquidationEvent[], now = Date.now(), hours = 24): { cells: HeatCell[]; priceStep: number; timeStep: number } {
  const selected = events.filter(event => event.time >= now - hours * 3_600_000 && event.time <= now);
  if (!selected.length) return { cells: [], priceStep: 250, timeStep: hours <= 1 ? 60_000 : 1_800_000 };
  const low = Math.min(...selected.map(event => event.price));
  const high = Math.max(...selected.map(event => event.price));
  const priceStep = Math.max(100, Math.ceil((high - low) / 20 / 100) * 100);
  const timeStep = hours <= 1 ? 60_000 : 1_800_000;
  const bins = new Map<string, HeatCell>();
  for (const event of selected) {
    const time = Math.floor(event.time / timeStep) * timeStep;
    const price = Math.floor(event.price / priceStep) * priceStep;
    const key = `${time}:${price}`;
    const cell = bins.get(key) ?? { time, price, longUsdt: 0, shortUsdt: 0, count: 0 };
    if (event.side === 'long') cell.longUsdt += event.usdt;
    else cell.shortUsdt += event.usdt;
    cell.count++;
    bins.set(key, cell);
  }
  return { cells: Array.from(bins.values()), priceStep, timeStep };
}
