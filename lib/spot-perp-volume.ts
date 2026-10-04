export const volumeHourMs = 60 * 60 * 1000;
export const volumeHistoryHours = 30 * 24;

export type VolumeBar = { time: number; quoteUsdt: number };
export type SpotPerpVolumePoint = { time: number; spotUsdt: number; perpUsdt: number };
export type SpotPerpVolume = {
  source: 'Binance';
  symbol: 'BTCUSDT';
  spotMarket: 'Spot';
  perpMarket: 'USDⓈ-M perpetual';
  unit: 'USDT traded quote volume';
  interval: '1h';
  from: number;
  through: number;
  fetchedAt: string;
  expectedHours: number;
  matchedHours: number;
  points: SpotPerpVolumePoint[];
};

function finiteNonnegative(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseVolumeKlines(value: unknown, closedBefore: number): VolumeBar[] {
  if (!Array.isArray(value) || !value.length || value.length > volumeHistoryHours + 1) throw new Error('Invalid Binance volume history');
  const bars: VolumeBar[] = [];
  for (const row of value) {
    if (!Array.isArray(row) || row.length < 8) throw new Error('Invalid Binance volume bar');
    const time = row[0];
    const closeTime = row[6];
    const quoteUsdt = finiteNonnegative(row[7]);
    if (!Number.isInteger(time) || time % volumeHourMs !== 0 || closeTime !== time + volumeHourMs - 1 || quoteUsdt === null) throw new Error('Invalid Binance volume bar');
    if (time + volumeHourMs > closedBefore) continue; // Never display a still-forming candle.
    bars.push({ time, quoteUsdt });
  }
  if (!bars.length) throw new Error('No closed Binance volume bars');
  bars.sort((a, b) => a.time - b.time);
  if (bars.some((bar, index) => index > 0 && bar.time === bars[index - 1].time)) throw new Error('Duplicate Binance volume bar');
  return bars;
}

export function alignVolumeBars(spot: VolumeBar[], perp: VolumeBar[], from: number, through: number): SpotPerpVolumePoint[] {
  const spotByTime = new Map(spot.map(bar => [bar.time, bar.quoteUsdt]));
  const perpByTime = new Map(perp.map(bar => [bar.time, bar.quoteUsdt]));
  const points: SpotPerpVolumePoint[] = [];
  for (let time = from; time <= through; time += volumeHourMs) {
    const spotUsdt = spotByTime.get(time);
    const perpUsdt = perpByTime.get(time);
    if (spotUsdt !== undefined && perpUsdt !== undefined) points.push({ time, spotUsdt, perpUsdt });
  }
  return points;
}

export type VolumeBucket = { time: number; spotUsdt: number | null; perpUsdt: number | null; matchedHours: number };
export function aggregateVolume(points: SpotPerpVolumePoint[], from: number, hours: number, bucketHours: number): VolumeBucket[] {
  if (hours <= 0 || bucketHours <= 0 || hours % bucketHours !== 0) throw new Error('Invalid volume range');
  const byTime = new Map(points.map(point => [point.time, point]));
  return Array.from({ length: hours / bucketHours }, (_, index) => {
    const time = from + index * bucketHours * volumeHourMs;
    let spotUsdt = 0;
    let perpUsdt = 0;
    let matchedHours = 0;
    for (let hour = 0; hour < bucketHours; hour++) {
      const point = byTime.get(time + hour * volumeHourMs);
      if (!point) continue;
      spotUsdt += point.spotUsdt;
      perpUsdt += point.perpUsdt;
      matchedHours++;
    }
    return { time, spotUsdt: matchedHours === bucketHours ? spotUsdt : null, perpUsdt: matchedHours === bucketHours ? perpUsdt : null, matchedHours };
  });
}
