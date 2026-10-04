'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/components/auth/provider';
import { Card } from '@/components/shared';
import { appendLiquidation, coveredMilliseconds, emptyLiquidationTape, liquidationTapeKey, mergeLiquidationTapes, observedHeatmap, parseBinanceLiquidation, parseLiquidationTape, recordCoverage, type LiquidationTape, type LiquidationTotal } from '@/lib/liquidations';
import type { MarginBucket, MarginCluster, MarginEvent } from '@/lib/specialist-feeds';

const streamUrl = 'wss://fstream.binance.com/market/ws/btcusdt@forceOrder';
const usd = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
const usdt = (value: number) => `${new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)} USDT`;
const timeLabel = (time: number) => new Date(time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';

function useBinanceTape() {
  const auth = useAuth();
  const scope = auth.session?.user.id ?? 'browser';
  const [tape, setTape] = useState<LiquidationTape>(emptyLiquidationTape);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'reconnecting'>('connecting');
  const [storageError, setStorageError] = useState(false);
  const current = useRef<LiquidationTape>(emptyLiquidationTape());
  useEffect(() => {
    if (!auth.ready) return;
    const key = liquidationTapeKey(scope);
    let active = true;
    let canSave = true;
    try { current.current = mergeLiquidationTapes(parseLiquidationTape(localStorage.getItem(key)), emptyLiquidationTape()); setTape(current.current); setStorageError(false); }
    catch { current.current = emptyLiquidationTape(); setTape(current.current); setStorageError(true); canSave = false; }
    const save = () => {
      if (!canSave) return;
      try {
        current.current = mergeLiquidationTapes(current.current, parseLiquidationTape(localStorage.getItem(key)));
        localStorage.setItem(key, JSON.stringify(current.current));
        if (active) setTape(current.current);
      }
      catch { canSave = false; if (active) setStorageError(true); }
    };
    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let connectedAt: number | null = null;
    let attempts = 0;
    const closeWindow = () => {
      if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
      if (connectedAt !== null) {
        current.current = recordCoverage(current.current, connectedAt, Date.now());
        connectedAt = null;
        if (active) setTape(current.current);
        save();
      }
    };
    const connect = () => {
      if (!active) return;
      setStatus(attempts ? 'reconnecting' : 'connecting');
      try { socket = new WebSocket(streamUrl); }
      catch { retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5))); return; }
      socket.onopen = () => {
        if (!active) return;
        attempts = 0;
        connectedAt = Date.now();
        setStatus('connected');
        current.current = recordCoverage(current.current, connectedAt, connectedAt);
        setTape(current.current);
        save();
        heartbeat = setInterval(() => {
          if (connectedAt === null) return;
          current.current = recordCoverage(current.current, connectedAt, Date.now());
          setTape(current.current);
          save();
        }, 5000);
      };
      socket.onmessage = message => {
        try {
          const event = parseBinanceLiquidation(JSON.parse(message.data as string));
          if (!event || !active) return;
          current.current = appendLiquidation(current.current, event);
          setTape(current.current);
          save();
        } catch { /* Ignore malformed or unrelated provider messages. */ }
      };
      socket.onclose = () => {
        closeWindow();
        if (active) { setStatus('reconnecting'); retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempts++, 5))); }
      };
      socket.onerror = () => { if (active) setStatus('reconnecting'); };
    };
    connect();
    return () => { active = false; if (retry) clearTimeout(retry); closeWindow(); socket?.close(); };
  }, [auth.ready, scope]);
  return { tape, status, storageError };
}

function useCoinalyzeTotals() {
  const [points, setPoints] = useState<LiquidationTotal[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing_key' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/data/coinalyze-liquidations', { signal: AbortSignal.timeout(16000) });
        const body = await response.json();
        if (!active) return;
        if (response.status === 503 && body.status === 'missing_key') { setStatus('missing_key'); return; }
        if (!response.ok || !Array.isArray(body.points)) throw new Error('Unavailable');
        setPoints(body.points);
        setStatus('ready');
      } catch { if (active) setStatus('error'); }
    }
    void load();
    const interval = setInterval(() => void load(), 3600000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  return { points, status };
}

function ObservedHeatmap({ tape }: { tape: LiquidationTape }) {
  const now = Date.now();
  const from = now - 24 * 3600000;
  const { cells, priceStep, timeStep } = observedHeatmap(tape.events, now);
  const hoursCovered = coveredMilliseconds(tape.coverage, from, now) / 3600000;
  const coverageLabel = hoursCovered < 1 ? `${Math.floor(hoursCovered * 60)} min` : `${hoursCovered.toFixed(1)} h`;
  const recent = tape.events.filter(event => event.time >= from && event.time <= now);
  const priceBins = cells.map(cell => cell.price);
  const low = priceBins.length ? Math.min(...priceBins) - priceStep : 0;
  const high = priceBins.length ? Math.max(...priceBins) + priceStep : 0;
  const rows = priceBins.length ? (high - low) / priceStep + 1 : 1;
  const maxValue = Math.max(1, ...cells.map(cell => cell.longUsdt + cell.shortUsdt));
  const left = 74; const top = 12; const width = 710; const height = 220;
  const slotWidth = width * timeStep / (24 * 3600000);
  const rowHeight = height / rows;
  return <Card className="min-w-0 p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-semibold">Observed liquidation events · price × time</h2><span className="text-[11px] text-muted-foreground">Last 24h · {recent.length} captured · {coverageLabel} connected</span></div>
    <p className="mt-1 text-xs text-muted-foreground">Binance BTCUSDT forced-order snapshots captured by this browser tab. Red = liquidated longs; blue = liquidated shorts. Color strength reflects reported filled notional.</p>
    <div className="mt-3 w-full overflow-x-auto"><svg viewBox="0 0 800 285" className="min-w-[520px] w-full" role="img" aria-label="Observed Binance BTCUSDT liquidation events by time and execution price"><rect x={left} y={top} width={width} height={height} fill="hsl(var(--secondary))" opacity="0.28" />
      {cells.map(cell => {
        const x = left + (cell.time - from) / (24 * 3600000) * width;
        const y = top + (high - cell.price) / priceStep * rowHeight;
        const longDominant = cell.longUsdt >= cell.shortUsdt;
        const color = cell.longUsdt && cell.shortUsdt ? '#a568bb' : longDominant ? '#ee6969' : '#528bdf';
        const opacity = 0.2 + 0.8 * Math.log1p(cell.longUsdt + cell.shortUsdt) / Math.log1p(maxValue);
        return <rect key={`${cell.time}:${cell.price}`} x={Math.max(left, x)} y={y} width={Math.max(1, Math.min(slotWidth - 1, left + width - Math.max(left, x)))} height={Math.max(1, rowHeight - 1)} fill={color} opacity={opacity}><title>{timeLabel(cell.time)} · {cell.price.toLocaleString()}–{(cell.price + priceStep).toLocaleString()} USDT · long {usdt(cell.longUsdt)} · short {usdt(cell.shortUsdt)} · {cell.count} snapshots</title></rect>;
      })}
      {cells.length ? <><text x={left - 8} y={top + 10} textAnchor="end" fontSize="11" fill="currentColor">{(high + priceStep).toLocaleString()}</text><text x={left - 8} y={top + height} textAnchor="end" fontSize="11" fill="currentColor">{low.toLocaleString()}</text></> : <text x={left + width / 2} y={top + height / 2} textAnchor="middle" fontSize="12" fill="currentColor">No captured event yet · collecting live snapshots</text>}
      <text x={left} y={top + height + 35} fontSize="11" fill="currentColor">24h ago</text><text x={left + width} y={top + height + 35} textAnchor="end" fontSize="11" fill="currentColor">Now · UTC</text>
      {Array.from({ length: 48 }, (_, index) => {
        const start = from + index * 1800000;
        const covered = coveredMilliseconds(tape.coverage, start, start + 1800000) > 0;
        return <rect key={index} x={left + index * width / 48} y={top + height + 7} width={width / 48 - 1} height={5} fill={covered ? '#46a980' : 'hsl(var(--border))'} />;
      })}
    </svg></div>
    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Green strip: periods with an open stream connection; gray: no collection. Binance sends at most one order snapshot per symbol per second, so observed amounts are incomplete. This shows past execution prices, not future liquidation levels. Records stay in this browser for up to 7 days.</p>
  </Card>;
}

type MarginPadResponse = {
  observed: { updatedAt: number; buckets: MarginBucket[] } | null;
  modeled: { updatedAt: number; clusters: MarginCluster[] } | null;
  latestEvents: MarginEvent[];
  spotUsd: number | null;
};

function MarginPadContext() {
  const [data, setData] = useState<MarginPadResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/data/marginpad-liquidations', { signal: AbortSignal.timeout(18000) });
        if (!response.ok) throw new Error('Unavailable');
        const body = await response.json() as MarginPadResponse;
        if (!active) return;
        setData(body);
        setStatus('ready');
      } catch { if (active) setStatus('error'); }
    };
    void load();
    const interval = setInterval(() => void load(), 60000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  const observed = data?.observed?.buckets.slice(-60) ?? [];
  const spot = data?.spotUsd;
  const candidates = data?.modeled?.clusters.filter(cluster => !spot || (cluster.price >= spot * 0.9 && cluster.price <= spot * 1.1)) ?? [];
  const levels = candidates.sort((a, b) => b.estimatedUsd - a.estimatedUsd).slice(0, 24).sort((a, b) => a.price - b.price).map(cluster => ({
    price: cluster.price,
    longUsd: cluster.side === 'long_liquidated' ? cluster.estimatedUsd : 0,
    shortUsd: cluster.side === 'short_liquidated' ? cluster.estimatedUsd : 0,
  }));
  const chart = (rows: { price: number; longUsd: number; shortUsd: number }[], label: string) => <div className="mt-3 h-[250px]" role="img" aria-label={label}><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="price" tickFormatter={value => `$${Math.round(Number(value) / 1000)}k`} minTickGap={26} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis width={58} tickFormatter={usd} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip labelFormatter={value => `${usd(Number(value))} BTC price`} formatter={(value: number, name: string) => [usd(Number(value)), name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 11 }} /><Bar dataKey="longUsd" name="Longs" fill="#ee6969" stackId="side" isAnimationActive={false} /><Bar dataKey="shortUsd" name="Shorts" fill="#528bdf" stackId="side" isAnimationActive={false} /></BarChart></ResponsiveContainer></div>;
  return <div className="grid gap-4 xl:grid-cols-2">
    <Card className="min-w-0 p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">Observed liquidations by price · multiple venues</h3>{data?.observed && <span className="text-[11px] text-muted-foreground">MarginPad · updated {timeLabel(data.observed.updatedAt)}</span>}</div>
      <p className="mt-1 text-xs text-muted-foreground">Past 24h executed long and short liquidations grouped by execution-price bucket. This is a provider-collected sample, not a complete exchange ledger or a future heatmap.</p>
      {status === 'loading' ? <p className="py-16 text-center text-xs text-muted-foreground">Loading observed levels…</p> : observed.length ? chart(observed, 'MarginPad observed BTC liquidations by executed price') : <p className="py-16 text-center text-xs text-muted-foreground">Observed price buckets are unavailable right now.</p>}
      {!!data?.latestEvents.length && <p className="mt-2 text-[11px] text-muted-foreground">Latest sampled event: {data.latestEvents[0].exchange} · {data.latestEvents[0].side === 'long_liquidated' ? 'long' : 'short'} · {usd(data.latestEvents[0].notionalUsd)} at {usd(data.latestEvents[0].price)} · {timeLabel(data.latestEvents[0].time)}.</p>}
    </Card>
    <Card className="min-w-0 p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">Modeled future liquidation clusters</h3>{data?.modeled && <span className="text-[11px] text-muted-foreground">MarginPad model · updated {timeLabel(data.modeled.updatedAt)}</span>}</div>
      <p className="mt-1 text-xs text-muted-foreground">{spot ? `The 24 strongest estimated levels within ±10% of ${usd(spot)} BTC.` : 'The 24 strongest estimated levels in the provider range.'} These are model outputs, not open orders, confirmed positions or observed liquidations.</p>
      {status === 'loading' ? <p className="py-16 text-center text-xs text-muted-foreground">Loading modeled levels…</p> : levels.length ? chart(levels, 'MarginPad modeled future BTC liquidation levels') : <p className="py-16 text-center text-xs text-muted-foreground">Modeled levels are unavailable right now.</p>}
      <p className="mt-2 text-[11px] text-muted-foreground">Long-liquidation levels are red; short-liquidation levels are blue. Estimated size is relative provider output, not a guaranteed amount to be liquidated.</p>
    </Card>
    <p className="text-[11px] text-muted-foreground xl:col-span-2">Source: <a href="https://marginpad.io/free-crypto-api/" target="_blank" rel="noreferrer" className="text-primary">MarginPad free API ↗</a>. Collection varies by venue; the live event sample, observed price profile and modeled levels are distinct datasets.{status === 'error' ? ' MarginPad is temporarily unavailable.' : ''}</p>
  </div>;
}

export function LiquidationContext() {
  const { tape, status, storageError } = useBinanceTape();
  const coinalyze = useCoinalyzeTotals();
  const latest = coinalyze.points.slice(-168);
  const last = coinalyze.points.at(-1);
  const lastDay = coinalyze.points.filter(point => last && point.time > last.time - 24 * 3600000);
  const longTotal = lastDay.reduce((sum, point) => sum + point.longUsd, 0);
  const shortTotal = lastDay.reduce((sum, point) => sum + point.shortUsd, 0);
  return <section className="space-y-4" aria-label="Liquidations"><div><h2 className="text-base font-semibold">Liquidations</h2><p className="mt-1 text-xs text-muted-foreground">Past executions, estimated future levels and hourly totals are separate views with different coverage.</p></div>
    <p className="text-xs text-muted-foreground">Binance live stream: <span className={status === 'connected' ? 'text-success' : 'text-warning'}>{status === 'connected' ? 'Connected · collecting while this page is open' : status === 'connecting' ? 'Connecting…' : 'Disconnected · retrying'}</span>{storageError ? ' · Browser storage unavailable; new events are session-only.' : ''}</p>
    <ObservedHeatmap tape={tape} />
    <MarginPadContext />
    <Card className="min-w-0 p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">Historical long / short liquidations</h3>{coinalyze.status === 'ready' && <span className="text-[11px] text-muted-foreground">Coinalyze · Binance BTCUSDT perp · through {last ? timeLabel(last.time) : '—'}</span>}</div>
      {coinalyze.status === 'ready' ? <><p className="mt-1 text-xs text-muted-foreground">Last 24 reported hourly buckets: longs {usd(longTotal)} · shorts {usd(shortTotal)}. Hourly series below shows up to 7 days; amounts are converted to USD by Coinalyze.</p><div className="mt-4 h-[260px]" role="img" aria-label="Coinalyze historical long and short liquidation totals"><ResponsiveContainer width="100%" height="100%"><BarChart data={latest} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tickFormatter={value => new Date(Number(value)).toISOString().slice(5, 10)} minTickGap={45} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><YAxis width={58} tickFormatter={usd} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /><Tooltip labelFormatter={value => timeLabel(Number(value))} formatter={(value: number, name: string) => [usd(Number(value)), name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 11 }} /><Bar dataKey="longUsd" name="Long liquidations" fill="#ee6969" stackId="liquidations" isAnimationActive={false} /><Bar dataKey="shortUsd" name="Short liquidations" fill="#528bdf" stackId="liquidations" isAnimationActive={false} /></BarChart></ResponsiveContainer></div></> : <p className="mt-4 rounded-lg bg-secondary/25 p-4 text-xs text-muted-foreground" role="status">{coinalyze.status === 'loading' ? 'Loading Coinalyze history…' : coinalyze.status === 'missing_key' ? 'Historical totals are ready to connect when a Coinalyze API key is configured for Atlas.' : 'Coinalyze history is unavailable right now. Binance live collection is independent.'}</p>}
      <p className="mt-3 text-[11px] text-muted-foreground"><a href="https://coinalyze.net/" target="_blank" rel="noreferrer" className="text-primary">Coinalyze ↗</a> · <a href="https://www.binance.com/en/futures/BTCUSDT" target="_blank" rel="noreferrer" className="text-primary">Binance BTCUSDT ↗</a> · Totals cannot fill price gaps in the observed heatmap.</p>
    </Card>
  </section>;
}
