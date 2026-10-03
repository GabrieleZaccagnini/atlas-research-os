import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeBeaSchedule, decodeFomcSchedule, createCalendarService } from '../services/calendar/adapters';
import { decodeFredBlsCalendar, createBlsCalendarService } from '../services/calendar/bls';
import { decodeCoindarEvents, createCoindarService } from '../services/calendar/coindar';
import { readConfig } from '../services/core/config';
import { ProviderRuntime } from '../services/core/runtime';
import { calendarStarsStorageKey, mergeCalendarStars, parseCalendarStars, toggleCalendarStar, updateCalendarStar } from '../lib/calendar-stars';

const beaRow = (day: string, time: string, title: string) => `<tr class="scheduled-releases-type-press"><td class="scheduled-date"><div class="release-date">${day}</div><small class="text-muted">${time}</small></td><td class="release-title views-field">${title}</td></tr>`;
const bea = `<table id="release-schedule-table"><thead><tr><th>Year 2026</th></tr></thead><tbody>${beaRow('March 13', '8:30 AM', 'Personal Income and Outlays, January 2026')}${beaRow('November 25', '8:30 AM', 'GDP (Second Estimate), 3rd Quarter 2026')}${beaRow('November 25', '8:30 AM', 'GDP (Second Estimate), 3rd Quarter 2026')}${beaRow('October 6', '10:00 AM', 'Services Supplied Through Affiliates, 2024')}</tbody></table>`;
const fomc = `<div class="panel panel-default"><div class="panel-heading"><h4><a id="a">2026 FOMC Meetings</a></h4></div><div class="row fomc-meeting"><div class="fomc-meeting__month"><strong>October</strong></div><div class="fomc-meeting__date">27-28</div></div><div class="fomc-meeting--shaded row fomc-meeting"><div class="fomc-meeting__month"><strong>December</strong></div><div class="fomc-meeting__date">8-9*</div></div></div><div class="panel panel-default"><div class="panel-heading"><h4><a id="b">2027 FOMC Meetings</a></h4></div><div class="row fomc-meeting"><div class="fomc-meeting__month"><strong>January</strong></div><div class="fomc-meeting__date">26-27</div></div></div>`;

test('BEA schedule keeps exact releases and Eastern daylight-saving times without duplicate or unrelated rows', () => {
  const events = decodeBeaSchedule(bea);
  assert.equal(events.length, 2);
  assert.equal(events[0].date, '2026-03-13');
  assert.equal(events[0].startsAt, '2026-03-13T12:30:00.000Z');
  assert.equal(events[1].startsAt, '2026-11-25T13:30:00.000Z');
  assert.ok(events.every(event => event.source === 'bea' && event.sourceUrl === 'https://www.bea.gov/news/schedule/full'));
  assert.throws(() => decodeBeaSchedule('<html>no schedule</html>'));
  assert.throws(() => decodeBeaSchedule(bea.replace('March 13', 'March 99')));
});

test('FOMC schedule stores meeting end dates without inventing a decision time', () => {
  const events = decodeFomcSchedule(fomc);
  assert.deepEqual(events.map(event => event.date), ['2026-10-28', '2026-12-09', '2027-01-27']);
  assert.ok(events.every(event => event.startsAt === null && event.kind === 'policy_meeting'));
  assert.match(events[1].title, /projections scheduled/);
  assert.throws(() => decodeFomcSchedule('no meeting calendar'));
});

test('official calendar sources fail independently and use fixed, cached URLs', async () => {
  const requested: string[] = [];
  const runtime = new ProviderRuntime(readConfig({}), (async input => {
    requested.push(String(input));
    return String(input).includes('bea.gov') ? new Response('', { status: 503 }) : new Response(fomc);
  }) as typeof fetch);
  const service = createCalendarService(runtime);
  assert.equal((await service.get('bea')).ok, false);
  const meetings = await service.get('fomc');
  assert.ok(meetings.ok); assert.equal(meetings.data.length, 3);
  assert.equal((await service.get('fomc')).ok, true);
  assert.deepEqual(requested, ['https://www.bea.gov/news/schedule/full', 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm']);
  const disabled = new ProviderRuntime(readConfig({ ATLAS_CALENDAR_ENABLED: 'false' }), (async () => { throw Error('unexpected fetch'); }) as typeof fetch);
  assert.equal((await createCalendarService(disabled).get('bea')).ok, false);
});

const fredPage = (year: number, id: number, title: string, rows: { date: string; time: string }[]) => `<html><head><title>${year} Economic Release Calendar - ${title} | FRED | St. Louis Fed</title></head><body><div id="release-dates-pager">${rows.length ? `<table><tbody>${rows.map(row => `<tr class="odd"><td><span style="font-weight: bold;">${row.date}</span></td></tr><tr><td>${row.time}</td><td><a href="/release?rid=${id}">${title}</a></td></tr>`).join('')}</tbody></table>` : 'No release dates are available for the selected options.'}</div><p>All times are US Central Time.</p></body></html>`;

test('FRED mirrors BLS release dates with Central daylight-saving conversion and exact source links', () => {
  const release = { id: 10, title: 'Consumer Price Index' } as const;
  const events = decodeFredBlsCalendar(fredPage(2026, 10, release.title, [
    { date: 'Wednesday October 14, 2026', time: '7:30 am' },
    { date: 'Tuesday November 10, 2026', time: '7:30 am' },
  ]), release, 2026);
  assert.deepEqual(events.map(event => event.startsAt), ['2026-10-14T12:30:00.000Z', '2026-11-10T13:30:00.000Z']);
  assert.deepEqual(events.map(event => event.id), ['bls:10:2026-10-14', 'bls:10:2026-11-10']);
  assert.ok(events.every(event => event.source === 'bls' && event.referencePeriod === null && event.sourceUrl === 'https://fred.stlouisfed.org/releases/calendar?rid=10&y=2026'));
  assert.deepEqual(decodeFredBlsCalendar(fredPage(2027, 10, release.title, []), release, 2027), []);
  assert.throws(() => decodeFredBlsCalendar(fredPage(2026, 10, release.title, [{ date: 'Wednesday October 99, 2026', time: '7:30 am' }]), release, 2026));
  assert.throws(() => decodeFredBlsCalendar(fredPage(2026, 50, 'Employment Situation', [{ date: 'Wednesday October 14, 2026', time: '7:30 am' }]), release, 2026));
});

test('BLS mirror returns partial dates with a warning and stays disabled with the calendar switch', async () => {
  const requested: string[] = [];
  const fetcher = (async input => {
    const url = new URL(String(input)); requested.push(url.href);
    const id = Number(url.searchParams.get('rid')); const year = Number(url.searchParams.get('y'));
    const title = ({ 10: 'Consumer Price Index', 50: 'Employment Situation', 192: 'Job Openings and Labor Turnover Survey', 46: 'Producer Price Index' } as Record<number, string>)[id];
    if (id === 192 && year === 2026) return new Response('', { status: 503 });
    return new Response(fredPage(year, id, title, year === 2026 ? [{ date: 'Wednesday October 14, 2026', time: '7:30 am' }] : []));
  }) as typeof fetch;
  const runtime = new ProviderRuntime(readConfig({}), fetcher);
  const service = createBlsCalendarService(runtime, () => Date.parse('2026-10-02T10:00:00Z'));
  const result = await service.get();
  assert.ok(result.ok); assert.equal(result.data.length, 3);
  assert.match(result.warning?.message ?? '', /incomplete/);
  assert.equal(requested.length, 8);
  assert.ok(requested.every(url => url.startsWith('https://fred.stlouisfed.org/releases/calendar?')));
  assert.equal((await service.get()).ok, true);
  assert.equal(requested.length, 9); // Failed source retries; successful calendars are cached.
  let disabledRequests = 0;
  const disabled = new ProviderRuntime(readConfig({ ATLAS_CALENDAR_ENABLED: 'false' }), (async () => { disabledRequests++; throw Error('unexpected fetch'); }) as typeof fetch);
  assert.equal((await createBlsCalendarService(disabled, () => Date.parse('2026-10-02T10:00:00Z')).get()).ok, false);
  assert.equal(disabledRequests, 0);
});

const coindarRow = (date: string, suffix: string, end = '') => ({
  caption: `Upgrade ${suffix}`, source: `https://coindar.org/en/event/upgrade-${suffix}-123${suffix}`,
  source_reliable: 'true', important: 'false', date_public: '2026-09-01 10:00',
  date_start: date, date_end: end, coin_id: '1', tags: '9',
});

test('Coindar keeps exact, day, month and quarter dates distinct', () => {
  const rows = [coindarRow('2026-10-02 14:30', '1'), coindarRow('2026-10-03', '2'),
    coindarRow('2026-11', '3'), coindarRow('2027-Q1', '4')];
  const events = decodeCoindarEvents(rows);
  assert.deepEqual(events.map(event => event.precision), ['time', 'day', 'month', 'quarter']);
  assert.equal(events[0].startsAt, '2026-10-02T14:30:00.000Z');
  assert.equal(events[1].startsAt, null);
  assert.equal(events[2].untilDate, '2026-11-30');
  assert.equal(events[3].untilDate, '2027-03-31');
  assert.equal(events[3].dateLabel, 'Q1 2027');
  assert.equal(decodeCoindarEvents([rows[0], rows[0]]).length, 1);
  assert.throws(() => decodeCoindarEvents([coindarRow('2026-02-30', '5')]));
  assert.throws(() => decodeCoindarEvents([{ ...rows[0], source: 'https://example.com/event/1' }]));
});

test('Coindar stays disabled until explicitly enabled with a server token', async () => {
  let requested = '';
  const fetcher = (async input => { requested = String(input); return new Response(JSON.stringify([coindarRow('2026-10', '6')])); }) as typeof fetch;
  const disabled = new ProviderRuntime(readConfig({ COINDAR_ACCESS_TOKEN: 'private-token' }), fetcher);
  assert.equal((await createCoindarService(disabled).upcoming()).ok, false);
  assert.equal(requested, '');
  const runtime = new ProviderRuntime(readConfig({ ATLAS_COINDAR_ENABLED: 'true', COINDAR_ACCESS_TOKEN: 'private-token' }), fetcher);
  const service = createCoindarService(runtime, () => Date.parse('2026-10-02T10:00:00Z'));
  const result = await service.upcoming();
  assert.ok(result.ok); assert.equal(result.data[0].dateLabel, 'October 2026');
  assert.match(requested, /^https:\/\/coindar\.org\/api\/v2\/events\?/);
  assert.match(requested, /access_token=private-token/);
  assert.doesNotMatch(JSON.stringify(result), /private-token/);
  assert.equal((await service.upcoming()).ok, true);
  assert.equal(runtime.status().find(status => status.id === 'coindar')?.requests, 1);
});

test('calendar stars persist source snapshots by workspace and reject corrupt saved data', () => {
  const event = { id: 'fomc:2026-10-28', category: 'macro' as const, title: 'FOMC meeting',
    dateLabel: 'Oct 28, 2026', sortAt: '2026-10-28T12:00:00Z', untilDate: '2026-10-28',
    sourceLabel: 'Federal Reserve', sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    projectHref: null, note: '', projectId: null };
  const saved = toggleCalendarStar(parseCalendarStars(null), event);
  assert.deepEqual(parseCalendarStars(JSON.stringify(saved)), saved);
  assert.equal(toggleCalendarStar(saved, event).events.length, 0);
  assert.notEqual(calendarStarsStorageKey('browser'), calendarStarsStorageKey('account-id'));
  assert.throws(() => parseCalendarStars('{"version":1,"events":[{},{}]}'));
  assert.throws(() => parseCalendarStars(JSON.stringify({ version: 1, events: [event, event] })));
  assert.throws(() => toggleCalendarStar(saved, { ...event, id: 'other:123' }));
});

test('calendar watchlist keeps legacy stars and restores missing IDs without overwriting notes', () => {
  const first = { id: 'fomc:2026-10-28', category: 'macro' as const, title: 'FOMC meeting',
    dateLabel: 'Oct 28, 2026', sortAt: '2026-10-28T12:00:00Z', untilDate: '2026-10-28',
    sourceLabel: 'Federal Reserve', sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', projectHref: null };
  const legacy = parseCalendarStars(JSON.stringify({ version: 1, events: [first] }));
  assert.equal(legacy.events[0].note, '');
  assert.equal(legacy.events[0].projectId, null);
  const projectId = '04671f3a-e6fa-4adc-aa9d-313861ed882f';
  const edited = updateCalendarStar(legacy, first.id, { note: '  Watch the decision and projections.  ', projectId });
  assert.equal(edited.events[0].note, 'Watch the decision and projections.');
  const second = { ...first, id: 'bls:2026-11-01', title: 'Employment report', sourceLabel: 'BLS via FRED' };
  const restored = mergeCalendarStars(JSON.stringify(edited), JSON.stringify({ version: 1, events: [{ ...first, note: 'Do not replace' }, second] }));
  assert.equal(restored.events.length, 2);
  assert.equal(restored.events[0].note, edited.events[0].note);
  assert.equal(restored.events[0].projectId, projectId);
  assert.throws(() => updateCalendarStar(edited, 'fomc:missing', { note: '', projectId: null }));
  assert.throws(() => mergeCalendarStars(JSON.stringify(edited), '{"version":1,"events":[{}]}'));
});
