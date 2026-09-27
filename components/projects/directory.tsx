'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Download, FolderOpen, Plus, Search, Upload } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/shared';
import { filterProjects, narrativeOptions, newProject, projectStatuses } from '@/lib/projects';
import { useProjects } from './store';
import { buttonClass, Field, inputClass } from './fields';
export function ProjectDirectory({ initialStatus = 'all' }: { initialStatus?: string }) {
  const store = useProjects(); const router = useRouter();
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(initialStatus); const [narrative, setNarrative] = useState('all');
  const [adding, setAdding] = useState(false); const [name, setName] = useState(''); const [symbol, setSymbol] = useState(''); const [notice, setNotice] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get('q') ?? ''); }, []);
  const filtered = filterProjects(store.projects, query, status, narrative);
  const narratives = Array.from(new Set([...narrativeOptions, ...store.projects.flatMap(p => p.narratives)])).sort();
  return <div className="space-y-6">
    <PageHeader title={initialStatus === 'Buy List' ? 'Buy List' : initialStatus === 'Watching' ? 'Watchlists' : 'Projects'} description="One research universe. Follow the projects that matter to you.">
      <button className={buttonClass} onClick={store.exportFile}><Download size={16} /> Export</button>
      <button className={buttonClass} onClick={() => file.current?.click()} disabled={!store.ready || !!store.error}><Upload size={16} /> Import</button>
      <button className={`${buttonClass} bg-primary text-primary-foreground`} onClick={() => setAdding(!adding)} disabled={!store.ready || !!store.error}><Plus size={16} /> Add project</button>
    </PageHeader>
    <input type="file" accept="application/json,.json" className="hidden" ref={file} aria-label="Import research backup" onChange={async e => {
      const chosen = e.target.files?.[0]; if (!chosen) return;
      try { if (chosen.size > 10000000) throw Error(); store.importFile(await chosen.text()); setNotice('Backup imported. Existing projects were kept unchanged.'); }
      catch { setNotice('Import failed. Choose an Atlas JSON backup under 10 MB. No existing research was replaced.'); }
      e.target.value = '';
    }} />
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Saved in this browser · export regularly to keep a backup</span><Link className="text-primary hover:underline" href="/data-sources">View data coverage →</Link></div>
    {(store.error || notice) && <p role="status" className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">{store.error || notice}</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Total projects', store.projects.length], ['Research queue', store.projects.filter(p => p.status === 'Research Queue').length], ['Buy list', store.projects.filter(p => p.status === 'Buy List').length], ['High conviction', store.projects.filter(p => p.conviction === 'High').length]].map(([label, value]) => <Card key={label} className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card>)}</div>
    {adding && <Card className="p-5"><form className="grid items-end gap-4 sm:grid-cols-[1fr_150px_auto]" onSubmit={e => {
      e.preventDefault(); const project = newProject(name, symbol); if (store.save(project)) router.push(`/projects/${project.id}`);
    }}><Field label="Project name"><input autoFocus required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. PEAQ" /></Field><Field label="Ticker"><input maxLength={20} value={symbol} onChange={e => setSymbol(e.target.value)} className={inputClass} placeholder="PEAQ" /></Field><button className={`${buttonClass} bg-primary text-primary-foreground`} disabled={!name.trim()}>Create research entry</button></form></Card>}
    <Card>
      <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_190px_190px]">
        <label className="relative"><Search size={16} className="absolute left-3 top-3 text-muted-foreground" /><input aria-label="Search projects" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, ticker or narrative" className={`${inputClass} pl-9`} /></label>
        <select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)} className={inputClass}><option value="all">All statuses</option>{projectStatuses.map(s => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by narrative" value={narrative} onChange={e => setNarrative(e.target.value)} className={inputClass}><option value="all">All narratives</option>{narratives.map(n => <option key={n}>{n}</option>)}</select>
      </div>
      {!store.ready ? <p className="p-8 text-muted-foreground">Loading your research…</p> : filtered.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-secondary/30 text-xs text-muted-foreground"><tr>{['Project', 'Narratives', 'Status', 'Conviction', 'Updated'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{filtered.map(p => <tr key={p.id} className="border-t hover:bg-secondary/30"><td className="px-5 py-4"><Link className="flex items-center gap-2 font-semibold hover:text-primary" href={`/projects/${p.id}`}>{p.name}<ArrowUpRight size={14} /></Link><span className="text-xs text-muted-foreground">{p.symbol || 'No ticker'}</span></td><td className="max-w-xs px-5 py-4"><div className="flex flex-wrap gap-1">{p.narratives.length ? p.narratives.map(n => <Badge key={n}>{n}</Badge>) : <span className="text-muted-foreground">Unclassified</span>}</div></td><td className="whitespace-nowrap px-5 py-4"><Badge variant={p.status === 'Buy List' ? 'primary' : 'outline'}>{p.status}</Badge></td><td className="px-5 py-4">{p.conviction}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="mx-auto max-w-lg px-6 py-16 text-center"><FolderOpen className="mx-auto mb-4 text-primary" size={32} /><h2 className="font-semibold">{store.projects.length ? 'No matching projects' : 'Start with a project you want to understand'}</h2><p className="mt-2 text-sm text-muted-foreground">{store.projects.length ? 'Try another search or clear your filters.' : 'Add a project, record your thesis, and move it from your research queue to a watchlist or Buy List. Your workspace starts empty—every entry is yours.'}</p></div>}
    </Card>
  </div>;
}
