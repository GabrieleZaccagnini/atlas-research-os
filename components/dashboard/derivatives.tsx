'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/shared';
import { buttonClass } from '@/components/projects/fields';
import type { BtcDerivatives } from '@/lib/btc-derivatives';
import { Panel } from './panels';
import { LiquidationContext } from './liquidations';
import { SpotPerpVolumeView } from './spot-perp-volume';

const sourceUrl = 'https://www.binance.com/en/futures/BTCUSDT';
const dateTime = (time: number) => new Date(time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
const shortDate = (time: number) => new Date(time).toISOString().slice(5, 10);
const btc = (value: number | null | undefined) => value == null ? '—' : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} BTC`;
const usdt = (value: number | null | undefined) => value == null ? '—' : `${new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(value)} USDT`;
const percent = (value: number | null | undefined) => value == null ? '—' : `${(value * 100).toFixed(4)}%`;

function useBtcDerivatives(revision: number) {
  const [data, setData] = useState<BtcDerivatives | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let running = false;
    async function load() {
      if (!active || running || document.hidden) return;
      running = true;
      setLoading(true);
      try {
        const response = await fetch('/api/data/btc-derivatives', { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Source unavailable');
        const body = await response.json() as BtcDerivatives;
        if (body.symbol !== 'BTCUSDT' || !Array.isArray(body.fundingHistory) || !Array.isArray(body.openInterestHistory)) throw new Error('Invalid source response');
        if (active) { setData(body); setError(''); }
      } catch { if (active) setError('BTC derivatives data could not be refreshed.'); }
      finally { running = false; if (active) setLoading(false); }
    }
    void load();
    const interval = setInterval(() => void load(), 300000);
    const onVisible = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [revision]);
  return { data, loading, error };
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="rounded-lg bg-secondary/35 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>{note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}</div>;
}

export function DerivativesSummary({ volume }: { volume: string }) {
  const { data, loading, error } = useBtcDerivatives(0);
  const lastFunding = data?.fundingHistory.at(-1);
  return <Panel title="Derivatives & flows" href="/derivatives">
    <div className="space-y-2 px-4 pb-4 text-xs">
      <div className="flex justify-between gap-2 rounded-lg bg-secondary/35 p-2.5"><span className="text-muted-foreground">CMC global derivatives volume · 24h</span><span className="tabular-nums">{volume}</span></div>
      <div className="flex justify-between gap-2 rounded-lg bg-secondary/35 p-2.5"><span className="text-muted-foreground">Binance BTCUSDT open interest</span><span className="tabular-nums">{btc(data?.currentOpenInterest?.btc)}</span></div>
      <div className="flex justify-between gap-2 rounded-lg bg-secondary/35 p-2.5"><span className="text-muted-foreground">Last settled funding</span><span className="tabular-nums">{percent(lastFunding?.rate)}</span></div>
      <p className="text-[11px] text-muted-foreground">{error || (!data && loading ? 'Loading Binance futures…' : `One venue · ${lastFunding ? dateTime(lastFunding.time) : 'funding unavailable'}`)}</p>
    </div>
  </Panel>;
}

function History({ title, rows, valueKey, formatter, note }: { title: string; rows: { time: number; value: number }[]; valueKey: string; formatter: (value: number) => string; note: string }) {
  return <Card className="min-w-0 p-4"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{note}</p>
    {rows.length < 2 ? <p className="flex h-[260px] items-center justify-center text-xs text-muted-foreground" role="status">History unavailable from Binance right now.</p> :
      <div className="mt-4 h-[280px]" role="img" aria-label={`${title} history chart`}><ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} scale="time" tickFormatter={shortDate} minTickGap={30} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis width={65} tickFormatter={formatter} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={['auto', 'auto']} /><Tooltip labelFormatter={value => dateTime(Number(value))} formatter={(value: number) => [formatter(Number(value)), title]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 11 }} />{valueKey === 'funding' && <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />}<Line type="linear" dataKey="value" dot={false} stroke="hsl(var(--primary))" strokeWidth={2} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>}
  </Card>;
}

const leverageContexts = [
  { oi: 'Rising', funding: 'Positive / rising', reading: 'More contracts are open while longs pay shorts. Crowded long exposure may be worth investigating if price stalls.', check: 'Price trend, spot participation and liquidations below price.' },
  { oi: 'Rising', funding: 'Negative / falling', reading: 'More contracts are open while shorts pay longs. Crowded short exposure may be worth investigating if price holds.', check: 'Price trend, spot participation and liquidations above price.' },
  { oi: 'Falling', funding: 'Positive', reading: 'Contracts are closing while longs still pay shorts. This can accompany a cooling rally, but does not identify who closed.', check: 'Whether price and spot activity confirm weakening demand.' },
  { oi: 'Falling', funding: 'Negative', reading: 'Contracts are closing while shorts still pay longs. This can accompany deleveraging, but does not establish a price floor.', check: 'Whether selling pressure actually eases and spot demand returns.' },
];

function LeverageReadingGuide() {
  return <Card className="space-y-3 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-sm font-semibold">Reading leverage and liquidation risk</h2><p className="mt-1 text-xs text-muted-foreground">Use these as questions for research, not automatic trade signals.</p></div><Link href="/library?capture=strategy" className="text-xs text-primary hover:underline">Save a strategy note →</Link></div>
    <div className="grid gap-2 md:grid-cols-2">{leverageContexts.map(row => <div key={`${row.oi}:${row.funding}`} className="rounded-lg border border-border/60 bg-secondary/20 p-3 text-xs"><p className="font-medium">OI {row.oi.toLowerCase()} · funding {row.funding.toLowerCase()}</p><p className="mt-1 text-muted-foreground">{row.reading}</p><p className="mt-2 text-muted-foreground"><strong className="text-foreground">Check:</strong> {row.check}</p></div>)}</div>
    <p className="text-xs leading-relaxed text-muted-foreground">Funding is shown per actual settlement. Binance’s default interest component can be 0.01% per eight hours, but the rate and settlement interval can change; 0.01% is not a universal “healthy” threshold. Compare like intervals and this contract’s own history before calling a reading unusual. Daily OI snapshots and settled funding are not synchronized intraday signals.</p>
    <p className="text-xs leading-relaxed text-muted-foreground">The modeled level chart estimates where forced closures <em>might</em> concentrate. It does not reveal exact positions, orders, stop losses or a destination price. The observed charts show past executions. The spot/perpetual volume comparison shows relative trading activity on Binance, but cannot establish who drove a price move.</p>
    <p className="text-[11px] text-muted-foreground">Methodology: <a href="https://www.binance.com/en/support/faq/detail/360033525031" target="_blank" rel="noreferrer" className="text-primary">Binance funding ↗</a> · <a href="https://www.binance.com/en/academy/articles/what-is-open-interest" target="_blank" rel="noreferrer" className="text-primary">Binance open interest ↗</a> · <a href="https://www.coinglass.com/learn/coinglass-intro-en" target="_blank" rel="noreferrer" className="text-primary">CoinGlass heatmap explanation ↗</a></p>
  </Card>;
}

export function DerivativesPage() {
  const [revision, setRevision] = useState(0);
  const { data, loading, error } = useBtcDerivatives(revision);
  const latestFunding = data?.fundingHistory.at(-1);
  const latestHistory = data?.openInterestHistory.at(-1);
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight">BTC derivatives</h1><p className="mt-1 text-xs text-muted-foreground">Binance USDⓈ-M BTCUSDT perpetual · venue-specific leverage context</p></div><button className={buttonClass} onClick={() => setRevision(value => value + 1)}><RefreshCw size={13} />Refresh</button></div>
    {error && <Card className="p-3 text-xs text-warning" role="status">{error}{data ? ' Showing the previous snapshot.' : ''} <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline">Open Binance ↗</a></Card>}
    {data?.unavailable.length ? <Card className="p-3 text-xs text-warning" role="status">Unavailable from Binance: {data.unavailable.join(', ')}. Other measures are shown independently.</Card> : null}
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Current open interest" value={btc(data?.currentOpenInterest?.btc)} note={data?.currentOpenInterest ? `Contract quantity · ${dateTime(data.currentOpenInterest.time)}` : loading ? 'Loading…' : 'Unavailable'} /><Metric label="Last daily open interest" value={usdt(latestHistory?.usdt)} note={latestHistory ? `Reported notional · ${dateTime(latestHistory.time)}` : loading ? 'Loading…' : 'Unavailable'} /><Metric label="Last settled funding rate" value={percent(latestFunding?.rate)} note={latestFunding ? `Per settlement · ${dateTime(latestFunding.time)}` : loading ? 'Loading…' : 'Unavailable'} /></div>
    <div className="grid gap-4 xl:grid-cols-2"><History title="Open interest · USDT value" rows={data?.openInterestHistory.map(point => ({ time: point.time, value: point.usdt })) ?? []} valueKey="openInterest" formatter={usdt} note="Daily Binance BTCUSDT snapshots · latest month available" /><History title="Funding rate · per settlement" rows={data?.fundingHistory.map(point => ({ time: point.time, value: point.rate })) ?? []} valueKey="funding" formatter={percent} note="Last 90 settlements · positive means longs paid shorts" /></div>
    <SpotPerpVolumeView />
    <LeverageReadingGuide />
    <LiquidationContext />
    <Card className="space-y-2 p-4 text-xs leading-relaxed text-muted-foreground"><h2 className="text-sm font-semibold text-foreground">About these sources</h2><p><strong className="text-foreground">Open interest</strong> is the amount of BTCUSDT perpetual contracts still open on Binance. The current value is in BTC; the daily chart uses Binance’s reported USDT value. A rise shows more outstanding exposure on this venue, not whether traders are net long or short.</p><p><strong className="text-foreground">Funding</strong> is a periodic payment between perpetual longs and shorts. A positive settled rate means longs paid shorts for that settlement; a negative rate means shorts paid longs. It is one exchange and one contract, not an all-market average or a forecast.</p><p>The browser map and MarginPad price profile show past executions. MarginPad’s separate future-level display is a model, not confirmed positioning; Coinalyze shows past hourly totals. <Link href="/market-cycle" className="text-primary">Market Structure</Link> holds ETF flow and Bitcoin cycle context.</p><p><a href={sourceUrl} target="_blank" rel="noreferrer" className="text-primary">Binance BTCUSDT source ↗</a>{data ? ` · Atlas fetched ${new Date(data.fetchedAt).toLocaleString()}` : ''}</p></Card>
  </div>;
}
