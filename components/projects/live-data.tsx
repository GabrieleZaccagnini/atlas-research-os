'use client';
import { useState } from 'react';
import type { ServiceResult, MarketQuote, ExchangePage, DexPool } from '@/services/core/types';
import type { ResearchProject } from '@/lib/projects';
import { Card, CardBody, CardHeader } from '@/components/shared';
import { formatCurrency, formatPrice } from '@/lib/format';
import { buttonClass } from './fields';
function DataPanel<T>({ title, url, children }: { title: string; url: string | null; children: (data: T) => React.ReactNode }) {
  const [result, setResult] = useState<ServiceResult<T> | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function load() {
    if (!url) return; setBusy(true); setError(''); setResult(null);
    try { const response = await fetch(url, { signal: AbortSignal.timeout(15000) }); const body = await response.json();
      if (typeof body.ok !== 'boolean') throw Error(); setResult(body);
    } catch { setError('Could not load this data. Please try again.'); } finally { setBusy(false); }
  }
  return <Card><CardHeader title={title} action={<button className={buttonClass} disabled={!url || busy} onClick={load}>{busy ? 'Loading…' : result ? 'Refresh' : 'Load data'}</button>} /><CardBody>
    {!url ? <p className="text-sm text-muted-foreground">Add the provider ID or chain and token address in Overview, then save the project.</p> : !result && !busy && !error ? <p className="text-sm text-muted-foreground">Load a snapshot when you need it. No background polling.</p> : null}
    {busy && <p role="status" className="text-sm text-muted-foreground">Requesting provider data…</p>}
    {error && <p role="alert" className="text-sm text-warning">{error}</p>}
    {result && !result.ok && <p role="status" className="text-sm text-warning">{result.error.code === 'missing_key' ? 'CoinGecko is not configured yet. Add its Demo key on the server to enable this section.' : result.error.message}</p>}
    {result?.ok && <><p className="mb-4 text-xs text-muted-foreground">Source: {result.meta.provider} · Retrieved {new Date(result.meta.fetchedAt).toLocaleString()} · {result.meta.cache === 'stale' ? 'STALE — last available snapshot' : result.meta.cache === 'fresh' ? 'Cached snapshot' : 'Freshly fetched'}</p>{result.warning && <p role="status" className="mb-4 text-sm text-warning">{result.warning.message}</p>}{children(result.data)}</>}
  </CardBody></Card>;
}
const money = (n: number | null) => n === null ? 'Unavailable' : formatCurrency(n);
export function ProjectLiveData({ project }: { project: ResearchProject }) {
  const [page, setPage] = useState(1);
  const coin = project.coingeckoId ? encodeURIComponent(project.coingeckoId) : null;
  const dexUrl = project.chainId && project.address ? `/api/data/dex?chain=${encodeURIComponent(project.chainId)}&address=${encodeURIComponent(project.address)}` : null;
  return <div className="space-y-5">
    <DataPanel<MarketQuote[]> key={`market:${coin}`} title="Market snapshot" url={coin ? `/api/data/market?ids=${coin}` : null}>{data => data.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[['Price', data[0].price === null ? 'Unavailable' : formatPrice(data[0].price)], ['Market cap', money(data[0].marketCap)], ['24h volume', money(data[0].volume24h)], ['FDV', money(data[0].fdv)]].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-mono text-lg">{value}</p></div>)}</div> : <p>No asset returned for this ID. Check the mapping in Overview.</p>}</DataPanel>
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Exchange listings · one page at a time</p><label className="text-sm">Page <select aria-label="Exchange listings page" value={page} onChange={e => setPage(Number(e.target.value))} className="ml-2 rounded border bg-background px-2 py-1">{Array.from({ length: 20 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label></div>
    <DataPanel<ExchangePage> key={`exchanges:${coin}:${page}`} title="Where it trades" url={coin ? `/api/data/exchanges?id=${coin}&page=${page}` : null}>{data => <><p className="mb-3 text-xs text-muted-foreground">Venue type is unclassified. Reported volume is not order-book depth.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Exchange', 'Pair', 'Price (USD)', '24h volume', 'Spread', 'Quality'].map(h => <th className="px-2 py-2 font-medium text-muted-foreground" key={h}>{h}</th>)}</tr></thead><tbody>{data.markets.map((m, i) => <tr className="border-t" key={`${m.exchangeId}:${m.base}:${m.quote}:${i}`}><td className="px-2 py-3">{m.tradeUrl ? <a className="text-primary hover:underline" href={m.tradeUrl} target="_blank" rel="noreferrer">{m.exchangeName} ↗</a> : m.exchangeName}</td><td className="px-2 py-3">{m.base}/{m.quote}</td><td className="px-2 py-3">{money(m.priceUsd)}</td><td className="px-2 py-3">{money(m.volume24hUsd)}</td><td className="px-2 py-3">{m.spreadPercent === null ? '—' : `${m.spreadPercent.toFixed(3)}%`}</td><td className="px-2 py-3">{m.isStale ? 'Stale ticker' : m.isAnomaly ? 'Anomaly flagged' : '—'}</td></tr>)}</tbody></table></div>{!data.markets.length && <p>No markets returned on this page.</p>}<p className="mt-3 text-xs text-muted-foreground">{data.mayHaveMore ? 'More results may be available on the next page.' : 'End of returned results.'}</p></>}</DataPanel>
    <DataPanel<DexPool[]> key={dexUrl} title="DEX pools & liquidity" url={dexUrl}>{data => <><p className="mb-3 text-xs text-muted-foreground">Prices describe each pool’s base token. Pool liquidity is not executable depth or slippage.</p>{!data.length && <p>No pools returned for this chain and address.</p>}<div className="grid gap-3 lg:grid-cols-2">{data.map(p => <div className="rounded-lg border p-4" key={`${p.chainId}:${p.dexId}:${p.pairAddress}`}><a href={p.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">{p.base.symbol} / {p.quote.symbol ?? 'Unknown'} ↗</a><p className="mb-3 mt-1 text-xs text-muted-foreground">{p.dexId} · {p.chainId}</p><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-muted-foreground">Liquidity</dt><dd>{money(p.liquidityUsd)}</dd></div><div><dt className="text-xs text-muted-foreground">24h volume</dt><dd>{money(p.volume24hUsd)}</dd></div><div><dt className="text-xs text-muted-foreground">Base price</dt><dd>{p.basePriceUsd === null ? 'Unavailable' : formatPrice(p.basePriceUsd)}</dd></div><div><dt className="text-xs text-muted-foreground">24h buys / sells</dt><dd>{p.buys24h ?? '—'} / {p.sells24h ?? '—'}</dd></div></dl></div>)}</div></>}</DataPanel>
    <Card className="p-5"><h3 className="text-sm font-semibold">Charts & CEX depth</h3><p className="mt-2 text-sm text-muted-foreground">OHLCV charts and exchange order books will connect here next. No simulated depth or price history is shown.</p></Card>
  </div>;
}
