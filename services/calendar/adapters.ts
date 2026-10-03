import { ProviderError } from '../core/errors';
import type { ProviderRuntime } from '../core/runtime';
import type { CalendarSource, ScheduledCalendarEvent } from './types';

const BEA_SCHEDULE = 'https://www.bea.gov/news/schedule/full';
const FOMC_SCHEDULE = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const invalid = () => new ProviderError('invalid_response', 'Calendar source returned an unexpected schedule');

function plain(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&#(\d+);|&#x([0-9a-f]+);|&(amp|quot|apos|lt|gt|nbsp);/gi, (match, decimal: string | undefined, hex: string | undefined, name: string | undefined) => {
    if (name) return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' } as Record<string, string>)[name.toLowerCase()] ?? match;
    const code = parseInt(decimal ?? hex ?? '', decimal ? 10 : 16);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
  }).replace(/\s+/g, ' ').trim();
}

export function calendarDay(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) throw invalid();
  return date.toISOString().slice(0, 10);
}

// Resolve a published wall-clock time in its source time zone, including daylight saving time.
export function zonedInstant(year: number, month: number, day: number, hour: number, minute: number, timeZone: 'America/New_York' | 'America/Chicago'): string {
  const utcWall = Date.UTC(year, month, day, hour, minute);
  const zone = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date(utcWall)).find(part => part.type === 'timeZoneName')?.value;
  const offset = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(zone ?? '');
  if (!offset) throw invalid();
  const minutes = (Number(offset[2]) * 60 + Number(offset[3] ?? 0)) * (offset[1] === '+' ? 1 : -1);
  return new Date(utcWall - minutes * 60000).toISOString();
}

function keyBeaRelease(title: string) {
  return /^(?:Gross Domestic Product|GDP \(|Personal Income and Outlays|U\.S\. International Trade in Goods and Services)/.test(title);
}

export function decodeBeaSchedule(raw: unknown): ScheduledCalendarEvent[] {
  if (typeof raw !== 'string' || raw.length > 2_000_000) throw invalid();
  const table = /<table\b[^>]*id="release-schedule-table"[^>]*>([\s\S]*?)<\/table>/i.exec(raw)?.[1];
  const year = Number(/<th\b[^>]*>\s*Year\s+(20\d{2})\s*<\/th>/i.exec(table ?? '')?.[1]);
  if (!table || !Number.isInteger(year) || year < 2020 || year > 2100) throw invalid();
  const rows = Array.from(table.matchAll(/<tr\b[^>]*class="[^"]*scheduled-releases-type-press[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi));
  if (!rows.length || rows.length > 1000) throw invalid();
  const events: ScheduledCalendarEvent[] = [];
  const seen = new Set<string>();
  for (const [, row] of rows) {
    const dateLabel = plain(/<div\b[^>]*class="release-date"[^>]*>([\s\S]*?)<\/div>/i.exec(row)?.[1] ?? '');
    const timeLabel = plain(/<small\b[^>]*>([\s\S]*?)<\/small>/i.exec(row)?.[1] ?? '');
    const title = plain(/<td\b[^>]*class="[^"]*release-title[^"]*"[^>]*>([\s\S]*?)<\/td>/i.exec(row)?.[1] ?? '');
    if (!keyBeaRelease(title)) continue;
    const dateMatch = /^([A-Za-z]+)\s+(\d{1,2})$/.exec(dateLabel);
    const timeMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(timeLabel);
    if (!dateMatch || !timeMatch) throw invalid();
    const month = months.indexOf(dateMatch[1]);
    const day = Number(dateMatch[2]); const hour12 = Number(timeMatch[1]); const minute = Number(timeMatch[2]);
    if (month < 0 || hour12 < 1 || hour12 > 12 || minute > 59) throw invalid();
    const date = calendarDay(year, month, day);
    const hour = hour12 % 12 + (timeMatch[3].toUpperCase() === 'PM' ? 12 : 0);
    const id = `bea:${date}:${title}`;
    if (seen.has(id)) continue; seen.add(id);
    events.push({ id, source: 'bea', kind: 'economic_release', title, date,
      startsAt: zonedInstant(year, month, day, hour, minute, 'America/New_York'), timeZone: 'America/New_York',
      sourceUrl: BEA_SCHEDULE, referencePeriod: null });
  }
  if (!events.length) throw invalid();
  return events.sort((a, b) => (a.startsAt ?? a.date).localeCompare(b.startsAt ?? b.date));
}

export function decodeFomcSchedule(raw: unknown): ScheduledCalendarEvent[] {
  if (typeof raw !== 'string' || raw.length > 2_000_000) throw invalid();
  const sections = Array.from(raw.matchAll(/<h4>\s*<a\b[^>]*>\s*(20\d{2}) FOMC Meetings\s*<\/a>\s*<\/h4>([\s\S]*?)(?=<div class="panel panel-default">|$)/gi));
  if (!sections.length || sections.length > 20) throw invalid();
  const events: ScheduledCalendarEvent[] = [];
  for (const [, rawYear, section] of sections) {
    const year = Number(rawYear);
    const rows = Array.from(section.matchAll(/<div\b[^>]*class="[^"]*\bfomc-meeting\b[^"]*"[^>]*>[\s\S]*?<div\b[^>]*class="[^"]*fomc-meeting__month[^"]*"[^>]*>\s*<strong>([^<]+)<\/strong>\s*<\/div>[\s\S]*?<div\b[^>]*class="[^"]*fomc-meeting__date[^"]*"[^>]*>([^<]+)<\/div>/gi));
    if (rows.length > 12) throw invalid();
    for (const [, rawMonth, rawDays] of rows) {
      const label = plain(rawMonth); const dateLabel = plain(rawDays);
      const monthName = label.split('/').at(-1) ?? '';
      const month = months.indexOf(monthName);
      const days = /^(\d{1,2})-(\d{1,2})(\*)?$/.exec(dateLabel);
      if (month < 0 || !days) continue; // Exclude unscheduled notation votes or malformed entries.
      const endDay = Number(days[2]);
      const date = calendarDay(year, month, endDay);
      events.push({ id: `fomc:${date}`, source: 'fomc', kind: 'policy_meeting',
        title: `FOMC meeting${days[3] ? ' · projections scheduled' : ''}`,
        date, startsAt: null, timeZone: 'America/New_York', sourceUrl: FOMC_SCHEDULE, referencePeriod: null });
    }
  }
  if (!events.length || new Set(events.map(event => event.id)).size !== events.length) throw invalid();
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function createCalendarService(runtime: ProviderRuntime) {
  return {
    get(source: Exclude<CalendarSource, 'bls'>) {
      return source === 'bea'
        ? runtime.query('bea', 'news/schedule/full', {}, 6 * 3600000, decodeBeaSchedule, 'text')
        : runtime.query('fomc-calendar', 'monetarypolicy/fomccalendars.htm', {}, 24 * 3600000, decodeFomcSchedule, 'text');
    },
  };
}
