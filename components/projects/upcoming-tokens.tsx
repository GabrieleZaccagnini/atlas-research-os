'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/shared';
import { displayDay, localDay } from '@/lib/research-routine';
import { newDetail } from '@/lib/project-details';
import { newProject, projectSchema, upcomingTokenProjects, type ResearchProject } from '@/lib/projects';
import { useProjects } from './store';
import { buttonClass, Field, inputClass } from './fields';

const officialLinkLabels = ['Website', 'X', 'Documentation', 'Discord', 'Telegram', 'GitHub'] as const;
type OfficialLinkLabel = typeof officialLinkLabels[number];
const emptyOfficialLinks = () => Object.fromEntries(officialLinkLabels.map(label => [label, ''])) as Record<OfficialLinkLabel, string>;

export function UpcomingTokens() {
  const store = useProjects();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [stage, setStage] = useState<'Potential' | 'Announced'>('Potential');
  const [expectedOn, setExpectedOn] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [officialLinks, setOfficialLinks] = useState(emptyOfficialLinks);
  const [reason, setReason] = useState('');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const existing = store.projects.find(project => project.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase());
  const candidates = upcomingTokenProjects(store.projects).filter(project => `${project.name} ${project.symbol} ${project.tokenLaunch.reason} ${project.details.links.map(link => link.label).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    if (existing) { setNotice('A project with this name is already saved. Open it and set its token launch stage there.'); return; }
    const base = newProject(name, symbol);
    const candidate = {
      ...base,
      tokenLaunch: { stage, expectedOn, sourceUrl, reason },
      details: { ...base.details, links: officialLinkLabels.filter(label => officialLinks[label].trim()).map(label => ({ ...newDetail('links'), label, url: officialLinks[label] })) },
    } satisfies ResearchProject;
    const parsed = projectSchema.safeParse(candidate);
    if (!parsed.success) { setNotice(parsed.error.issues[0].message); return; }
    if (await store.save(parsed.data)) {
      setName(''); setSymbol(''); setStage('Potential'); setExpectedOn(''); setSourceUrl(''); setOfficialLinks(emptyOfficialLinks()); setReason('');
      setNotice(`${parsed.data.name} added to your upcoming-token research.`);
    }
  }

  return <div className="space-y-5">
    <PageHeader title="Upcoming tokens" description="Keep promising pre-launch projects on your radar before a ticker, contract or market feed exists.">
      <Link className={buttonClass} href="/projects">All projects →</Link>
      <button type="button" className={buttonClass} onClick={store.exportFile} disabled={!store.ready}>Backup research</button>
    </PageHeader>
    <Card className="space-y-4 p-5">
      <div><h2 className="font-semibold">Add a token to research</h2><p className="mt-1 text-xs text-muted-foreground">A lead can be speculative. Record the source and your reason for watching it; Atlas will not assume a token or launch date is confirmed.</p></div>
      <form className="space-y-4" onSubmit={event => void add(event)}>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Project or token name"><input className={inputClass} autoComplete="off" required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Name you found" /></Field><Field label="Ticker, if known"><input className={inputClass} autoComplete="off" maxLength={20} value={symbol} onChange={event => setSymbol(event.target.value)} placeholder="Leave blank if unannounced" /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Your tracking stage"><select className={inputClass} value={stage} onChange={event => setStage(event.target.value as 'Potential' | 'Announced')}><option value="Potential">Potential token · unconfirmed</option><option value="Announced">Token announced · check source</option></select></Field><Field label="Possible launch date"><input className={inputClass} type="date" value={expectedOn} onChange={event => setExpectedOn(event.target.value)} /></Field></div>
        <Field label="Discovery or launch-announcement source"><input className={inputClass} type="url" maxLength={2000} value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://…" /></Field>
        <div className="space-y-3"><div><h3 className="text-sm font-medium">Official and social links</h3><p className="mt-1 text-xs text-muted-foreground">Optional. Add the links you have found; check that each one really belongs to the project.</p></div><div className="grid gap-4 sm:grid-cols-2">{officialLinkLabels.map(label => <Field key={label} label={label}><input className={inputClass} type="url" maxLength={2000} value={officialLinks[label]} onChange={event => setOfficialLinks(current => ({ ...current, [label]: event.target.value }))} placeholder="https://…" /></Field>)}</div></div>
        <Field label="Why might it have potential?"><textarea className={`${inputClass} min-h-24`} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} placeholder="What caught your eye, and what still needs checking?" /></Field>
        {existing && <p className="text-xs text-warning">{existing.name} is already saved. <Link className="underline" href={`/projects/${existing.id}`}>Open its research →</Link></p>}
        <button className={`${buttonClass} bg-primary text-primary-foreground`} disabled={!store.ready || store.busy || !name.trim() || Boolean(existing)}>Save candidate</button>
      </form>
      {(notice || store.error) && <p role="status" className="text-sm text-warning">{store.error || notice}</p>}
    </Card>
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Your upcoming-token list</h2><p className="mt-1 text-xs text-muted-foreground">{candidates.length} visible · dated leads first, then undated leads</p></div><input className={`${inputClass} max-w-xs`} aria-label="Search upcoming tokens" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, ticker or note" /></div>
      {!store.ready ? <p className="mt-5 text-sm text-muted-foreground">Loading saved research…</p> : candidates.length ? <div className="mt-4 divide-y divide-border/40">{candidates.map(project => <div key={project.id} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link className="font-medium hover:text-primary" href={`/projects/${project.id}`}>{project.name} ↗</Link><Badge variant="outline">{project.tokenLaunch.stage === 'Announced' ? 'Announced · user marked' : 'Potential'}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{project.symbol || 'Ticker unknown'} · {project.tokenLaunch.expectedOn ? `Possible launch ${displayDay(project.tokenLaunch.expectedOn)}` : 'Launch date unknown'}{project.tokenLaunch.expectedOn && project.tokenLaunch.expectedOn < localDay() ? ' · Date passed; review' : ''}</p>{project.tokenLaunch.reason && <p className="mt-2 whitespace-pre-wrap text-sm">{project.tokenLaunch.reason}</p>}<div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">{project.details.links.filter(link => link.url).map(link => <a key={link.id} className="text-primary hover:underline" href={link.url} target="_blank" rel="noreferrer">{link.label || 'Link'} ↗</a>)}</div></div><div className="flex flex-wrap items-start gap-3 text-xs"><Link className="text-primary hover:underline" href={`/projects/${project.id}`}>Open research →</Link>{project.tokenLaunch.sourceUrl && <a className="text-primary hover:underline" href={project.tokenLaunch.sourceUrl} target="_blank" rel="noreferrer">Check source ↗</a>}</div></div>)}</div> : <p className="mt-5 text-sm text-muted-foreground">{query ? 'No upcoming tokens match this search.' : 'No upcoming tokens saved yet. Add the first lead above.'}</p>}
      <p className="mt-4 border-t border-border/40 pt-3 text-xs text-muted-foreground">Dates and token stages are your research notes, not verified listings or launch announcements. Open a project to update its stage, source links and thesis. These possible dates are not added to the verified calendar automatically.</p>
    </Card>
  </div>;
}
