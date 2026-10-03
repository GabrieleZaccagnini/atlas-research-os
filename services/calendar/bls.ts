import { ProviderError } from '../core/errors';
import type { ProviderRuntime } from '../core/runtime';
import type { ServiceResult } from '../core/types';
import { calendarDay, zonedInstant } from './adapters';
import type { ScheduledCalendarEvent } from './types';

// BLS's public schedule and ICS return 403 to Atlas's server. FRED republishes
// these source-announced dates in US Central Time; retain the mirror provenance.
const releases = [
  { id: 10, title: 'Consumer Price Index' },
  { id: 50, title: 'Employment Situation' },
  { id: 192, title: 'Job Openings and Labor Turnover Survey' },
  { id: 46, title: 'Producer Price Index' },
] as const;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const invalid = () => new ProviderError('invalid_response', 'FRED returned an unexpected BLS release calendar');

export function decodeFredBlsCalendar(raw: unknown, release: typeof releases[number], year: number): ScheduledCalendarEvent[] {
  if (typeof raw !== 'string' || raw.length > 2_000_000 || !Number.isInteger(year) || year < 2020 || year > 2100) throw invalid();
  if (!raw.includes(`<title>${year} Economic Release Calendar - ${release.title} | FRED | St. Louis Fed</title>`)
      || !raw.includes('All times are US Central Time.')) throw invalid();
  const body = /<div id="release-dates-pager">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i.exec(raw)?.[1];
  if (!body) {
    if (raw.includes('No release dates are available for the selected options.')) return [];
    throw invalid();
  }
  const dateRows = Array.from(body.matchAll(/<tr class="odd">/gi));
  const rows = Array.from(body.matchAll(/<tr class="odd">([\s\S]*?)<\/tr>\s*<tr>([\s\S]*?)<\/tr>/gi));
  if (!rows.length || rows.length !== dateRows.length || rows.length > 36) throw invalid();
  const events: ScheduledCalendarEvent[] = [];
  for (const [, dateRow, detailRow] of rows) {
    const dateText = /<span\b[^>]*>\s*(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+([A-Za-z]+)\s+(\d{1,2}),\s+(20\d{2})\s*<\/span>/i.exec(dateRow);
    const timeText = /<td\b[^>]*>\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*<\/td>/i.exec(detailRow);
    const link = /<a\b[^>]*href="\/release\?rid=(\d+)"[^>]*>([^<]+)<\/a>/i.exec(detailRow);
    if (!dateText || !timeText || !link || Number(link[1]) !== release.id || link[2].trim() !== release.title) throw invalid();
    const month = months.indexOf(dateText[1]);
    const day = Number(dateText[2]);
    const rowYear = Number(dateText[3]);
    const hour12 = Number(timeText[1]);
    const minute = Number(timeText[2]);
    if (month < 0 || rowYear !== year || hour12 < 1 || hour12 > 12 || minute > 59) throw invalid();
    const date = calendarDay(year, month, day);
    const hour = hour12 % 12 + (timeText[3].toLowerCase() === 'pm' ? 12 : 0);
    events.push({ id: `bls:${release.id}:${date}`, source: 'bls', kind: 'economic_release', title: release.title,
      date, startsAt: zonedInstant(year, month, day, hour, minute, 'America/Chicago'),
      timeZone: 'America/New_York', sourceUrl: `https://fred.stlouisfed.org/releases/calendar?rid=${release.id}&y=${year}`,
      referencePeriod: null });
  }
  if (new Set(events.map(event => event.id)).size !== events.length) throw invalid();
  return events;
}

export function createBlsCalendarService(runtime: ProviderRuntime, now: () => number = Date.now) {
  let inFlight: Promise<ServiceResult<ScheduledCalendarEvent[]>> | null = null;
  async function load(): Promise<ServiceResult<ScheduledCalendarEvent[]>> {
    const year = new Date(now()).getUTCFullYear();
    const results = [];
    // Four small fixed release calendars, for this year and next. Empty next-year
    // pages are valid until BLS announces that schedule.
    for (const release of releases) {
      for (const requestedYear of [year, year + 1]) {
        results.push(await runtime.query('fred-calendar', 'releases/calendar',
          { rid: String(release.id), y: String(requestedYear) }, 24 * 3600000,
          raw => decodeFredBlsCalendar(raw, release, requestedYear), 'text'));
      }
    }
    const good = results.filter(result => result.ok);
    const events = good.flatMap(result => result.data);
    if (!events.length) {
      const failed = results.find(result => !result.ok);
      return failed && !failed.ok ? failed : { ok: false, data: null, provider: 'fred-calendar',
        error: { code: 'invalid_response', message: 'No BLS release dates are available from FRED' } };
    }
    const fetchedAt = good.map(result => result.meta.fetchedAt).sort()[0];
    const expiresAt = good.map(result => result.meta.expiresAt).sort()[0];
    const cache = good.some(result => result.meta.cache === 'stale') ? 'stale'
      : good.every(result => result.meta.cache === 'fresh') ? 'fresh' : 'live';
    return { ok: true, data: events.sort((a, b) => (a.startsAt ?? a.date).localeCompare(b.startsAt ?? b.date) || a.id.localeCompare(b.id)),
      meta: { provider: 'fred-calendar', fetchedAt, expiresAt, cache },
      ...(good.length < results.length ? { warning: { code: 'upstream' as const, message: 'Some BLS release calendars are unavailable; dates may be incomplete' } } : {}) };
  }
  return { get() {
    if (inFlight) return inFlight;
    inFlight = load().finally(() => { inFlight = null; });
    return inFlight;
  } };
}
