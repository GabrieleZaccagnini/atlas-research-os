import type { ScheduledCalendarEvent } from '@/services/calendar/types';

export function easternDay(at: number): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at);
  const value = (name: string) => parts.find(part => part.type === name)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function scheduledUpcoming(event: ScheduledCalendarEvent, now: number): boolean {
  return event.startsAt ? Date.parse(event.startsAt) >= now : event.date >= easternDay(now);
}

export function sortedSchedule(events: ScheduledCalendarEvent[]): ScheduledCalendarEvent[] {
  return events.slice().sort((a, b) => (a.startsAt ?? `${a.date}T23:59:59Z`).localeCompare(b.startsAt ?? `${b.date}T23:59:59Z`) || a.id.localeCompare(b.id));
}

export function scheduledDate(event: ScheduledCalendarEvent): string {
  return new Date(`${event.date}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function scheduledTime(event: ScheduledCalendarEvent): string {
  if (!event.startsAt) return 'Time not announced';
  const at = new Date(event.startsAt);
  const eastern = at.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const local = at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${eastern} · ${local} local`;
}
