'use client';
import { useState } from 'react';
import { WatchButton } from '@/components/watchlists/add-button';
import { discoveryWatchAsset } from '@/lib/watchlists';
import Link from 'next/link';
import { Card } from '@/components/shared';
import { discoverySources, discoveryKinds, discoveryNames, discoveryLabels, discoveryCoverage,
  type DiscoverySource, type DiscoveryKind, type DiscoverySnapshot } from '@/lib/discovery';
import { formatPrice, formatPercent } from '@/lib/format';
import { useFeed } from './use-feed';

export function DiscoveryPanel({ revision, detailed = false }: { revision: number; detailed?: boolean }) {
  const [source, setSource] = useState<DiscoverySource>('coingecko');
  const [kind, setKind] = useState<DiscoveryKind>('trending');
  return <Card className="min-w-0 overflow-hidden"><div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4"><h2 className="text-sm font-semibold">{detailed ? 'Discovery feeds' : <Link href="/markets#trending" className="hover:text-primary">Discovery feeds ↗</Link>}</h2><span className="text-[10px] text-muted-foreground">Attention & additions</span></div>
    <div className="space-y-2 px-4 pb-3"><div className="flex flex-wrap gap-1" role="group" aria-label="Discovery view">{discoveryKinds.map(k => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`rounded-lg px-2.5 py-1.5 text-xs ${kind === k ? 'bg-primary/10 text-primary' : 'bg-secondary/40 text-muted-foreground hover:text-foreground'}`}>{discoveryLabels[k]}</button>)}</div>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Discovery feed source">{discoverySources.map(s => <button key={s} aria-pressed={source === s} onClick={() => setSource(s)} className={`rounded-lg px-2.5 py-1.5 text-[11px] ${source === s ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}`}>{discoveryNames[s]}</button>)}</div></div>
    <DiscoveryFeed key={`${source}:${kind}`} source={source} kind={kind} revision={revision} detailed={detailed} />
  </Card>;
}
function DiscoveryFeed({ source, kind, revision, detailed }: { source: DiscoverySource; kind: DiscoveryKind; revision: number; detailed: boolean }) {
  const coverage = discoveryCoverage(source, kind);
  const feed = useFeed<DiscoverySnapshot>(`/api/data/discovery?source=${source}&kind=${kind}`, revision, 1200, coverage.access === 'available');
  const [search, setSearch] = useState(''); const [shown, setShown] = useState(20);
  const data = feed.data;
  const filtered = (data?.items ?? []).filter(r => !search.trim() || `${r.name} ${r.symbol}`.toLowerCase().includes(search.trim().toLowerCase()));
  const rows = filtered.slice(0, detailed ? shown : 5);
  const failure = feed.result && !feed.result.ok ? feed.result.error.message : null;
  return <><div className="px-4 pb-3 text-[11px] leading-relaxed text-muted-foreground">{coverage.description}</div>
    {coverage.access !== 'available' ? <div className="border-t border-border/40 px-4 py-5"><span className="rounded-md bg-secondary px-2 py-1 text-[10px]">{coverage.access === 'paid' ? 'Paid API · not connected' : 'API access unverified'}</span><p className="mt-3 text-xs text-muted-foreground">Open the provider’s website to view its available discovery lists.</p></div> : <>
      {detailed && data && <div className="px-4 pb-3"><input aria-label="Search discovery feed" value={search} onChange={e => { setSearch(e.target.value); setShown(20); }} placeholder="Search this feed…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary" /></div>}
      <div className="divide-y divide-border/40 px-4">{rows.map(r => <div key={r.id} className="flex min-w-0 items-center justify-between gap-3 py-3"><div className="min-w-0"><a className="block truncate text-xs font-medium hover:text-primary" href={r.href} target={r.href.startsWith('/') ? undefined : '_blank'} rel={r.href.startsWith('/') ? undefined : 'noreferrer'}>{r.name}<span className="ml-2 font-normal text-muted-foreground">{r.symbol}</span></a><div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">{kind === 'trending' && <span>Trend #{(data?.items.findIndex(item => item.id === r.id) ?? 0) + 1}</span>}{r.marketRank !== null && <span>Market #{r.marketRank}</span>}{r.addedAt && <span>Added {new Date(r.addedAt).toLocaleDateString()}</span>}{r.active === false && <span>Inactive</span>}</div></div><div className="flex shrink-0 items-center gap-2">{discoveryWatchAsset(source,r) && <WatchButton asset={discoveryWatchAsset(source,r)!} compact />}<div className="text-right"><p className="text-xs tabular-nums">{r.price === null ? '—' : formatPrice(r.price)}</p><span className={`text-[11px] tabular-nums ${r.change24h == null || r.change24h === 0 ? 'text-muted-foreground' : r.change24h > 0 ? 'text-success' : 'text-destructive'}`}>{r.change24h === null ? '' : `${formatPercent(r.change24h)} · 24h`}</span></div></div></div>)}</div>
      {!rows.length && <p role="status" className="px-4 py-5 text-xs text-muted-foreground">{!data ? feed.loading ? 'Loading discovery feed…' : 'Feed unavailable. Refresh to retry.' : search ? 'No coins match your search.' : 'No additions returned by this source.'}</p>}
      {data && <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[10px] text-muted-foreground"><span>Showing {rows.length} of {filtered.length}{data.total > data.items.length ? ` · ${data.total} additions reported; capped at ${data.items.length}` : ''}</span>{detailed && filtered.length > shown && <button className="rounded-md bg-secondary px-2 py-1 text-xs text-foreground" onClick={() => setShown(v => v + 20)}>Show more</button>}{!detailed && <Link href="/markets#trending" className="text-primary">Explore feeds ↗</Link>}</div>}
      {(feed.error || failure || (feed.result?.ok && feed.result.warning)) && <p role="status" className="px-4 pb-2 text-[11px] text-warning">{feed.error ?? failure ?? (feed.result?.ok ? feed.result.warning?.message : '')}{feed.error && data ? ' Showing the previous snapshot.' : ''}</p>}
    </>}
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground"><a href={coverage.url} target="_blank" rel="noreferrer" className="hover:text-foreground">{discoveryNames[source]} ↗</a>{feed.result?.ok && <details><summary className={`cursor-pointer ${feed.result.meta.cache === 'stale' ? 'text-warning' : ''}`}>{feed.result.meta.cache === 'stale' ? 'Stale snapshot' : feed.loading ? 'Refreshing…' : `Fetched ${new Date(feed.result.meta.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</summary><p className="mt-1">Retrieved {new Date(feed.result.meta.fetchedAt).toLocaleString()}. Cached until {new Date(feed.result.meta.expiresAt).toLocaleTimeString()}. Ranking observation time not supplied.</p></details>}</div>
    {kind === 'new' && <p className="px-4 pb-3 text-[10px] text-muted-foreground">Provider additions, not token launch dates or new DEX pools.</p>}
  </>;
}
