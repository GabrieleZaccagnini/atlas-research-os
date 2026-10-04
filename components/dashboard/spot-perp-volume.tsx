'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/shared';
import { aggregateVolume, volumeHourMs, type SpotPerpVolume } from '@/lib/spot-perp-volume';

const ranges = [
  { label: '24h', hours: 24, bucketHours: 1 },
  { label: '7d', hours: 7 * 24, bucketHours: 4 },
  { label: '30d', hours: 30 * 24, bucketHours: 24 },
] as const;
type Range = typeof ranges[number]['label'];
const compactUsdt = (value: number) => `${new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(value)} USDT`;
const axisUsdt = (value: number) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const utc = (time: number) => new Date(time).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

export function SpotPerpVolumeView() {
  const [range, setRange] = useState<Range>('24h');
  const [data, setData] = useState<SpotPerpVolume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let running = false;
    async function load(initial = false) {
      if (!active || running || (!initial && document.hidden)) return;
      running = true;
      try {
        const response = await fetch('/api/data/spot-perp-volume', { signal: AbortSignal.timeout(16000) });
        if (!response.ok) throw new Error('Unavailable');
        const body = await response.json() as SpotPerpVolume;
        if (body.symbol !== 'BTCUSDT' || body.interval !== '1h' || !Array.isArray(body.points)) throw new Error('Invalid comparison');
        if (active) { setData(body); setError(''); }
      } catch { if (active) setError('The matched spot and perpetual volume comparison is unavailable right now.'); }
      finally { running = false; if (active) setLoading(false); }
    }
    void load(true);
    const interval = setInterval(() => void load(), 300000);
    const onVisible = () => { if (!document.hidden) void load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const selected = ranges.find(item => item.label === range)!;
  const view = useMemo(() => {
    if (!data) return null;
    const from = data.through - (selected.hours - 1) * volumeHourMs;
    const points = data.points.filter(point => point.time >= from && point.time <= data.through);
    const spotUsdt = points.reduce((sum, point) => sum + point.spotUsdt, 0);
    const perpUsdt = points.reduce((sum, point) => sum + point.perpUsdt, 0);
    const buckets = aggregateVolume(points, from, selected.hours, selected.bucketHours).map(bucket => ({
      ...bucket, ratio: bucket.spotUsdt !== null && bucket.perpUsdt !== null && bucket.perpUsdt > 0 ? bucket.spotUsdt / bucket.perpUsdt : null,
    }));
    return { from, points, spotUsdt, perpUsdt, buckets, ratio: perpUsdt > 0 ? spotUsdt / perpUsdt : null };
  }, [data, selected.hours, selected.bucketHours]);
  const dateTick = (time: number) => {
    const date = new Date(time).toISOString();
    return range === '30d' ? date.slice(5, 10) : range === '7d' ? `${date.slice(5, 10)} ${date.slice(11, 13)}` : date.slice(11, 16);
  };
  return <Card className="min-w-0 space-y-4 p-4" aria-label="BTC spot versus perpetual volume"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">Spot vs perpetual trading volume</h2><p className="mt-1 text-xs text-muted-foreground">Binance BTCUSDT spot and USDⓈ-M perpetual · matched closed UTC hours · USDT traded quote volume</p></div><div className="flex gap-1 rounded-lg border border-border/60 p-1" aria-label="Volume comparison range">{ranges.map(item => <button key={item.label} type="button" aria-pressed={range === item.label} className={`rounded px-2.5 py-1 text-xs ${range === item.label ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`} onClick={() => setRange(item.label)}>{item.label}</button>)}</div></div>
    {!view ? <p className="py-16 text-center text-xs text-muted-foreground" role="status">{loading ? 'Loading matched Binance volume…' : error}</p> : <>
      {error && <p role="status" className="text-xs text-warning">{error} Showing the previous snapshot.</p>}
      <div className="grid gap-2 sm:grid-cols-3"><div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Spot volume · {range}</p><p className="mt-1 font-semibold tabular-nums">{compactUsdt(view.spotUsdt)}</p></div><div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Perpetual volume · {range}</p><p className="mt-1 font-semibold tabular-nums">{compactUsdt(view.perpUsdt)}</p></div><div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Spot / perpetual ratio</p><p className="mt-1 font-semibold tabular-nums">{view.ratio === null ? '—' : `${view.ratio.toFixed(2)}×`}</p></div></div>
      <p className="text-[11px] text-muted-foreground">Matched coverage: {view.points.length} of {selected.hours} hours · {utc(view.from)}–{utc(data!.through + volumeHourMs - 1)}. {view.points.length < selected.hours ? 'Unmatched hours are omitted from totals and shown as gaps in the charts.' : 'All selected hours matched.'}</p>
      <div className="grid gap-4 xl:grid-cols-2"><div><h3 className="text-xs font-medium">Traded volume · USDT</h3><div className="mt-2 h-[260px]" role="img" aria-label="Matched Binance spot and perpetual USDT traded volumes"><ResponsiveContainer width="100%" height="100%"><BarChart data={view.buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tickFormatter={dateTick} minTickGap={24} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis width={55} tickFormatter={axisUsdt} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip labelFormatter={value => utc(Number(value))} formatter={(value: number, name: string) => [compactUsdt(Number(value)), name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 11 }} /><Bar dataKey="spotUsdt" name="Spot" fill="#46a980" isAnimationActive={false} /><Bar dataKey="perpUsdt" name="Perpetual" fill="#528bdf" isAnimationActive={false} /></BarChart></ResponsiveContainer></div></div>
      <div><h3 className="text-xs font-medium">Spot / perpetual volume ratio</h3><div className="mt-2 h-[260px]" role="img" aria-label="Matched Binance spot to perpetual volume ratio"><ResponsiveContainer width="100%" height="100%"><LineChart data={view.buckets} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tickFormatter={dateTick} minTickGap={24} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis width={45} tickFormatter={(value: number) => `${Number(value).toFixed(2)}×`} domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip labelFormatter={value => utc(Number(value))} formatter={(value: number) => [`${Number(value).toFixed(2)}×`, 'Spot / perp']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 11 }} /><ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" /><Line type="linear" dataKey="ratio" connectNulls={false} dot={false} stroke="#d79552" strokeWidth={2} isAnimationActive={false} /></LineChart></ResponsiveContainer></div></div></div>
    </>}
    <p className="text-[11px] leading-relaxed text-muted-foreground">A ratio above 1 means more BTCUSDT quote volume traded on Binance spot than on its BTCUSDT perpetual in the selected matched hours; below 1 means the opposite. This compares activity in two instruments on one venue. It does not measure net buying, withdrawals, cross-exchange volume, who moved price, or liquidation risk by itself. Four-hour and 24-hour chart bins include only complete groups of matched hours, counted backward from the latest closed hour.</p>
    <p className="text-[11px] text-muted-foreground">Sources: <a href="https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market" target="_blank" rel="noreferrer" className="text-primary">Binance spot candles ↗</a> · <a href="https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/market-data" target="_blank" rel="noreferrer" className="text-primary">Binance USDⓈ-M candles ↗</a>{data ? ` · Atlas fetched ${utc(Date.parse(data.fetchedAt))}` : ''}</p>
  </Card>;
}
