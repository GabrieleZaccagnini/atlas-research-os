'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Card, PageHeader } from '@/components/shared';
import { useProjects } from '@/components/projects/store';
import { reviewHistory } from '@/lib/research-desk';
import { displayDay } from '@/lib/research-routine';
import { buttonClass, inputClass } from '@/components/projects/fields';
export default function JournalPage() {
  const store = useProjects(); const [query, setQuery] = useState('');
  const entries = reviewHistory(store.projects).filter(({ project, entry }) => `${project.name} ${project.symbol} ${entry.note}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-5"><PageHeader title="Research journal" description="What you knew, what changed, and what you planned to investigate next."><button className={buttonClass} disabled={!store.ready} onClick={store.exportFile}>Export research &amp; reviews</button></PageHeader><input className={inputClass} aria-label="Search review journal" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects or review notes…" />{store.error && <p role="alert">{store.error} <button onClick={() => void store.reload()} className="underline">Retry</button></p>}{!store.ready ? <p>Loading reviews…</p> : !entries.length ? <Card className="space-y-3 p-8"><h2 className="font-semibold">{query ? 'No matching reviews' : 'Your first review starts with a project'}</h2><p className="text-sm text-muted-foreground">Open a project, record a review note and save it. Your dated notes and next actions appear here. Trade accounting and strategy outcomes are still planned.</p><Link className="inline-block text-sm text-primary" href="/projects">Open projects →</Link></Card> : entries.map(({ project, entry }) => <Card className="space-y-3 p-5" key={`${project.id}:${entry.id}`}><div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/projects/${project.id}`} className="font-semibold text-primary hover:underline">{project.name} · {project.symbol} ↗</Link><time className="text-xs text-muted-foreground" dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.note}</p>{entry.nextAction && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Next action:</span> {entry.nextAction}</p>}{entry.nextReviewOn && <p className="text-xs text-muted-foreground">Review scheduled at the time: {displayDay(entry.nextReviewOn)}</p>}</Card>)}</div>;
}
