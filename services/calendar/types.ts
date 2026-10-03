export type CalendarSource = 'bea' | 'fomc' | 'bls';

export interface ScheduledCalendarEvent {
  id: string;
  source: CalendarSource;
  kind: 'economic_release' | 'policy_meeting';
  title: string;
  // Calendar day in the source's time zone. FOMC dates have no announced time here.
  date: string;
  startsAt: string | null;
  timeZone: 'America/New_York';
  sourceUrl: string;
  referencePeriod: string | null;
}
