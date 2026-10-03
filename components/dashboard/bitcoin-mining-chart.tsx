'use client';

import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/shared';

type Range = '1y' | '3y' | 'all';
type Point = { date: string; hashRateEhs: number; priceUsd: number };

const sourceUrl = 'https://www.blockchain.com/explorer/charts/hash-rate';
const hashpriceUrl = 'https://data.hashrateindex.com/bitcoin-compute-data/bitcoin-hashprice-index';
const ranges: { id: Range; label: string }[] = [{ id: '1y', label: '1Y' }, { id: '3y', label: '3Y' }, { id: 'all', label: 'All' }];

function isPoint(value: unknown): value is Point {
  return !!value && typeof value === 'object' && 'date' in value && 'hashRateEhs' in value && 'priceUsd' in value &&
    typeof value.date === 'string' && typeof value.hashRateEhs === 'number' && Number.isFinite(value.hashRateEhs) &&
    typeof value.priceUsd === 'number' && Number.isFinite(value.priceUsd);
}

export function BitcoinMiningChart() {
  const [range, setRange] = useState<Range>('1y');
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetch(`/api/data/bitcoin-mining?range=${range}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Unavailable');
        const body: unknown = await response.json();
        if (!body || typeof body !== 'object' || !('points' in body) || !Array.isArray(body.points)) throw new Error('Invalid chart');
        const next = body.points.filter(isPoint);
        if (!next.length) throw new Error('Empty chart');
        setPoints(next);
        setStatus('ready');
      })
      .catch(error => { if (error?.name !== 'AbortError') { setPoints([]); setStatus('error'); } });
    return () => controller.abort();
  }, [range]);

  const lastDate = points.at(-1)?.date;
  return <Card className="overflow-hidden">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
      <div><h3 className="text-sm font-semibold">Bitcoin network hash rate vs BTC price</h3><p className="mt-1 text-xs text-muted-foreground">Blockchain.com daily history · seven-day average · hash rate shown in EH/s</p></div>
      <a className="text-xs text-primary hover:underline" href={sourceUrl} target="_blank" rel="noreferrer">Open source chart ↗</a>
    </div>
    <div className="flex flex-wrap gap-1 border-b border-border/40 px-3 py-2" aria-label="Hash rate chart timeframe">
      {ranges.map(item => <button key={item.id} type="button" aria-pressed={range === item.id} className={`rounded-lg px-3 py-1.5 text-xs ${range === item.id ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary'}`} onClick={() => setRange(item.id)}>{item.label}</button>)}
    </div>
    <div className="grid gap-3 border-b border-border/40 px-4 py-3 text-xs leading-relaxed sm:grid-cols-2">
      <div><p className="font-semibold">What it measures</p><p className="mt-1 text-muted-foreground">Hash rate estimates the total computing power mining Bitcoin. It is inferred from blocks found and network difficulty; BTC price uses Blockchain.com’s USD market-price series.</p></div>
      <div><p className="font-semibold">How to read it</p><p className="mt-1 text-muted-foreground">Compare the two trends, using their separate axes. Rising hash rate suggests more network mining power, but does not show what an individual miner earns. Daily estimates are noisy, so this view uses a seven-day average.</p></div>
    </div>
    <div className="px-2 py-4 sm:px-4">
      {status === 'ready' ? <div className="h-[320px] w-full sm:h-[400px]" role="img" aria-label="Blockchain.com Bitcoin hash rate and BTC price history"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" minTickGap={42} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => String(value).slice(0, 7)} /><YAxis yAxisId="hash" width={48} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => `${Math.round(Number(value))}`} /><YAxis yAxisId="price" orientation="right" width={56} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => `$${Math.round(Number(value) / 1000)}k`} /><Tooltip labelFormatter={value => String(value)} formatter={(value: number, name: string) => name === 'Hash rate' ? [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} EH/s`, name] : [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line yAxisId="hash" type="monotone" dataKey="hashRateEhs" name="Hash rate" stroke="#3977d5" strokeWidth={2} dot={false} isAnimationActive={false} /><Line yAxisId="price" type="monotone" dataKey="priceUsd" name="BTC price" stroke="#dd7a36" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div> : <div className="flex h-[320px] items-center justify-center text-center text-xs text-muted-foreground" role="status">{status === 'error' ? <span>Mining history is unavailable right now. <a className="text-primary hover:underline" href={sourceUrl} target="_blank" rel="noreferrer">Open it on Blockchain.com ↗</a></span> : 'Loading mining history…'}</div>}
    </div>
    <p className="border-t border-border/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">Source: <a className="text-primary hover:underline" href={sourceUrl} target="_blank" rel="noreferrer">Blockchain.com Charts API ↗</a>{lastDate && status === 'ready' ? ` · latest shared observation ${lastDate} UTC` : ''}. Hash rate is not miner profitability. For expected gross revenue per unit of computing power, see <a className="text-primary hover:underline" href={hashpriceUrl} target="_blank" rel="noreferrer">Luxor hashprice ↗</a>; it also excludes electricity and hardware costs.</p>
  </Card>;
}
