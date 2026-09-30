'use client';
import { useState } from 'react';
import type { DiscoverySettings } from '@/lib/discovery-views';
import { WatchButton } from '@/components/watchlists/add-button';
import Link from 'next/link';
import type { CmcProfile, MarketQuote } from '@/services/core/types';
import { buttonClass } from '@/components/projects/fields';
import { CapitalSourceLinks } from '@/components/projects/capital-sources';
import { MarketTable, Panel, FeedNote, Change, money, price } from './panels';
import { useFeed, type Feed } from './use-feed';
export function DiscoveryTable({ cmc, paprika, initialLimit = 30, initialSource = 'coinmarketcap' }: { cmc: Feed<MarketQuote[]>; paprika: Feed<MarketQuote[]>; initialLimit?: number; initialSource?: 'coinmarketcap' | 'coinpaprika' }) {
  const [source, setSource] = useState(initialSource);
  const [appliedSettings,setAppliedSettings]=useState<DiscoverySettings|null>(null);
  const fallback = source === 'coinmarketcap' && !cmc.loading && !cmc.data;
  const feed = source === 'coinmarketcap' && !fallback ? cmc : paprika;
  return <div className="min-w-0 space-y-2"><div className="flex flex-wrap items-center gap-1" aria-label="Discovery data source">{(['coinmarketcap', 'coinpaprika'] as const).map(id => <button key={id} className={`rounded-lg px-3 py-1.5 text-xs ${source === id ? 'bg-secondary font-medium' : 'text-muted-foreground'}`} aria-pressed={source === id} onClick={() => { setAppliedSettings(null); setSource(id); }}>{id === 'coinmarketcap' ? 'CoinMarketCap · top 100' : 'CoinPaprika · wider market'}</button>)}</div>
    {fallback && <div role="status" className="rounded-lg border border-border p-3 text-xs text-warning">CMC listings unavailable; displaying the CoinPaprika snapshot.<FeedNote feed={cmc} source="CoinMarketCap" url="https://coinmarketcap.com/" /></div>}
    <MarketTable key={source} feed={feed} provider={fallback ? 'coinpaprika' : source} detailed initialLimit={initialLimit} appliedSettings={appliedSettings} onApplySettings={settings=>{setSource(settings.provider);setAppliedSettings(settings);}} />
    {source === 'coinmarketcap' && !fallback && <p className="text-[10px] text-muted-foreground">CMC assets open reference details. Use Watch to add an exact CMC asset to a named list.</p>}
  </div>;
}
export function CmcAssetDetails({ id, quote, revision, quoteFeed }: { id: string; quote?: MarketQuote; revision: number; quoteFeed: Feed<MarketQuote[]> }) {
  const profile = useFeed<CmcProfile>(`/api/data/cmc-profile?id=${encodeURIComponent(id)}`, revision, 1500);
  return <CmcAssetDetailsView id={id} quote={quote} quoteFeed={quoteFeed} profile={profile} />;
}
export function CmcAssetDetailsView({ id, quote, quoteFeed, profile }: { id: string; quote?: MarketQuote; quoteFeed: Feed<MarketQuote[]>; profile: Feed<CmcProfile> }) {
  const data = profile.data?.id === Number(id) ? profile.data : null;
  const supply = (v: number | null | undefined) => v == null ? '—' : v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return <Panel title={data?.name ?? quote?.name ?? `CMC asset ${id}`} label={`CMC ID ${id}`}><div className="space-y-4 px-4 pb-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-2xl font-semibold tabular-nums">{price(quote?.price)} <span className="text-xs text-muted-foreground">{data?.symbol ?? quote?.symbol}</span></span><Link className="text-xs text-primary" href="/markets">All markets →</Link></div>
    {quote ? <><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: '1h', value: quote.change1hPercent }, { label: '24h', value: quote.change24hPercent }, { label: '7d', value: quote.change7dPercent }, { label: '30d', value: quote.change30dPercent }].map(metric => <div className="rounded-lg bg-secondary/35 p-2.5" key={metric.label}><p className="mb-1 text-[10px] text-muted-foreground">{metric.label} price change</p><Change value={metric.value} /></div>)}</div><dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{[{ label: 'Market cap', value: money(quote.marketCap) }, { label: 'Fully diluted valuation', value: money(quote.fdv) }, { label: '24h volume', value: money(quote.volume24h) }, { label: 'Circulating supply', value: supply(quote.circulatingSupply) }, { label: 'Total supply', value: supply(quote.totalSupply) }, { label: 'Maximum supply', value: supply(quote.maxSupply) }].map(metric => <div key={metric.label}><dt className="text-muted-foreground">{metric.label}</dt><dd className="mt-1 break-words tabular-nums">{metric.value}</dd></div>)}</dl><p className="text-[10px] text-muted-foreground">Quote observed {quote.sourceUpdatedAt ?? 'time unavailable'} · unknown supply remains blank.</p></> : <p className="text-xs text-muted-foreground">{quoteFeed.loading ? 'Loading the CMC quote…' : 'No quote in the top-100 snapshot. Project basics can still load by CMC ID.'}</p>}
    {data ? <><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">Project basics</h3><WatchButton asset={{provider: 'coinmarketcap',id: String(data.id),name: data.name,symbol: data.symbol}} /></div><p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{data.description || 'No description returned.'}</p><div className="flex flex-wrap gap-2">{data.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className={`${buttonClass} max-w-full text-xs`}>{link.label} ↗</a>)}</div><a href={data.sourceUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary">CoinMarketCap source ↗</a>{data.listedAt && <p className="text-[10px] text-muted-foreground">Added to CMC {data.listedAt.slice(0, 10)} · not the project launch date</p>}{data.tags.length > 0 && <details className="text-xs"><summary className="cursor-pointer text-muted-foreground">CMC classifications · {data.tags.length}</summary><div className="mt-2 flex flex-wrap gap-1.5">{data.tags.map(tag => <span className="max-w-full break-words rounded bg-secondary px-2 py-1 text-[10px]" key={tag}>{tag}</span>)}</div></details>}<p className="text-[10px] text-muted-foreground">Descriptions and links are provider references and may be outdated. Classifications do not establish VC investment or partnerships. Your saved research is unchanged.</p></> : <p className="text-xs text-muted-foreground">{profile.loading ? 'Loading project basics…' : 'Project basics unavailable.'}</p>}
    <CapitalSourceLinks />
  </div><FeedNote feed={quoteFeed} source="CoinMarketCap · quotes" url="https://coinmarketcap.com/" observed={quote?.sourceUpdatedAt} /><FeedNote feed={profile} source="CoinMarketCap · metadata" url={data?.sourceUrl ?? 'https://coinmarketcap.com/'} /></Panel>;
}
