'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/shared';
import { useAuth } from '@/components/auth/provider';
import { useProjects } from '@/components/projects/store';
import { buttonClass, inputClass } from '@/components/projects/fields';
import { useFeed, type Feed } from '@/components/dashboard/use-feed';
import { projectEvents } from '@/lib/research-desk';
import { displayDay, localDay } from '@/lib/research-routine';
import { scheduledDate, scheduledTime, scheduledUpcoming } from '@/lib/scheduled-calendar';
import type { ScheduledCalendarEvent } from '@/services/calendar/types';
import type { CoindarEvent } from '@/services/calendar/coindar';
import type { ResearchProject } from '@/lib/projects';
import { calendarStarsStorageKey, mergeCalendarStars, parseCalendarStars, toggleCalendarStar, updateCalendarStar, type CalendarStar } from '@/lib/calendar-stars';

type View = 'all' | 'crypto' | 'macro' | 'starred';
type ProjectEvent = ResearchProject['events'][number];
type CalendarRow =
  | { kind: 'macro'; id: string; sortAt: string; event: ScheduledCalendarEvent }
  | { kind: 'coindar'; id: string; sortAt: string; event: CoindarEvent }
  | { kind: 'project'; id: string; sortAt: string; project: ResearchProject; event: ProjectEvent }
  | { kind: 'saved'; id: string; sortAt: string; star: CalendarStar };

function starSnapshot(row: CalendarRow): CalendarStar {
  if (row.kind === 'saved') return row.star;
  if (row.kind === 'macro') return {
    id: row.id, category: 'macro', title: row.event.title, dateLabel: scheduledDate(row.event),
    sortAt: row.sortAt, untilDate: row.event.date, sourceLabel: row.event.source === 'bea' ? 'BEA' : row.event.source === 'bls' ? 'BLS via FRED' : 'Federal Reserve',
    sourceUrl: row.event.sourceUrl, projectHref: null, note: '', projectId: null,
  };
  if (row.kind === 'coindar') return {
    id: row.id, category: 'crypto', title: row.event.title, dateLabel: row.event.dateLabel,
    sortAt: row.sortAt, untilDate: row.event.untilDate, sourceLabel: 'Coindar',
    sourceUrl: row.event.sourceUrl, projectHref: null, note: '', projectId: null,
  };
  return {
    id: row.id, category: 'crypto', title: row.event.title, dateLabel: displayDay(row.event.date),
    sortAt: row.sortAt, untilDate: row.event.date, sourceLabel: row.project.name,
    sourceUrl: row.event.sourceUrl || null, projectHref: `/projects/${row.project.id}`, note: '', projectId: row.project.id,
  };
}

function SourceState<T>({ name, url, feed }: { name: string; url: string; feed: Feed<T> }) {
  const error = feed.error ?? (feed.result?.ok === false ? feed.result.error.message : null);
  const warning = feed.result?.ok ? feed.result.warning?.message : null;
  return <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
    <a href={url} target="_blank" rel="noreferrer" className="hover:text-primary">{name} ↗</a>
    <span>{error ? `Unavailable: ${error}` : feed.result?.ok ? `${feed.result.meta.cache === 'stale' ? 'Stale snapshot' : 'Fetched'} ${new Date(feed.result.meta.fetchedAt).toLocaleString()}${warning ? ` · ${warning}` : ''}` : 'Loading…'}</span>
  </div>;
}

function EventRow({ row, today, star, starsReady, projects, toggleStar, saveStar }: { row: CalendarRow; today: string; star?: CalendarStar; starsReady: boolean; projects: ResearchProject[]; toggleStar: (row: CalendarRow) => void; saveStar: (id: string, note: string, projectId: string | null) => boolean }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');
  const [projectId, setProjectId] = useState('');
  const starred = Boolean(star);
  const linkedProject = projects.find(project => project.id === star?.projectId);
  const date = row.kind === 'macro' ? scheduledDate(row.event) : row.kind === 'coindar' ? row.event.dateLabel : row.kind === 'project' ? displayDay(row.event.date) : row.star.dateLabel;
  const title = row.kind === 'saved' ? row.star.title : row.event.title;
  return <div className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[155px_minmax(0,1fr)_auto] sm:items-start">
    <div className="flex flex-wrap items-center gap-2"><time className="font-mono text-sm text-primary" dateTime={row.kind === 'macro' ? row.event.date : row.kind === 'coindar' ? row.event.sortDate : row.kind === 'project' ? row.event.date : row.star.untilDate}>{date}</time>{row.kind === 'project' && row.event.date === today && <Badge variant="primary">Today</Badge>}</div>
    <div className="min-w-0">
      <p className="text-sm font-medium">{title}</p>
      {row.kind === 'macro' && <p className="mt-1 text-xs text-muted-foreground">Macro · {row.event.source === 'bea' ? 'BEA' : row.event.source === 'bls' ? 'BLS via FRED' : 'Federal Reserve'} · {scheduledTime(row.event)}</p>}
      {row.kind === 'coindar' && <p className="mt-1 text-xs text-muted-foreground">Crypto · Coindar · {row.event.precision === 'month' || row.event.precision === 'quarter' ? 'Estimated window' : row.event.precision === 'day' ? 'Time unknown' : 'UTC time'}{row.event.important ? ' · Marked important by Coindar' : ''}</p>}
      {row.kind === 'project' && <><p className="mt-1 text-xs text-muted-foreground">Crypto · Your project · <Link href={`/projects/${row.project.id}`} className="hover:text-primary">{row.project.name} ↗</Link></p>{row.event.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{row.event.notes}</p>}<p className="mt-2 text-xs text-muted-foreground">{row.event.sourceUrl ? 'Source attached; not independently verified by Atlas' : 'Source missing'}</p></>}
      {row.kind === 'saved' && <p className="mt-1 text-xs text-warning">{row.star.category === 'macro' ? 'Macro' : 'Crypto'} · {row.star.sourceLabel} · Saved snapshot; check the current date at the source.</p>}
      {star?.note && <p className="mt-2 whitespace-pre-wrap text-xs text-foreground"><span className="font-medium">Why I’m watching:</span> {star.note}</p>}
      {linkedProject && <Link className="mt-1 block text-xs text-primary hover:underline" href={`/projects/${linkedProject.id}`}>Linked project: {linkedProject.name} ↗</Link>}
      {star?.projectId && !linkedProject && <p className="mt-1 text-xs text-warning">Linked project is no longer available in this workspace.</p>}
    </div>
    <div className="flex items-center gap-3 sm:justify-end">
      <button type="button" disabled={!starsReady} aria-pressed={starred} aria-label={starred ? `Remove star from ${title}` : `Star ${title}`} title={starred ? 'Remove star' : 'Star this event'} onClick={() => toggleStar(row)} className={`rounded-md p-1 hover:bg-secondary disabled:opacity-40 ${starred ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}><Star size={18} fill={starred ? 'currentColor' : 'none'} /></button>
      {starred && <button type="button" className="text-xs text-primary hover:underline" onClick={() => { setNote(star?.note ?? ''); setProjectId(star?.projectId ?? ''); setEditing(value => !value); }}>{editing ? 'Close' : 'Add context'}</button>}
      {row.kind === 'project' ? row.event.sourceUrl && <a href={row.event.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Check source ↗</a> : row.kind === 'saved' ? row.star.sourceUrl ? <a href={row.star.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Check source ↗</a> : row.star.projectHref && <Link href={row.star.projectHref} className="text-xs text-primary hover:underline">Open project ↗</Link> : <a href={row.event.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{row.kind === 'macro' ? 'Verify date ↗' : 'Check event ↗'}</a>}
    </div>
    {editing && star && <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-3 sm:col-span-2 sm:col-start-2">
      <label className="block text-xs text-muted-foreground">Why does this matter to your research?<textarea className={`${inputClass} mt-1 min-h-20`} value={note} maxLength={2000} onChange={event => setNote(event.target.value)} placeholder="What will you look for before or after this event?" /></label>
      <label className="block text-xs text-muted-foreground">Related Atlas project<select className={`${inputClass} mt-1`} value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">No project linked</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}{project.symbol ? ` (${project.symbol})` : ''}</option>)}</select></label>
      <div className="flex flex-wrap items-center gap-3"><button type="button" className={buttonClass} disabled={!starsReady} onClick={() => { if (saveStar(star.id, note, projectId || null)) setEditing(false); }}>Save context</button><span className="text-[10px] text-muted-foreground">Saved with this star in your browser workspace.</span></div>
    </div>}
  </div>;
}

export default function CalendarPage() {
  const auth = useAuth();
  const store = useProjects();
  const starsKey = calendarStarsStorageKey(auth.session?.user.id ?? 'browser');
  const bea = useFeed<ScheduledCalendarEvent[]>('/api/data/calendar?source=bea');
  const fomc = useFeed<ScheduledCalendarEvent[]>('/api/data/calendar?source=fomc');
  const bls = useFeed<ScheduledCalendarEvent[]>('/api/data/calendar?source=bls');
  const crypto = useFeed<CoindarEvent[]>('/api/data/crypto-calendar');
  const [view, setView] = useState<View>('all');
  const [past, setPast] = useState(false);
  const [today, setToday] = useState('');
  const [now, setNow] = useState(0);
  const [stars, setStars] = useState<CalendarStar[]>([]);
  const [loadedStarsKey, setLoadedStarsKey] = useState('');
  const [starsLoaded, setStarsLoaded] = useState(false);
  const [starsError, setStarsError] = useState('');
  const [starsNotice, setStarsNotice] = useState('');
  const [backup, setBackup] = useState<{ url: string; name: string } | null>(null);
  const starsReady = auth.ready && starsLoaded && loadedStarsKey === starsKey;
  const scopedStars = loadedStarsKey === starsKey ? stars : [];
  const scopedStarsError = loadedStarsKey === starsKey ? starsError : '';
  useEffect(() => {
    const tick = () => { setToday(localDay()); setNow(Date.now()); };
    tick(); const timer = setInterval(tick, 60000); return () => clearInterval(timer);
  }, []);
  useEffect(() => { if (new URLSearchParams(window.location.search).get('view') === 'starred') setView('starred'); }, []);
  useEffect(() => () => { if (backup) URL.revokeObjectURL(backup.url); }, [backup]);
  useEffect(() => { setBackup(null); setStarsNotice(''); }, [starsKey]);
  useEffect(() => {
    if (!auth.ready) return;
    function reloadStars() {
      try { setStars(parseCalendarStars(localStorage.getItem(starsKey)).events); setLoadedStarsKey(starsKey); setStarsLoaded(true); setStarsError(''); }
      catch { setLoadedStarsKey(starsKey); setStarsLoaded(false); setStarsError('Starred events could not be loaded. Saved data has not been overwritten.'); }
    }
    reloadStars();
    const sync = (event: StorageEvent) => { if (event.key === starsKey || event.key === null) reloadStars(); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [auth.ready, starsKey]);
  function toggleStar(row: CalendarRow) {
    if (!starsReady) return;
    try {
      const current = parseCalendarStars(localStorage.getItem(starsKey));
      const previous = current.events.find(event => event.id === row.id);
      if (previous && (previous.note || previous.projectId) && !window.confirm('Remove this star and its saved context?')) return;
      const next = toggleCalendarStar(current, starSnapshot(row));
      localStorage.setItem(starsKey, JSON.stringify(next));
      setStars(next.events); setStarsError(''); setStarsNotice('');
    } catch { setStarsError('Could not save this star. Browser storage may be full or unavailable.'); }
  }
  function saveStar(id: string, note: string, projectId: string | null): boolean {
    if (!starsReady) return false;
    try {
      if (projectId && !store.projects.some(project => project.id === projectId)) throw Error('Choose an existing project.');
      const next = updateCalendarStar(parseCalendarStars(localStorage.getItem(starsKey)), id, { note, projectId });
      localStorage.setItem(starsKey, JSON.stringify(next)); setStars(next.events); setStarsError(''); setStarsNotice('Event context saved.'); return true;
    } catch (error) { setStarsError(error instanceof Error ? error.message : 'Could not save event context.'); return false; }
  }
  function backupStars() {
    try {
      const raw = localStorage.getItem(starsKey) ?? JSON.stringify({ version: 1, events: [] });
      setBackup({ url: URL.createObjectURL(new Blob([raw], { type: 'application/json' })), name: `atlas-calendar-watchlist-${new Date().toISOString().slice(0, 10)}.json` });
      setStarsNotice('Backup ready. Select Save watchlist backup file.'); setStarsError('');
    } catch { setStarsError('Could not read the calendar watchlist for backup.'); }
  }
  async function restoreStars(file: File) {
    if (!starsReady) return;
    try {
      if (file.size > 2_000_000) throw Error('Choose a calendar watchlist backup under 2 MB.');
      const incomingRaw = await file.text();
      const currentRaw = localStorage.getItem(starsKey);
      const next = mergeCalendarStars(currentRaw, incomingRaw);
      const added = next.events.length - parseCalendarStars(currentRaw).events.length;
      localStorage.setItem(starsKey, JSON.stringify(next)); setStars(next.events); setStarsError('');
      setStarsNotice(`${added} starred ${added === 1 ? 'event' : 'events'} restored. Existing stars and context were kept.`);
    } catch { setStarsError('Could not restore this calendar watchlist backup. Existing stars were not changed.'); }
  }

  const macroRows: CalendarRow[] = [...(bea.data ?? []), ...(fomc.data ?? []), ...(bls.data ?? [])]
    .filter(event => now && (past || scheduledUpcoming(event, now)))
    .map(event => ({ kind: 'macro', id: event.id, sortAt: event.startsAt ?? `${event.date}T12:00:00Z`, event }));
  const coindarRows: CalendarRow[] = (crypto.data ?? [])
    .filter(event => now && (past || (event.startsAt ? Date.parse(event.startsAt) >= now : event.untilDate >= new Date(now).toISOString().slice(0, 10))))
    .map(event => ({ kind: 'coindar', id: event.id, sortAt: event.startsAt ?? `${event.sortDate < today && !past ? today : event.sortDate}T12:00:00Z`, event }));
  const projectRows: CalendarRow[] = projectEvents(store.projects)
    .filter(({ event }) => past || event.date >= today)
    .map(({ project, event }) => ({ kind: 'project', id: `project:${project.id}:${event.id}`, sortAt: `${event.date}T12:00:00Z`, project, event }));
  const liveRows = [...macroRows, ...coindarRows, ...projectRows];
  const starredIds = new Set(scopedStars.map(star => star.id));
  const liveIds = new Set(liveRows.map(row => row.id));
  const savedRows: CalendarRow[] = scopedStars.filter(star => !liveIds.has(star.id) && (past || star.untilDate >= today))
    .map(star => ({ kind: 'saved', id: star.id, sortAt: star.sortAt, star }));
  const rows = (view === 'starred' ? [...liveRows.filter(row => starredIds.has(row.id)), ...savedRows]
    : liveRows.filter(row => view === 'all' || (view === 'macro' ? row.kind === 'macro' : row.kind !== 'macro')))
    .sort((a, b) => a.sortAt.localeCompare(b.sortAt) || a.id.localeCompare(b.id));
  const loading = view === 'macro' ? bea.loading || fomc.loading || bls.loading : view === 'crypto' ? crypto.loading || !store.ready : view === 'starred' ? !starsReady && !scopedStarsError : bea.loading || fomc.loading || bls.loading || crypto.loading || !store.ready;

  return <div className="space-y-5">
    <PageHeader title="Research calendar" description="Upcoming crypto catalysts and official US economic and policy dates in one schedule.">
      <button aria-pressed={past} className={buttonClass} onClick={() => setPast(!past)}>{past ? 'Show upcoming only' : 'Include past events'}</button>
    </PageHeader>

    <Card className="p-5">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Calendar category">{(['all', 'crypto', 'macro', 'starred'] as const).map(category => <button key={category} type="button" aria-pressed={view === category} onClick={() => setView(category)} className={`rounded-lg px-3 py-1.5 text-xs capitalize ${view === category ? 'bg-secondary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>{category === 'starred' ? `★ Starred (${scopedStars.length})` : category}</button>)}</div>
      {view === 'starred' && <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" className={buttonClass} onClick={backupStars} disabled={!auth.ready}>Backup watchlist</button><label className={`${buttonClass} cursor-pointer`}>Restore watchlist<input className="sr-only" type="file" accept=".json,application/json" disabled={!starsReady} onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void restoreStars(file); event.currentTarget.value = ''; }} /></label>{backup && <a className="text-xs text-primary underline" href={backup.url} download={backup.name}>Save watchlist backup file</a>}</div>}
      <p className="mt-3 text-xs text-muted-foreground">{view === 'all' ? 'Crypto events, your project catalysts and macro dates together.' : view === 'crypto' ? 'Coindar events and your saved project catalysts.' : view === 'macro' ? 'BEA and BLS releases with Federal Reserve meeting dates.' : 'Events you marked. Dates shown as saved snapshots when their live source is unavailable.'}</p>
      {rows.length ? <div className="mt-4 divide-y divide-border/40">{rows.map(row => <EventRow key={`${starsKey}:${row.id}`} row={row} today={today} star={scopedStars.find(star => star.id === row.id)} starsReady={starsReady} projects={store.projects} toggleStar={toggleStar} saveStar={saveStar} />)}</div> : <div className="mt-5 text-sm text-muted-foreground">{loading ? 'Loading calendar events…' : view === 'starred' ? 'No starred events in this date range. Use the star beside an event to save it here.' : <><p>No {past ? '' : 'upcoming '}events in this view from the available sources.</p>{view !== 'macro' && store.ready && !projectRows.length && <p className="mt-2">Add dated catalysts in a project’s News &amp; Catalysts section. <Link href="/projects" className="text-primary">Open projects →</Link></p>}</>}</div>}
      {view !== 'macro' && crypto.result?.ok === false && <p className="mt-4 text-xs text-muted-foreground">Coindar events are not connected yet. Saved project catalysts still appear here.</p>}
      {store.error && view !== 'macro' && <p role="alert" className="mt-4 text-sm">{store.error} <button onClick={() => void store.reload()} className="underline">Retry</button></p>}
      {scopedStarsError && <p role="alert" className="mt-4 text-sm text-warning">{scopedStarsError}</p>}
      {starsNotice && <p role="status" className="mt-4 text-xs text-muted-foreground">{starsNotice}</p>}
    </Card>

    <Card className="space-y-3 p-5 text-xs text-muted-foreground">
      <h2 className="text-sm font-semibold text-foreground">Sources and coverage</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {view !== 'crypto' && <><SourceState name="BEA release schedule" url="https://www.bea.gov/news/schedule/full" feed={bea} /><SourceState name="Federal Reserve meetings" url="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" feed={fomc} /><SourceState name="BLS releases via FRED" url="https://fred.stlouisfed.org/releases/calendar" feed={bls} /></>}
        {view !== 'macro' && <SourceState name="Coindar events" url="https://coindar.org/" feed={crypto} />}
      </div>
      {view !== 'crypto' && <p>BEA and BLS release times are shown in Eastern Time and your local time. FOMC decision times are not announced here. CPI, Employment Situation, JOLTS and PPI dates come from FRED’s BLS release calendars because direct BLS access is blocked from this server. Future-year dates appear when published by FRED, which may lag schedule changes; <a href="https://www.bls.gov/schedule/" target="_blank" rel="noreferrer" className="text-primary">check BLS directly ↗</a>.</p>}
      {view !== 'macro' && <p>Coindar month and quarter dates are approximate. Atlas requests the first 100 events in the next 90 days, not the complete catalog. Open events to check original announcements. <a href="https://coinmarketcal.com/" target="_blank" rel="noreferrer" className="text-primary">Browse CoinMarketCal ↗</a></p>}
      <p>Stars, personal context and project links are saved in this browser for this workspace. Back up and restore the watchlist separately from project research; it does not sync across devices. Saved event dates may become outdated.</p>
      <p>Calendar entries are scheduled events, not forecasts or released values.</p>
    </Card>
  </div>;
}
