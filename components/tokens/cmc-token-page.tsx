'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/shared';
import { CmcAssetDetailsView } from '@/components/dashboard/cmc-discovery';
import { TradingViewChart } from '@/components/dashboard/market-structure';
import { useFeed } from '@/components/dashboard/use-feed';
import { ProjectLiveData } from '@/components/projects/live-data';
import { ScrapbookLibrary } from '@/components/library/scrapbook-library';
import { useProjects } from '@/components/projects/store';
import { buttonClass, inputClass } from '@/components/projects/fields';
import { newProject } from '@/lib/projects';
import type { CmcProfile, MarketQuote } from '@/services/core/types';

const chartMarkets: Record<string, { symbol: string; label: string }> = {
  '1': { symbol: 'BINANCE:BTCUSDT', label: 'BTC/USDT · Binance spot' },
  '1027': { symbol: 'BINANCE:ETHUSDT', label: 'ETH/USDT · Binance spot' },
};
type Section = 'Chart' | 'Markets & liquidity' | 'Research' | 'Library';
const sections: Section[] = ['Chart', 'Markets & liquidity', 'Research', 'Library'];

export function CmcTokenPage({ id }: { id: string }) {
  const [revision, setRevision] = useState(0);
  const [section, setSection] = useState<Section>('Chart');
  const [range, setRange] = useState('3M');
  const [selectedProject, setSelectedProject] = useState('');
  const [notice, setNotice] = useState('');
  const quotes = useFeed<MarketQuote[]>('/api/data/assets?provider=coinmarketcap', revision);
  const profile = useFeed<CmcProfile>(`/api/data/cmc-profile?id=${id}`, revision, 1500);
  const quote = quotes.data?.find(row => row.asset.coinmarketcapId === Number(id));
  const asset = profile.data?.id === Number(id) ? profile.data : null;
  const name = asset?.name ?? quote?.name;
  const symbol = asset?.symbol ?? quote?.symbol;
  const store = useProjects();
  const linked = store.projects.find(project => project.cmcId === id);
  const chart = chartMarkets[id];
  async function createProject() {
    if (!name || !symbol || !store.ready || store.busy || linked) return;
    setNotice('');
    const project = { ...newProject(name, symbol), cmcId: id };
    if (await store.save(project)) setNotice(`${name} was added to your research projects.`);
  }
  async function connectProject() {
    const project = store.projects.find(row => row.id === selectedProject);
    if (!project || project.cmcId || linked || store.busy) return;
    setNotice('');
    if (await store.save({ ...project, cmcId: id, updatedAt: new Date().toISOString() }, project.updatedAt)) {
      setNotice(`CMC ID ${id} was linked to ${project.name}. Your existing research was kept.`);
      setSelectedProject('');
    }
  }
  return <div className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Link href="/markets" className="text-xs text-muted-foreground hover:text-primary">← Markets</Link><h1 className="mt-1 text-xl font-semibold">{name ?? `Token · CMC ${id}`}</h1><p className="text-xs text-muted-foreground">{symbol ?? 'Loading identity…'} · CoinMarketCap ID {id}</p></div><button className={buttonClass} onClick={() => setRevision(value => value + 1)}>Refresh token</button></div>
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        <CmcAssetDetailsView id={id} quote={quote} quoteFeed={quotes} profile={profile} />
        <Card className="space-y-3 p-4"><h2 className="text-sm font-semibold">Your Atlas research</h2>
          {!store.ready ? <p className="text-xs text-muted-foreground">Loading projects…</p> : linked ? <div className="space-y-2"><p className="text-xs text-muted-foreground">Linked by exact CMC ID to {linked.name} ({linked.symbol}).</p><Link className="text-xs text-primary" href={`/projects/${linked.id}`}>Open project research →</Link></div> : <div className="space-y-3"><p className="text-xs text-muted-foreground">Connect this exact CMC asset to a project. Atlas will not match by ticker.</p><button className={buttonClass} disabled={!name || !symbol || store.busy} onClick={() => void createProject()}>Create research project</button>{store.projects.some(project => !project.cmcId) && <div className="flex flex-wrap gap-2"><select aria-label="Connect existing project" className={`${inputClass} min-w-[180px] flex-1`} value={selectedProject} onChange={event => setSelectedProject(event.target.value)}><option value="">Choose an existing project</option>{store.projects.filter(project => !project.cmcId).map(project => <option value={project.id} key={project.id}>{project.name} ({project.symbol})</option>)}</select><button className={buttonClass} disabled={!selectedProject || store.busy} onClick={() => void connectProject()}>Connect</button></div>}</div>}
          {(notice || store.error) && <p role="status" className="text-xs text-warning">{store.error || notice}</p>}
        </Card>
      </div>
      <div className="min-w-0 space-y-4"><Card className="min-w-0 overflow-hidden"><div className="flex gap-1 overflow-x-auto border-b border-border/60 px-3" role="tablist" aria-label="Token sections">{sections.map(item => <button role="tab" aria-selected={section === item} key={item} className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs ${section === item ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setSection(item)}>{item}</button>)}</div>
        <div className="min-w-0 p-4" role="tabpanel">
          {section === 'Chart' && (chart ? <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{chart.label} · TradingView display</p><div className="flex gap-1">{[['1M','1M'],['3M','3M'],['1Y','12M'],['All','ALL']].map(([label, value]) => <button className={`rounded-md px-2 py-1 text-xs ${range === value ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`} aria-pressed={range === value} key={value} onClick={() => setRange(value)}>{label}</button>)}</div></div><TradingViewChart symbol={chart.symbol} range={range} expanded /><p className="text-xs text-muted-foreground">This verified pair is a venue chart, separate from CMC’s aggregate quote. Drawings in the embed are not saved to Atlas.</p></div> : <div className="space-y-3 text-sm"><h2 className="font-medium">Chart mapping needed</h2><p className="text-muted-foreground">Atlas has no verified venue and pair for this CMC ID yet. Open the source chart or use the Charts workspace to choose a market yourself.</p>{asset && <a href={asset.sourceUrl} target="_blank" rel="noreferrer" className="block text-primary">View token on CoinMarketCap ↗</a>}<Link className="block text-primary" href="/charts">Open chart workspace →</Link></div>)}
          {section === 'Markets & liquidity' && (linked ? <div className="space-y-3"><p className="text-xs text-muted-foreground">Venue listings require a separately confirmed CoinGecko ID; DEX pools require a confirmed chain and contract. CMC ID alone cannot identify those markets across providers.</p><ProjectLiveData project={linked} /><Link className="text-xs text-primary" href={`/projects/${linked.id}`}>Edit provider mappings in project Overview →</Link></div> : <p className="text-sm text-muted-foreground">Connect a research project to add confirmed venue and contract mappings for this token.</p>)}
          {section === 'Research' && (linked ? <div className="space-y-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium">{linked.name} research</h2><Link href={`/projects/${linked.id}`} className="text-xs text-primary">Edit full dossier →</Link></div><div className="grid gap-3 sm:grid-cols-2">{[['Status', linked.status], ['Conviction', linked.conviction], ['Next action', linked.review.nextAction || 'Not recorded'], ['Next review', linked.review.nextReviewOn || 'Not scheduled']].map(([label, value]) => <div className="rounded-lg bg-secondary/35 p-3" key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words">{value}</p></div>)}</div>{[['Project summary', linked.summary], ['Thesis', linked.thesis], ['Risks', linked.risks], ['Capital & tokenomics notes', linked.capital]].map(([label, value]) => <div key={label}><h3 className="text-xs font-medium">{label}</h3><p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{value || 'Not recorded yet.'}</p></div>)}<p className="text-xs text-muted-foreground">{linked.details.team.length} team records · {linked.details.funding.length} funding records · {linked.details.tokenomics.length} tokenomics records · {linked.events.length} catalysts. Open the dossier to review their sources and edit them.</p></div> : <p className="text-sm text-muted-foreground">Connect a research project to view your thesis, sources, team, funding, tokenomics and catalysts here.</p>)}
          {section === 'Library' && (linked ? <ScrapbookLibrary projectId={linked.id} /> : <p className="text-sm text-muted-foreground">Connect a research project to save token-specific links, notes and screenshots. <Link href="/library" className="text-primary">Open general Library →</Link></p>)}
        </div></Card><Card className="p-4 text-xs text-muted-foreground">Token news and social metrics need source-backed asset IDs and coverage. <Link href="/news" className="text-primary">Open the latest news →</Link></Card></div>
    </div>
  </div>;
}
