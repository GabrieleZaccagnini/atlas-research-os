'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, PageHeader, Badge } from '@/components/shared';
import { useProjects } from '@/components/projects/store';
import { projectEvents } from '@/lib/research-desk';
import { localDay, displayDay } from '@/lib/research-routine';
import { buttonClass } from '@/components/projects/fields';
export default function CalendarPage() {
  const store = useProjects(); const [past, setPast] = useState(false); const [today, setToday] = useState('');
  useEffect(() => { const tick = () => setToday(localDay()); tick(); const timer = setInterval(tick, 60000); return () => clearInterval(timer); }, []);
  const events = projectEvents(store.projects).filter(e => past || e.event.date >= today);
  return <div className="space-y-5"><PageHeader title="Research calendar" description="Project catalysts you recorded. Confirm dates and details at the source."><button aria-pressed={past} className={buttonClass} onClick={() => setPast(!past)}>{past ? 'Show upcoming only' : 'Include past events'}</button></PageHeader><p className="text-sm text-muted-foreground">Manual research · calendar-day dates · archived projects excluded. Automated macro calendars and unlocks are not connected yet. News is available in the News workspace.</p>{store.error && <p role="alert">{store.error} <button onClick={() => void store.reload()} className="underline">Retry</button></p>}{!store.ready ? <p>Loading events…</p> : !events.length ? <Card className="space-y-3 p-8"><h2 className="font-semibold">No {past ? '' : 'upcoming '}events recorded</h2><p className="text-sm text-muted-foreground">Add dated catalysts and source links in a project’s News &amp; Catalysts section, then save the project.</p><Link href="/projects" className="inline-block text-sm text-primary">Open projects →</Link></Card> : events.map(({ project, event }) => <Card className="flex flex-wrap items-start gap-5 p-5" key={`${project.id}:${event.id}`}><div className="min-w-[120px]"><p className="font-mono text-sm text-primary">{displayDay(event.date)}</p>{event.date === today && <Badge variant="primary">Today</Badge>}</div><div className="min-w-0 flex-1"><h2 className="font-semibold">{event.title}</h2><Link href={`/projects/${project.id}`} className="text-sm text-muted-foreground hover:text-primary">{project.name} ↗</Link>{event.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{event.notes}</p>}<p className="mt-2 text-xs text-muted-foreground">{event.sourceUrl ? 'Source attached; not independently verified by Atlas' : 'Source missing'}</p></div>{event.sourceUrl && <a className={buttonClass} href={event.sourceUrl} target="_blank" rel="noreferrer">Check source ↗</a>}</Card>)}</div>;
}
