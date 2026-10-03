import { ProviderError } from '../core/errors';
import type { ProviderRuntime } from '../core/runtime';

export interface CoindarEvent {
  id: string;
  title: string;
  coinId: string;
  dateLabel: string;
  sortDate: string;
  untilDate: string;
  startsAt: string | null;
  precision: 'time' | 'day' | 'month' | 'quarter';
  sourceUrl: string;
  sourceReliable: boolean;
  important: boolean;
}

const invalid = () => new ProviderError('invalid_response', 'Coindar returned an unexpected event');
const day = (year: number, month: number, date: number) => {
  const value = new Date(Date.UTC(year, month - 1, date));
  if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== date) throw invalid();
  return value.toISOString().slice(0, 10);
};
const lastDay = (year: number, nextMonth: number) => new Date(Date.UTC(year, nextMonth - 1, 0)).toISOString().slice(0, 10);
const label = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function eventDate(raw: unknown): Pick<CoindarEvent, 'dateLabel' | 'sortDate' | 'untilDate' | 'startsAt' | 'precision'> {
  if (typeof raw !== 'string') throw invalid();
  const quarter = /^(20\d{2})-Q([1-4])$/.exec(raw);
  if (quarter) {
    const year = Number(quarter[1]); const number = Number(quarter[2]);
    return { dateLabel: `Q${number} ${year}`, sortDate: day(year, number * 3 - 2, 1), untilDate: lastDay(year, number * 3 + 1), startsAt: null, precision: 'quarter' };
  }
  const month = /^(20\d{2})-(\d{1,2})$/.exec(raw);
  if (month) {
    const year = Number(month[1]); const number = Number(month[2]);
    if (number < 1 || number > 12) throw invalid();
    return { dateLabel: new Date(`${day(year, number, 1)}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }), sortDate: day(year, number, 1), untilDate: lastDay(year, number + 1), startsAt: null, precision: 'month' };
  }
  const exact = /^(20\d{2})-(\d{1,2})-(\d{1,2})(?: (\d{2}):(\d{2}))?$/.exec(raw);
  if (!exact) throw invalid();
  const date = day(Number(exact[1]), Number(exact[2]), Number(exact[3]));
  if (exact[4] === undefined) return { dateLabel: label(date), sortDate: date, untilDate: date, startsAt: null, precision: 'day' };
  const hour = Number(exact[4]); const minute = Number(exact[5]);
  if (hour > 23 || minute > 59) throw invalid();
  return { dateLabel: `${label(date)} · ${exact[4]}:${exact[5]} UTC`, sortDate: date, untilDate: date,
    startsAt: `${date}T${exact[4]}:${exact[5]}:00.000Z`, precision: 'time' };
}

function flag(raw: unknown): boolean {
  if (raw === true || raw === 'true') return true;
  if (raw === false || raw === 'false') return false;
  throw invalid();
}

export function decodeCoindarEvents(raw: unknown): CoindarEvent[] {
  if (!Array.isArray(raw) || raw.length > 100) throw invalid();
  const events: CoindarEvent[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') throw invalid();
    const value = entry as Record<string, unknown>;
    if (typeof value.caption !== 'string' || !value.caption.trim() || value.caption.length > 300 ||
      typeof value.coin_id !== 'string' || !/^\d+$/.test(value.coin_id) || typeof value.source !== 'string') throw invalid();
    let source: URL;
    try { source = new URL(value.source); } catch { throw invalid(); }
    if (source.protocol !== 'https:' || !['coindar.org', 'www.coindar.org'].includes(source.hostname) || !source.pathname.startsWith('/en/event/')) throw invalid();
    const id = `coindar:${source.pathname}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const date = eventDate(value.date_start);
    const end = value.date_end === '' || value.date_end == null ? null : eventDate(value.date_end);
    if (end && end.untilDate < date.sortDate) throw invalid();
    events.push({ id, title: value.caption.trim(), coinId: value.coin_id, ...date,
      dateLabel: end ? `${date.dateLabel} – ${end.dateLabel}` : date.dateLabel,
      untilDate: end?.untilDate ?? date.untilDate, sourceUrl: source.href,
      sourceReliable: flag(value.source_reliable), important: flag(value.important) });
  }
  return events.sort((a, b) => a.sortDate.localeCompare(b.sortDate) || a.id.localeCompare(b.id));
}

export function createCoindarService(runtime: ProviderRuntime, now: () => number = Date.now) {
  return {
    upcoming() {
      const start = new Date(now());
      const end = new Date(start.getTime() + 90 * 86400000);
      return runtime.query('coindar', 'api/v2/events', {
        filter_date_start: start.toISOString().slice(0, 10), filter_date_end: end.toISOString().slice(0, 10),
        order_by: '0', page: '1', page_size: '100', sort_by: 'date_start',
      }, 30 * 60000, decodeCoindarEvents);
    },
  };
}
