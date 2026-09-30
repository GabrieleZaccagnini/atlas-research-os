import type { SeriesPoint } from '../services/intelligence/types';
export function monthlyChange(points: SeriesPoint[], months: number): number | null {
  const last = points[points.length - 1];
  if (!last || !Number.isInteger(months) || months < 1) return null;
  const target = new Date(`${last.date}T00:00:00Z`);
  if (target.getUTCDate() !== 1) return null;
  target.setUTCMonth(target.getUTCMonth() - months);
  const previous = points.find(p => p.date === target.toISOString().slice(0, 10));
  return previous && previous.value > 0 ? (last.value / previous.value - 1) * 100 : null;
}
