export type CycleView = 'original-rainbow' | 'halving-rainbow' | 'power-law' | 'reward-era' | 'cycle-repeat' | 'halving-progress' | 'price-scenarios' | 'monthly' | 'quarterly' | 'hash-ribbons' | 'puell';
export type DailyPoint = { date: string; priceUsd: number; hashRateEhs?: number; minerRevenueUsd?: number };
export type ChartRow = { date: string; [key: string]: string | number | null };
export type ViewResult = { rows: ChartRow[]; latestDate: string; firstDate: string; note?: string; currentProgress?: number };

export const cycleViews: CycleView[] = ['original-rainbow', 'halving-rainbow', 'power-law', 'reward-era', 'cycle-repeat', 'halving-progress', 'price-scenarios', 'monthly', 'quarterly', 'hash-ribbons', 'puell'];
export const halvingDates = [
  { year: 2012, date: '2012-11-28' },
  { year: 2016, date: '2016-07-09' },
  { year: 2020, date: '2020-05-11' },
  { year: 2024, date: '2024-04-20' },
] as const;

const day = 86400000;
const timestamp = (date: string) => Date.parse(`${date}T00:00:00Z`);
const dateString = (time: number) => new Date(time).toISOString().slice(0, 10);
const valid = (number: number | undefined): number is number => number !== undefined && Number.isFinite(number) && number > 0;
const round = (number: number, digits = 2) => Number(number.toFixed(digits));

export function cleanDaily(points: DailyPoint[]): DailyPoint[] {
  const byDate = new Map<string, DailyPoint>();
  for (const point of points) if (/^\d{4}-\d{2}-\d{2}$/.test(point.date) && valid(point.priceUsd)) byDate.set(point.date, point);
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function downsample(rows: ChartRow[], max = 1200): ChartRow[] {
  if (rows.length <= max) return rows;
  const step = Math.ceil(rows.length / max);
  return rows.filter((_, index) => index % step === 0 || index === rows.length - 1);
}

function quantile(sorted: number[], fraction: number): number {
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function model(points: DailyPoint[]) {
  const genesis = timestamp('2009-01-03');
  const samples = points.map(point => ({ x: Math.log((timestamp(point.date) - genesis) / day + 1), y: Math.log(point.priceUsd) })).filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  const n = samples.length;
  const meanX = samples.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = samples.reduce((sum, point) => sum + point.y, 0) / n;
  const denominator = samples.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const slope = denominator ? samples.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator : 0;
  const intercept = meanY - slope * meanX;
  const residuals = samples.map(point => point.y - intercept - slope * point.x).sort((a, b) => a - b);
  return { genesis, slope, intercept, residuals };
}

function powerLaw(points: DailyPoint[], rainbow: boolean): ChartRow[] {
  const fit = model(points);
  const quantiles = rainbow ? [0.1, 0.3, 0.5, 0.7, 0.9] : [0.1, 0.5, 0.9];
  const end = timestamp(points.at(-1)!.date) + 365 * 4 * day;
  const dates = [...points.map(point => point.date)];
  for (let time = timestamp(points.at(-1)!.date) + 30 * day; time <= end; time += 30 * day) dates.push(dateString(time));
  const priceByDate = new Map(points.map(point => [point.date, point.priceUsd]));
  return downsample(dates.map(date => {
    const x = Math.log((timestamp(date) - fit.genesis) / day + 1);
    const center = fit.intercept + fit.slope * x;
    const row: ChartRow = { date, price: priceByDate.get(date) ?? null };
    quantiles.forEach((fraction, index) => { row[`band${index + 1}`] = round(Math.exp(center + quantile(fit.residuals, fraction)), 4); });
    return row;
  }));
}

function cycleRows(points: DailyPoint[], asMultiple: boolean): ChartRow[] {
  const dates = new Map(points.map(point => [point.date, point.priceUsd]));
  const rows = new Map<number, ChartRow>();
  for (let index = 0; index < halvingDates.length; index++) {
    const halving = halvingDates[index];
    const start = timestamp(halving.date);
    const end = index < halvingDates.length - 1 ? timestamp(halvingDates[index + 1].date) : timestamp(points.at(-1)!.date) + day;
    const base = dates.get(halving.date) ?? points.find(point => timestamp(point.date) >= start && timestamp(point.date) < start + 7 * day)?.priceUsd;
    if (!base) continue;
    for (let offset = 0; offset < Math.min(1460, Math.ceil((end - start) / day)); offset++) {
      const price = dates.get(dateString(start + offset * day));
      if (!price) continue;
      const row = rows.get(offset) ?? { date: String(offset) };
      row[`y${halving.year}`] = round(asMultiple ? price / base : price, asMultiple ? 3 : 0);
      rows.set(offset, row);
    }
  }
  return downsample(Array.from(rows.values()).sort((a, b) => Number(a.date) - Number(b.date)), 750);
}

function halvingRainbow(points: DailyPoint[]): ChartRow[] {
  const comparison = cycleRows(points, true);
  const currentOffsets = comparison.filter(row => typeof row.y2024 === 'number');
  const latestOffset = Number(currentOffsets.at(-1)?.date ?? 0);
  return comparison.filter(row => Number(row.date) <= latestOffset).map(row => {
    const values = halvingDates.slice(0, 3).map(item => row[`y${item.year}`]).filter((value): value is number => typeof value === 'number').sort((a, b) => a - b);
    return { date: row.date, low: values.length === 3 ? round(quantile(values, 0.1), 3) : null, middle: values.length === 3 ? round(quantile(values, 0.5), 3) : null, high: values.length === 3 ? round(quantile(values, 0.9), 3) : null, current: typeof row.y2024 === 'number' ? row.y2024 : null };
  });
}

function repeat(points: DailyPoint[], era: number): ChartRow[] {
  const halving = halvingDates.find(item => item.year === era) ?? halvingDates[2];
  const start = timestamp(halving.date);
  const end = timestamp(points.at(-1)!.date);
  const nextHalving = halvingDates.find(item => item.year === halving.year + 4);
  const historicalEnd = nextHalving ? timestamp(nextHalving.date) : start + 1460 * day;
  const historical = points.filter(point => timestamp(point.date) >= start && timestamp(point.date) < historicalEnd);
  const base = historical[0]?.priceUsd;
  const last = points.at(-1)!.priceUsd;
  const recent = points.filter(point => timestamp(point.date) >= end - 365 * day).map(point => ({ date: point.date, history: point.priceUsd, scenario: null }));
  if (!base) return recent;
  const projected = historical.filter((_, index) => index % 7 === 0 || index === historical.length - 1).map(point => ({ date: dateString(end + (timestamp(point.date) - start)), history: null, scenario: round(last * point.priceUsd / base, 0) }));
  return [...recent, { date: points.at(-1)!.date, history: last, scenario: last }, ...projected];
}

function periods(points: DailyPoint[], quarterly: boolean): ChartRow[] {
  const closes = new Map<string, DailyPoint>();
  for (const point of points) closes.set(point.date.slice(0, 7), point);
  const months = Array.from(closes.keys()).sort();
  const rows: ChartRow[] = [];
  for (let index = 1; index < months.length; index++) {
    const current = closes.get(months[index])!;
    const currentMonth = Number(months[index].slice(5, 7));
    if (quarterly && currentMonth % 3 !== 0) continue;
    const prior = closes.get(months[index - (quarterly ? 3 : 1)]);
    if (!prior || !valid(prior.priceUsd)) continue;
    const nextMonth = dateString(timestamp(current.date) + day).slice(0, 7);
    if (nextMonth === months[index]) continue; // Only complete periods.
    rows.push({ date: quarterly ? `${months[index].slice(0, 4)} Q${Math.ceil(currentMonth / 3)}` : months[index], returnPct: round((current.priceUsd / prior.priceUsd - 1) * 100) });
  }
  return rows;
}

function hashRibbons(points: DailyPoint[]): ChartRow[] {
  const rows: ChartRow[] = [];
  for (let index = 59; index < points.length; index++) {
    const window = points.slice(index - 59, index + 1);
    if (timestamp(window.at(-1)!.date) - timestamp(window[0].date) > 62 * day || window.some(point => !valid(point.hashRateEhs))) continue;
    const short = window.slice(-30).reduce((sum, point) => sum + point.hashRateEhs!, 0) / 30;
    const long = window.reduce((sum, point) => sum + point.hashRateEhs!, 0) / 60;
    rows.push({ date: points[index].date, short: round(short), long: round(long) });
  }
  return downsample(rows);
}

function puell(points: DailyPoint[]): ChartRow[] {
  const rows: ChartRow[] = [];
  for (let index = 364; index < points.length; index++) {
    const window = points.slice(index - 364, index + 1);
    if (timestamp(window.at(-1)!.date) - timestamp(window[0].date) > 370 * day || window.some(point => !valid(point.minerRevenueUsd))) continue;
    const average = window.reduce((sum, point) => sum + point.minerRevenueUsd!, 0) / 365;
    rows.push({ date: points[index].date, multiple: round(points[index].minerRevenueUsd! / average, 3) });
  }
  return downsample(rows);
}

export function buildCycleView(input: DailyPoint[], view: CycleView, era = 2020, blockHeight?: number): ViewResult {
  const points = cleanDaily(input);
  if (points.length < 366) throw new Error('Insufficient Bitcoin history');
  let rows: ChartRow[];
  switch (view) {
    case 'original-rainbow': rows = powerLaw(points, true); break;
    case 'power-law': rows = powerLaw(points, false); break;
    case 'halving-rainbow': rows = halvingRainbow(points); break;
    case 'reward-era': rows = cycleRows(points, true); break;
    case 'halving-progress': rows = cycleRows(points, false); break;
    case 'cycle-repeat': rows = repeat(points, era); break;
    case 'price-scenarios': rows = downsample(points.slice(-730).map(point => ({ date: point.date, history: point.priceUsd }))); break;
    case 'monthly': rows = periods(points, false); break;
    case 'quarterly': rows = periods(points, true); break;
    case 'hash-ribbons': rows = hashRibbons(points); break;
    case 'puell': rows = puell(points); break;
  }
  if (!rows.length) throw new Error('Source data is too sparse for this chart');
  const result: ViewResult = { rows, firstDate: points[0].date, latestDate: points.at(-1)!.date };
  if (view === 'original-rainbow' || view === 'power-law') result.note = 'Bands are fitted using the full available price history; past bands change when the model is refitted.';
  if (view === 'halving-rainbow') result.note = 'Historical range uses the 2012, 2016 and 2020 reward eras; the current era is shown separately.';
  if (view === 'cycle-repeat') result.note = `${era} era price path scaled to the latest BTC price; a scenario, not a forecast.`;
  if (view === 'halving-progress' && blockHeight !== undefined) result.currentProgress = Math.max(0, Math.min(100, round((blockHeight - 840000) / 210000 * 100, 1)));
  return result;
}
