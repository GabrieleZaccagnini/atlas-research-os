'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/shared';
import type { ChartRow, CycleView, ViewResult } from '@/lib/bitcoin-cycle';

type Display = CycleView | 'realized-price' | 'sth-realized-price' | 'etf-flow';
type Definition = { label: string; group: string; measures: string; read: string; bitbo?: string; keys?: { id: string; label: string; color: string }[]; log?: boolean };

const priceSource = 'https://www.blockchain.com/explorer/charts/market-price';
const hashSource = 'https://www.blockchain.com/explorer/charts/hash-rate';
const revenueSource = 'https://www.blockchain.com/explorer/charts/miners-revenue';

const definitions: Record<Display, Definition> = {
  'original-rainbow': { label: 'Rainbow-style bands', group: 'Valuation models', measures: 'Atlas fits a long-run price trend against days since Bitcoin began and divides historical deviations into five bands.', read: 'The bands describe where price has traded relative to this fitted model. They are not independent valuation evidence or fixed buy and sell levels.', bitbo: 'https://charts.bitbo.io/original-rainbow/', log: true, keys: [1, 2, 3, 4, 5].map((n, index) => ({ id: `band${n}`, label: `Band ${n}`, color: ['#3977d5', '#56a889', '#e0c455', '#eb9a4b', '#cb5a65'][index] })).concat({ id: 'price', label: 'BTC price', color: '#c5d0e3' }) },
  'halving-rainbow': { label: 'Halving-relative range', group: 'Valuation models', measures: 'Atlas aligns prior reward eras at each halving and compares BTC price multiples. The three historical bands use the 2012, 2016 and 2020 eras.', read: 'Compare the current era with previous price paths at the same day after halving. This is an Atlas historical range, not Bitbo’s halving regression.', bitbo: 'https://charts.bitbo.io/rainbow/', keys: [{ id: 'low', label: 'Historical low band', color: '#3977d5' }, { id: 'middle', label: 'Historical median', color: '#e0b550' }, { id: 'high', label: 'Historical high band', color: '#cf697c' }, { id: 'current', label: 'Current era', color: '#b9c9e8' }] },
  'power-law': { label: 'Long-term power law', group: 'Valuation models', measures: 'A log-log regression of BTC price against time, with the 10th, 50th and 90th percentile of historical deviations.', read: 'Use the fitted corridor to compare long-run price position. Its extension is a model scenario, not a guaranteed support or future value.', bitbo: 'https://charts.bitbo.io/long-term-power-law/', log: true, keys: [{ id: 'band1', label: 'Lower fit', color: '#3977d5' }, { id: 'band2', label: 'Center fit', color: '#e0b550' }, { id: 'band3', label: 'Upper fit', color: '#cf697c' }, { id: 'price', label: 'BTC price', color: '#c5d0e3' }] },
  'realized-price': { label: 'Realized price', group: 'Holder cost basis', measures: 'The aggregate on-chain cost-basis estimate already appears in the BlockHorizon cycle display above.', read: 'Compare spot price with realized price as broad holder context. Use the existing chart selector above for the live view.', bitbo: 'https://charts.bitbo.io/realized-price/' },
  'sth-realized-price': { label: 'Short-term holder realized price', group: 'Holder cost basis', measures: 'Estimated cost basis of BTC held in the short-term cohort, commonly defined around 155 days.', read: 'Atlas needs a verified cohort-level on-chain feed before it can plot a real value. BTC spot prices alone cannot calculate it.', bitbo: 'https://charts.bitbo.io/sth-realized-price/' },
  'reward-era': { label: 'Reward era comparison', group: 'Halving history', measures: 'BTC price in each halving era, indexed to 1× at that era’s first available price observation.', read: 'Compare returns at the same number of days after each halving. Earlier eras are context, not templates for the next one.', bitbo: 'https://charts.bitbo.io/reward-era-comparison/', keys: [2012, 2016, 2020, 2024].map((year, index) => ({ id: `y${year}`, label: `${year} era`, color: ['#8d9ab1', '#4a84c5', '#cf9960', '#323f62'][index] })) },
  'cycle-repeat': { label: 'Cycle repeat scenario', group: 'Halving history', measures: 'A selected historical reward-era price path, rebased to the latest BTC price and extended into the future.', read: 'Change the reference era to compare possible paths. The line is a mechanical scenario and has no assigned probability.', bitbo: 'https://charts.bitbo.io/cycle-repeat/', log: true, keys: [{ id: 'history', label: 'BTC price', color: '#b9c9e8' }, { id: 'scenario', label: 'Repeated path', color: '#d2774a' }] },
  'halving-progress': { label: 'Halving progress', group: 'Halving history', measures: 'BTC prices aligned by day since each halving, with current block progress shown when the network height is available.', read: 'Days align the price histories; block progress counts the current 210,000-block reward era. Calendar time and block progress are different measures.', bitbo: 'https://charts.bitbo.io/halving-progress/', log: true, keys: [2012, 2016, 2020, 2024].map((year, index) => ({ id: `y${year}`, label: `${year} era`, color: ['#8d9ab1', '#4a84c5', '#cf9960', '#323f62'][index] })) },
  'price-scenarios': { label: 'Price scenarios', group: 'Scenarios & returns', measures: 'An editable constant annual-growth calculation from the latest BTC price, alongside two years of history.', read: 'Set a growth assumption to explore outcomes. This is arithmetic, not a prediction of future returns.', bitbo: 'https://charts.bitbo.io/price-prediction/', log: true, keys: [{ id: 'history', label: 'BTC price', color: '#b9c9e8' }, { id: 'scenario', label: 'Your scenario', color: '#d2774a' }] },
  'monthly': { label: 'Monthly performance', group: 'Scenarios & returns', measures: 'BTC return from the previous month’s final available daily price to the current month’s final daily price.', read: 'Color compares completed months. Missing observations stay blank; past seasonal patterns do not establish a future return.', bitbo: 'https://charts.bitbo.io/monthly-performance/' },
  'quarterly': { label: 'Quarterly performance', group: 'Scenarios & returns', measures: 'BTC return from the previous quarter’s final available daily price to the current quarter’s final daily price.', read: 'Compare completed quarters, keeping in mind that a small number of Bitcoin cycles makes apparent patterns unstable.', bitbo: 'https://charts.bitbo.io/bitcoin-quarterly-price-performance/' },
  'hash-ribbons': { label: 'Hash ribbons', group: 'Mining & flows', measures: '30-day and 60-day moving averages of Blockchain.com’s network hash-rate estimates.', read: 'Crossovers show a change in the trend of estimated mining power. They do not measure an individual miner’s profit or guarantee a price turn.', bitbo: 'https://charts.bitbo.io/hash-ribbons/', keys: [{ id: 'short', label: '30-day average', color: '#3977d5' }, { id: 'long', label: '60-day average', color: '#d2774a' }] },
  'puell': { label: 'Puell-style miner revenue multiple', group: 'Mining & flows', measures: 'Blockchain.com daily USD miner revenue divided by its trailing 365-day average, including subsidy and transaction fees.', read: 'Values above or below 1 show revenue relative to the prior year. This is gross revenue, not miner profit.', bitbo: 'https://charts.bitbo.io/puell-multiple/', keys: [{ id: 'multiple', label: 'Revenue multiple', color: '#3977d5' }] },
  'etf-flow': { label: 'ETF flows vs new BTC', group: 'Mining & flows', measures: 'Net ETF BTC accumulation compared with newly issued BTC.', read: 'Atlas needs a verified, consistently dated ETF holdings or flows feed before it can calculate this comparison.', bitbo: 'https://charts.bitbo.io/etf-flows-vs-new-btc/' },
};

const groups = ['Valuation models', 'Holder cost basis', 'Halving history', 'Scenarios & returns', 'Mining & flows'];
const unavailable = new Set<Display>(['sth-realized-price', 'etf-flow']);
const currency = (value: number) => value < 1 ? `$${value.toFixed(4)}` : `$${Math.round(value).toLocaleString()}`;
const compactPrice = (value: number) => value >= 1_000_000 ? `$${Number((value / 1_000_000).toPrecision(2))}m` : value >= 1_000 ? `$${Number((value / 1_000).toPrecision(2))}k` : value >= 1 ? `$${Number(value.toPrecision(2))}` : `$${value.toFixed(2)}`;

function returnTable(rows: ChartRow[], quarterly: boolean) {
  const periods = quarterly ? ['Q1', 'Q2', 'Q3', 'Q4'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = new Map(rows.map(row => {
    const year = row.date.slice(0, 4);
    const period = quarterly ? Number(row.date.slice(-1)) - 1 : Number(row.date.slice(5, 7)) - 1;
    return [`${year}-${period}`, row.returnPct as number];
  }));
  const years = Array.from(new Set(rows.map(row => row.date.slice(0, 4)))).sort().reverse();
  return <div className="max-h-[430px] overflow-auto"><table className="w-full min-w-[720px] border-separate border-spacing-1 text-center text-xs"><thead><tr><th className="sticky top-0 bg-card px-1 text-left font-medium">Year</th>{periods.map(period => <th key={period} className="sticky top-0 bg-card px-1 font-medium">{period}</th>)}</tr></thead><tbody>{years.map(year => <tr key={year}><th className="px-1 text-left font-medium">{year}</th>{periods.map((period, index) => { const value = values.get(`${year}-${index}`); return <td key={period} title={value === undefined ? 'No complete period' : `${year} ${period}: ${value > 0 ? '+' : ''}${value}%`} className={`rounded px-1 py-2 tabular-nums ${value === undefined ? 'bg-secondary/30 text-muted-foreground' : value >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200' : 'bg-rose-500/20 text-rose-800 dark:text-rose-200'}`}>{value === undefined ? '—' : `${value > 0 ? '+' : ''}${value}%`}</td>; })}</tr>)}</tbody></table></div>;
}

export function BitcoinCycleLab() {
  const [selected, setSelected] = useState<Display>('reward-era');
  const [era, setEra] = useState(2020);
  const [growth, setGrowth] = useState(20);
  const [result, setResult] = useState<ViewResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const definition = definitions[selected];

  useEffect(() => {
    if (selected === 'realized-price' || unavailable.has(selected)) { setResult(null); setStatus('ready'); return; }
    const controller = new AbortController();
    setStatus('loading');
    const query = new URLSearchParams({ view: selected });
    if (selected === 'cycle-repeat') query.set('era', String(era));
    fetch(`/api/data/bitcoin-cycle?${query}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object' || !('rows' in body) || !Array.isArray(body.rows) || !body.rows.length) throw new Error('Invalid chart');
      setResult(body as ViewResult);
      setStatus('ready');
    }).catch(error => { if (error?.name !== 'AbortError') { setResult(null); setStatus('error'); } });
    return () => controller.abort();
  }, [selected, era]);

  const rows = useMemo<ChartRow[]>(() => {
    if (!result) return [];
    if (selected !== 'price-scenarios') return result.rows;
    const last = result.rows.at(-1);
    const start = last ? Date.parse(`${last.date}T00:00:00Z`) : 0;
    const base = last?.history;
    if (!last || typeof base !== 'number') return result.rows;
    const future = Array.from({ length: 48 }, (_, index) => {
      const date = new Date(start);
      date.setUTCMonth(date.getUTCMonth() + index + 1);
      const years = (date.getTime() - start) / 86400000 / 365.25;
      return { date: date.toISOString().slice(0, 10), history: null, scenario: Math.round(base * Math.pow(1 + growth / 100, years)) };
    });
    return [...result.rows, { date: last.date, history: base, scenario: base }, ...future];
  }, [result, selected, growth]);

  const axisLabel = selected === 'reward-era' || selected === 'halving-rainbow' || selected === 'halving-progress' ? 'Days since halving' : undefined;
  const source = selected === 'hash-ribbons' ? hashSource : selected === 'puell' ? revenueSource : priceSource;
  const isPrice = ['original-rainbow', 'power-law', 'cycle-repeat', 'halving-progress', 'price-scenarios'].includes(selected);
  const plotRows = useMemo(() => definition.log ? rows.map(row => {
    const plotted = { ...row };
    for (const key of definition.keys ?? []) {
      const value = row[key.id];
      plotted[key.id] = typeof value === 'number' && value > 0 ? Math.log10(value) : null;
    }
    return plotted;
  }) : rows, [rows, definition]);
  const logDomain = useMemo<[number, number] | undefined>(() => {
    if (!definition.log) return undefined;
    const values = plotRows.flatMap(row => (definition.keys ?? []).map(key => row[key.id]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value)));
    return values.length ? [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))] : undefined;
  }, [plotRows, definition]);
  const displayedValue = (value: number) => definition.log ? Math.pow(10, value) : value;
  return <Card id="bitcoin-cycle-lab" className="overflow-hidden">
    <div className="border-b border-border/40 px-4 py-4"><h2 className="text-sm font-semibold">Bitcoin cycle research</h2><p className="mt-1 text-xs text-muted-foreground">Atlas calculations from sourced history · one view at a time · model paths are not forecasts</p></div>
    <div className="border-b border-border/40 px-4 py-3"><label className="text-xs font-medium">Chart or model <select className="ml-2 max-w-full rounded-lg border border-border bg-background px-2 py-2 text-xs" value={selected} onChange={event => setSelected(event.target.value as Display)}>{groups.map(group => <optgroup key={group} label={group}>{(Object.entries(definitions) as [Display, Definition][]).filter(([, item]) => item.group === group).map(([id, item]) => <option key={id} value={id}>{item.label}{unavailable.has(id) ? ' · source needed' : ''}</option>)}</optgroup>)}</select></label></div>
    <div className="grid gap-3 border-b border-border/40 px-4 py-3 text-xs leading-relaxed sm:grid-cols-2"><div><h3 className="text-sm font-semibold">{definition.label}</h3><p className="mt-2 font-medium">What it measures</p><p className="mt-1 text-muted-foreground">{definition.measures}</p></div><div><p className="font-medium">How to read it</p><p className="mt-1 text-muted-foreground">{definition.read}</p>{definition.bitbo && <a className="mt-2 inline-block text-primary hover:underline" href={definition.bitbo} target="_blank" rel="noreferrer">View Bitbo’s reference chart ↗</a>}</div></div>
    {selected === 'cycle-repeat' && <div className="border-b border-border/40 px-4 py-3 text-xs"><label>Reference era <select className="ml-2 rounded-lg border border-border bg-background px-2 py-1" value={era} onChange={event => setEra(Number(event.target.value))}><option value={2012}>2012</option><option value={2016}>2016</option><option value={2020}>2020</option></select></label></div>}
    {selected === 'price-scenarios' && <div className="border-b border-border/40 px-4 py-3 text-xs"><label>Assumed annual change <input className="ml-2 w-20 rounded-lg border border-border bg-background px-2 py-1 tabular-nums" type="number" min="-90" max="200" value={growth} onChange={event => setGrowth(Math.max(-90, Math.min(200, Number(event.target.value) || 0)))} /> %</label></div>}
    <div className="px-3 py-4 sm:px-4">{selected === 'realized-price' ? <p className="py-16 text-center text-xs text-muted-foreground">The live realized-price display is in the <a className="text-primary hover:underline" href="#blockhorizon-cycle">BlockHorizon chart selector above ↑</a>.</p> : unavailable.has(selected) ? <p className="py-16 text-center text-xs text-muted-foreground">No verified Atlas data feed for this metric yet. The reference chart above remains available; Atlas will not draw an invented series.</p> : status === 'loading' ? <p className="py-20 text-center text-xs text-muted-foreground" role="status">Loading Bitcoin history…</p> : status === 'error' || !result ? <p className="py-20 text-center text-xs text-muted-foreground" role="status">This source is unavailable or does not have enough history for this view. <a className="text-primary hover:underline" href={source} target="_blank" rel="noreferrer">Open the source ↗</a></p> : selected === 'monthly' || selected === 'quarterly' ? returnTable(rows, selected === 'quarterly') : <div className="h-[340px] sm:h-[430px]" role="img" aria-label={`${definition.label} chart`}><ResponsiveContainer width="100%" height="100%"><LineChart data={plotRows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" minTickGap={42} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => axisLabel ? String(value) : String(value).slice(0, 7)} label={axisLabel ? { value: axisLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} /><YAxis width={62} domain={logDomain} allowDataOverflow={Boolean(logDomain)} tickCount={logDomain ? Math.min(9, logDomain[1] - logDomain[0] + 1) : 5} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => { const actual = displayedValue(Number(value)); return isPrice ? compactPrice(actual) : actual.toLocaleString(undefined, { maximumFractionDigits: 1 }); }} /><Tooltip labelFormatter={value => axisLabel ? `${value} days after halving` : String(value)} formatter={(value: number, name: string) => [isPrice ? currency(displayedValue(Number(value))) : displayedValue(Number(value)).toLocaleString(undefined, { maximumFractionDigits: 2 }), name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11 }} />{selected === 'puell' && <ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />}{definition.keys?.map(key => <Line key={key.id} type="monotone" dataKey={key.id} name={key.label} stroke={key.color} strokeWidth={key.id === 'price' || key.id === 'current' || key.id === 'history' ? 2.5 : 1.7} dot={false} connectNulls={false} isAnimationActive={false} />)}</LineChart></ResponsiveContainer></div>}</div>
    {result && status === 'ready' && selected !== 'realized-price' && !unavailable.has(selected) && <p className="border-t border-border/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">Source: <a className="text-primary hover:underline" href={source} target="_blank" rel="noreferrer">Blockchain.com Charts API ↗</a> · BTC history {result.firstDate}–{result.latestDate} UTC{result.currentProgress !== undefined ? ` · current reward era ${result.currentProgress}% complete by block height` : ''}. {result.note}</p>}
  </Card>;
}
