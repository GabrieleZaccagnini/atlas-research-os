import { z } from 'zod';

const safeUrl = z.string().url().refine(value => /^https?:\/\//i.test(value));
export const calendarStarSchema = z.object({
  id: z.string().min(1).max(600).regex(/^(bea|fomc|bls|coindar|project):/),
  category: z.enum(['crypto', 'macro']),
  title: z.string().trim().min(1).max(300),
  dateLabel: z.string().trim().min(1).max(100),
  sortAt: z.string().datetime(),
  untilDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceLabel: z.string().trim().min(1).max(100),
  sourceUrl: safeUrl.nullable(),
  projectHref: z.string().regex(/^\/projects\/[0-9a-f-]{36}$/i).nullable(),
  note: z.string().max(2000).default(''),
  projectId: z.string().uuid().nullable().default(null),
});
export type CalendarStar = z.infer<typeof calendarStarSchema>;
export const calendarStarsSchema = z.object({ version: z.literal(1), events: z.array(calendarStarSchema).max(200) })
  .refine(file => new Set(file.events.map(event => event.id)).size === file.events.length, 'Duplicate starred event');
export type CalendarStars = z.infer<typeof calendarStarsSchema>;
export const emptyCalendarStars = (): CalendarStars => ({ version: 1, events: [] });
export const calendarStarsStorageKey = (scope: string) => `atlas.calendar-stars.v1:${encodeURIComponent(scope)}`;
export function parseCalendarStars(raw: string | null): CalendarStars {
  return raw === null ? emptyCalendarStars() : calendarStarsSchema.parse(JSON.parse(raw));
}
export function toggleCalendarStar(file: CalendarStars, raw: CalendarStar): CalendarStars {
  const star = calendarStarSchema.parse(raw);
  return calendarStarsSchema.parse({ version: 1,
    events: file.events.some(event => event.id === star.id) ? file.events.filter(event => event.id !== star.id) : [...file.events, star] });
}
export function updateCalendarStar(file: CalendarStars, id: string, changes: Pick<CalendarStar, 'note' | 'projectId'>): CalendarStars {
  if (!file.events.some(event => event.id === id)) throw Error('Starred event no longer exists.');
  return calendarStarsSchema.parse({ version: 1, events: file.events.map(event => event.id === id ? { ...event, note: changes.note.trim(), projectId: changes.projectId } : event) });
}
export function mergeCalendarStars(currentRaw: string | null, incomingRaw: string): CalendarStars {
  const current = parseCalendarStars(currentRaw);
  const incoming = parseCalendarStars(incomingRaw);
  const existing = new Set(current.events.map(event => event.id));
  return calendarStarsSchema.parse({ version: 1, events: [...current.events, ...incoming.events.filter(event => !existing.has(event.id))] });
}
