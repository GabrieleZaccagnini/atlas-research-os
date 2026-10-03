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
    <LiquidationContext />
    <Card className="space-y-2 p-4 text-xs leading-relaxed text-muted-foreground"><h2 className="text-sm font-semibold text-foreground">How to read these charts</h2><p><strong className="text-foreground">Open interest</strong> is the amount of BTCUSDT perpetual contracts still open on Binance. The current value is in BTC; the daily chart uses Binance’s reported USDT value. A rise shows more outstanding exposure on this venue, not whether traders are net long or short.</p><p><strong className="text-foreground">Funding</strong> is a periodic payment between perpetual longs and shorts. A positive settled rate means longs paid shorts for that settlement; a negative rate means shorts paid longs. It is one exchange and one contract, not an all-market average or a forecast.</p><p>The observed liquidation map records past forced-order execution prices only while this page is connected; Coinalyze adds past time-bucket totals when configured. Neither locates future liquidation clusters. ETF flows need another source. <Link href="/market-cycle" className="text-primary">Market Structure</Link> holds dominance and Bitcoin cycle context.</p><p><a href={sourceUrl} target="_blank" rel="noreferrer" className="text-primary">Binance BTCUSDT source ↗</a>{data ? ` · Atlas fetched ${new Date(data.fetchedAt).toLocaleString()}` : ''}</p></Card>
  </div>;
}
