'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card, PageHeader } from '@/components/shared';
import { convictionLevels, narrativeOptions, projectStatuses, projectSchema, type ResearchProject } from '@/lib/projects';
import { useProjects } from './store';
import { buttonClass, Field, inputClass } from './fields';
import { ProjectLiveData } from './live-data';
import { ProjectDetailsEditor } from './details';
import { CapitalSourceLinks } from './capital-sources';
import { ScrapbookLibrary } from '@/components/library/scrapbook-library';
import { ResearchCoverage } from './coverage';
import { AssetPicker } from './asset-picker';
import { ProviderProfileCard } from './provider-profile';
import { ReviewEditor, CatalystEditor } from './routine';
const tabs = ['Overview', 'Research', 'Markets & Liquidity', 'Capital & Tokenomics', 'News & Catalysts', 'Library'] as const;
export function ProjectWorkspace({ id }: { id: string }) {
  const store = useProjects(); const project = store.projects.find(p => p.id === id);
  if (!store.ready) return <p className="text-muted-foreground">Loading research… {store.error && <span role="alert">{store.error} <button onClick={() => void store.reload()}>Retry</button></span>}</p>;
  if (!project) return <Card className="p-8"><h1 className="text-xl font-semibold">Project not found in this workspace</h1><p className="my-3 text-muted-foreground">Create a project or import your research backup to open it here.</p>{store.error && <p role="alert">{store.error}</p>}<Link href="/projects" className="text-primary hover:underline">Back to projects →</Link></Card>;
  return <Editor key={id} project={project} />;
}
function Editor({ project }: { project: ResearchProject }) {
  const store = useProjects(); const [draft, setDraft] = useState(project); const [tab, setTab] = useState<typeof tabs[number]>('Overview'); const [saved, setSaved] = useState(project); const [message, setMessage] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [eventDraft, setEventDraft] = useState({ title: '', date: '', url: '' });
  const pendingEntry = Boolean(reviewNote.trim() || eventDraft.title || eventDraft.date || eventDraft.url);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const unsaved = dirty || pendingEntry;
  useEffect(() => {
    const prevent = (e: BeforeUnloadEvent) => { if (unsaved) { e.preventDefault(); e.returnValue = ''; } };
    const guardLink = (e: MouseEvent) => { const anchor = (e.target as HTMLElement).closest('a'); if (unsaved && anchor && !anchor.target && !window.confirm('Leave without saving your research changes?')) e.preventDefault(); };
    window.addEventListener('beforeunload', prevent); document.addEventListener('click', guardLink, true);
    return () => { window.removeEventListener('beforeunload', prevent); document.removeEventListener('click', guardLink, true); };
  }, [unsaved]);
  function update<K extends keyof ResearchProject>(key: K, value: ResearchProject[K]) { setDraft(d => ({ ...d, [key]: value })); setMessage(''); }
  async function save(candidate: ResearchProject = draft): Promise<boolean> {
    const result = projectSchema.safeParse({ ...candidate, updatedAt: new Date().toISOString() });
    if (!result.success) { const issue = result.error.issues[0]; setMessage(`${issue.path.join(' → ')}: ${issue.message}`); return false; }
    const next = result.data;
    if (project.updatedAt !== saved.updatedAt) { setMessage('This project changed in another tab. Export your work or reload before saving over the newer version.'); return false; }
    if (await store.save(next, saved.updatedAt)) { setDraft(next); setSaved(next); setMessage(store.mode === 'cloud' ? 'Research saved to your private cloud workspace.' : 'Research saved in this browser.'); return true; }
    return false;
  }
  const note = (key: 'summary' | 'thesis' | 'risks' | 'catalysts' | 'invalidation' | 'fundamentals' | 'capital' | 'notes', title: string, placeholder: string, rows = 5) => <Field label={title}><textarea className={`${inputClass} resize-y leading-relaxed`} rows={rows} maxLength={20000} value={draft[key]} onChange={e => update(key, e.target.value)} placeholder={placeholder} /></Field>;
  return <fieldset disabled={store.busy} aria-busy={store.busy} className="min-w-0 space-y-6">
    <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">← All projects</Link>
    <PageHeader title={saved.name} description={`${saved.symbol || 'No ticker'} · Your project research workspace`}><Badge variant="outline">{saved.status}</Badge><button className={`${buttonClass} bg-primary text-primary-foreground`} disabled={!dirty || !draft.name.trim() || store.busy || !store.ready} onClick={() => void save()}>Save research</button></PageHeader>
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>Manual research · {store.mode === 'cloud' ? 'saved to your account' : 'saved in this browser'} · {unsaved ? 'Unsaved changes' : `Last saved ${new Date(saved.updatedAt).toLocaleString()}`}</span><button className="hover:underline" onClick={store.exportFile}>Export saved research</button></div>
    {(message || store.error) && <p role="status" className="rounded border border-primary/30 bg-primary/10 p-3 text-sm">{store.error || message}</p>}
    <ResearchCoverage project={draft} />
    {pendingEntry && <p className="text-xs text-warning">An unfinished review or event is kept while you switch sections. Use Save research &amp; log review on Overview, or Add event to draft on News &amp; Catalysts, to include it in saved research.</p>}
    <div className="flex gap-1 overflow-x-auto border-b" role="tablist" aria-label="Project sections">{tabs.map(t => <button key={t} role="tab" aria-selected={tab === t} id={`tab-${t.split(' ')[0]}`} aria-controls="project-panel" className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div role="tabpanel" id="project-panel" aria-labelledby={`tab-${tab.split(' ')[0]}`}>
    {tab === 'Overview' && <div className="mb-5 grid items-start gap-5 lg:grid-cols-2"><ProviderProfileCard project={draft} onApply={profile => update('providerProfile', profile)} /><ReviewEditor project={draft} note={reviewNote} setNote={setReviewNote} onChange={review => update('review', review)} onLog={async note => save({ ...draft, review: { ...draft.review, entries: [{ id: crypto.randomUUID(), recordedAt: new Date().toISOString(), note, nextAction: draft.review.nextAction, nextReviewOn: draft.review.nextReviewOn }, ...draft.review.entries].slice(0, 100) } })} /></div>}
    {tab === 'Overview' && <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"><Card className="space-y-5 p-5"><h2 className="font-semibold">Project identity</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Project name"><input className={inputClass} required maxLength={100} value={draft.name} onChange={e => update('name', e.target.value)} /></Field><Field label="Ticker"><input className={inputClass} maxLength={20} value={draft.symbol} onChange={e => update('symbol', e.target.value)} /></Field></div>{note('summary', 'What does this project do?', 'Describe its product, users and why it matters.', 4)}<div><h3 className="mb-3 text-sm text-muted-foreground">Narratives · select all that apply</h3><div className="flex flex-wrap gap-2">{Array.from(new Set([...narrativeOptions, ...draft.narratives])).map(n => <button key={n} aria-pressed={draft.narratives.includes(n)} className={`rounded-full border px-3 py-1.5 text-xs ${draft.narratives.includes(n) ? 'border-primary bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-secondary'}`} onClick={() => update('narratives', draft.narratives.includes(n) ? draft.narratives.filter(x => x !== n) : [...draft.narratives, n])}>{n}</button>)}</div></div></Card><div className="space-y-5"><Card className="space-y-4 p-5"><h2 className="font-semibold">Your decision</h2><Field label="Research status"><select className={inputClass} value={draft.status} onChange={e => update('status', e.target.value as ResearchProject['status'])}>{projectStatuses.map(s => <option key={s}>{s}</option>)}</select></Field><Field label="Conviction"><select className={inputClass} value={draft.conviction} onChange={e => update('conviction', e.target.value as ResearchProject['conviction'])}>{convictionLevels.map(s => <option key={s}>{s}</option>)}</select></Field><p className="text-xs text-muted-foreground">Your assessment, not an automated recommendation.</p></Card><Card className="space-y-4 p-5"><h2 className="font-semibold">Connect market data</h2><AssetPicker disabled={store.busy} onSelect={asset => setDraft(d => ({ ...d, coinpaprikaId: asset.asset.coinpaprikaId!, providerProfile: d.coinpaprikaId === asset.asset.coinpaprikaId ? d.providerProfile : null }))} /><Field label="Selected CoinPaprika ID"><input className={inputClass} maxLength={100} value={draft.coinpaprikaId} placeholder="e.g. btc-bitcoin" onChange={e => setDraft(d => ({ ...d, coinpaprikaId: e.target.value.toLowerCase(), providerProfile: null }))} /></Field><Field label="CoinMarketCap ID"><input className={inputClass} placeholder="e.g. 1 for Bitcoin" maxLength={10} inputMode="numeric" value={draft.cmcId} onChange={e => update('cmcId', e.target.value.trim())} /></Field><Field label="CoinGecko ID"><input className={inputClass} placeholder="e.g. bitcoin" maxLength={100} value={draft.coingeckoId} onChange={e => update('coingeckoId', e.target.value.toLowerCase())} /></Field><Field label="DEX chain ID"><input className={inputClass} placeholder="e.g. ethereum or solana" maxLength={100} value={draft.chainId} onChange={e => update('chainId', e.target.value.toLowerCase())} /></Field><Field label="Token contract address"><input className={`${inputClass} font-mono`} maxLength={128} value={draft.address} onChange={e => update('address', e.target.value.trim())} /></Field><p className="text-xs text-muted-foreground">Confirm the exact asset ID and contract before loading data. A ticker alone does not identify a token.</p></Card></div></div>}
    {tab === 'Overview' && <div className="mt-5"><ProjectDetailsEditor section="links" details={draft.details} onChange={value => update('details', value)} /></div>}
    {tab === 'Research' && <div className="grid gap-5 lg:grid-cols-2"><Card className="space-y-5 p-5">{note('thesis', 'Investment thesis', 'Why could this succeed? What is your edge?')}{note('fundamentals', 'Fundamentals & evidence', 'Team, product, adoption, utility, competition. Include source links and dates.')}</Card><Card className="space-y-5 p-5">{note('risks', 'Key risks', 'What can go wrong? Which assumptions remain unverified?')}{note('invalidation', 'What would change your mind?', 'Write specific evidence or conditions that invalidate the thesis.')}{note('notes', 'Research notes', 'Questions, links and next actions.', 4)}</Card></div>}
    {tab === 'Research' && <div className="mt-5"><ProjectDetailsEditor section="team" details={draft.details} onChange={value => update('details', value)} /></div>}
    {tab === 'Markets & Liquidity' && <ProjectLiveData project={saved} />}
    {tab === 'Capital & Tokenomics' && <div className="space-y-5"><ProjectDetailsEditor section="funding" details={draft.details} onChange={value => update('details', value)} /><CapitalSourceLinks /><ProjectDetailsEditor section="tokenomics" details={draft.details} onChange={value => update('details', value)} /><Card className="space-y-5 p-5"><h2 className="font-semibold">Capital structure</h2><p className="text-sm text-muted-foreground">Funding, investor, sale-price and unlock feeds are planned. Record verified research here while those sources are connected.</p>{note('capital', 'Funding, investors, token sales & unlocks', 'Round and date · amount raised · investors · sale price · vesting/unlocks · supply. Include source links, dates and any uncertainty.', 12)}<Link href="/data-sources" className="inline-block text-sm text-primary hover:underline">See planned data sources →</Link></Card></div>}
    {tab === 'News & Catalysts' && <div className="mb-5"><CatalystEditor draft={eventDraft} setDraft={setEventDraft} events={draft.events} onChange={events => update('events', events)} /></div>}
    {tab === 'Library' && <ScrapbookLibrary projectId={project.id} />}
    {tab === 'News & Catalysts' && <Card className="space-y-5 p-5"><h2 className="font-semibold">What could change the story?</h2><p className="text-sm text-muted-foreground">Project news and calendar feeds are not connected yet. Keep upcoming catalysts and source links here.</p>{note('catalysts', 'Catalysts & events to monitor', 'Launches, upgrades, exchange listings, unlock dates, partnerships. Record a source and date for each.', 12)}</Card>}
    </div>
  </fieldset>;
}
