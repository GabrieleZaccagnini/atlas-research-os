'use client';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Panel } from './panels';

const markets = [
  { label: 'TOTAL', symbol: 'CRYPTOCAP:TOTAL', description: 'Top-125 crypto market cap' },
  { label: 'TOTAL2', symbol: 'CRYPTOCAP:TOTAL2', description: 'Excluding Bitcoin' },
  { label: 'TOTAL3', symbol: 'CRYPTOCAP:TOTAL3', description: 'Excluding Bitcoin & Ethereum' },
  { label: 'OTHERS', symbol: 'CRYPTOCAP:OTHERS', description: 'Excluding TradingView’s designated major coins' },
  { label: 'BTC.D', symbol: 'CRYPTOCAP:BTC.D', description: 'Bitcoin dominance · TradingView universe' },
  { label: 'ETH.D', symbol: 'CRYPTOCAP:ETH.D', description: 'Ethereum dominance · TradingView universe' },
  { label: 'ETH/BTC', symbol: 'BINANCE:ETHBTC', description: 'ETH/BTC · Binance spot pair' },
] as const;
const periods = [{ label: '1M', range: '1M' }, { label: '3M', range: '3M' }, { label: '1Y', range: '12M' }, { label: 'All', range: 'ALL' }] as const;
function chartUrl(symbol: string) { return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`; }

export function TradingViewChart({ symbol, range, expanded = false }: { symbol: string; range: string; expanded?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<'waiting' | 'loading' | 'display' | 'error'>('waiting');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!host.current || !resolvedTheme) return;
    const node = host.current;
    let disposed = false; let started = false; let frameLoaded = false; let observedFrame: HTMLIFrameElement | null = null; let timer: ReturnType<typeof setTimeout> | undefined;
    setState('waiting');
    const observer = new MutationObserver(() => {
      const frame = node.querySelector('iframe');
      if (frame && frame !== observedFrame) {
        observedFrame = frame;
        frame.title = `${symbol} TradingView chart`;
        frame.setAttribute('loading', 'lazy');
        frame.addEventListener('load', () => {
          frameLoaded = true;
          if (timer) clearTimeout(timer);
          if (!disposed) setState('display');
        }, { once: true });
        frame.addEventListener('error', () => { if (!disposed) setState('error'); }, { once: true });
      }
    });
    function load() {
      if (started || disposed) return;
      started = true; setState('loading');
      const widget = document.createElement('div'); widget.className = 'tradingview-widget-container__widget'; widget.style.height = '100%';
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;
      script.textContent = JSON.stringify({ autosize: true, symbol, interval: 'D', range, timezone: 'Etc/UTC', theme: resolvedTheme === 'light' ? 'light' : 'dark', style: expanded ? '1' : '3', locale: 'en', allow_symbol_change: false, hide_top_toolbar: !expanded, hide_side_toolbar: !expanded, hide_legend: !expanded, hide_volume: !expanded, withdateranges: expanded, save_image: expanded, support_host: 'https://www.tradingview.com' });
      script.onerror = () => { if (!disposed) setState('error'); };
      observer.observe(node, { childList: true, subtree: true });
      node.append(widget, script);
      timer = setTimeout(() => { if (!disposed && !frameLoaded) setState('error'); }, 20000);
    }
    const visibility = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { load(); visibility.disconnect(); } }, { rootMargin: '100px' });
    visibility.observe(node);
    return () => { disposed = true; visibility.disconnect(); observer.disconnect(); if (timer) clearTimeout(timer); node.replaceChildren(); };
  }, [symbol, range, expanded, resolvedTheme, attempt]);
  return <div className="relative" style={{ height: expanded ? 'min(65dvh, 600px)' : 240 }}>
    <div ref={host} className="tradingview-widget-container h-full w-full" />
    {state !== 'display' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card text-xs text-muted-foreground" role="status"><span>{state === 'error' ? 'Chart could not load.' : 'Loading TradingView chart…'}</span>{state === 'error' && <button className="rounded-lg border px-3 py-2 text-foreground" onClick={() => setAttempt(v => v + 1)}>Retry chart</button>}<a href={chartUrl(symbol)} target="_blank" rel="noreferrer" className="text-primary">Open on TradingView ↗</a></div>}
  </div>;
}
export function MarketStructure({ detailed = false }: { detailed?: boolean }) {
  const [range, setRange] = useState('3M'); const [view, setView] = useState<'caps' | 'relative'>('caps'); const [expanded, setExpanded] = useState<string | null>(null);
  const shown = view === 'caps' ? markets.slice(0, 4) : markets.slice(4);
  const selected = markets.find(m => m.symbol === expanded);
  return <Panel title="Market structure" href={detailed ? undefined : '/market-cycle#structure'} label="TradingView">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3"><div className="flex gap-1 rounded-lg bg-secondary/60 p-1">{(['caps', 'relative'] as const).map(v => <button key={v} aria-pressed={view === v} className={`rounded-md px-3 py-1.5 text-[11px] ${view === v ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground'}`} onClick={() => setView(v)}>{v === 'caps' ? 'Market caps' : 'Dominance & ETH/BTC'}</button>)}</div><div className="flex gap-1" aria-label="Market structure timeframe">{periods.map(p => <button key={p.range} aria-pressed={range === p.range} className={`rounded-lg px-2.5 py-1.5 text-[11px] ${range === p.range ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`} onClick={() => setRange(p.range)}>{p.label}</button>)}</div></div>
    <div className="grid gap-px bg-border/50 sm:grid-cols-2">{shown.map(m => <div key={m.symbol} className="min-w-0 bg-card"><div className="flex items-start justify-between gap-2 px-4 pt-3"><div><h3 className="text-xs font-semibold">{m.label}</h3><p className="mt-1 text-[10px] text-muted-foreground">{m.description}</p></div><button className="rounded p-1.5 text-muted-foreground hover:bg-secondary" aria-label={`Expand ${m.label} chart`} onClick={() => setExpanded(m.symbol)}><Maximize2 size={14} /></button></div><TradingViewChart symbol={m.symbol} range={range} /><a className="flex items-center gap-1 px-4 pb-3 text-[10px] text-muted-foreground hover:text-primary" href={chartUrl(m.symbol)} target="_blank" rel="noreferrer">{m.label} chart by TradingView <ArrowUpRight size={11} /></a></div>)}</div>
    <div className="border-t border-border/40 px-4 py-2 text-[10px] text-muted-foreground"><details><summary className="cursor-pointer">Definitions & chart coverage</summary><p className="mt-2 leading-relaxed">TradingView’s cap indices use its top-125 universe, not the provider-wide market cap above. TOTAL2 and TOTAL3 include stablecoins. OTHERS excludes the designated major coins. Embedded displays are independent of Atlas refresh; symbol availability and data notices are controlled by TradingView. ETH/BTC uses Binance spot. Drawing persistence and Atlas-owned chart history are planned.</p><a href="https://www.tradingview.com/support/solutions/43000550480-where-do-i-find-crypto-market-capitalization-and-dominance/" target="_blank" rel="noreferrer" className="mt-2 block text-primary">TradingView methodology ↗</a></details></div>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setExpanded(null); }}><DialogContent className="max-w-6xl p-4"><DialogTitle>{selected?.label} chart</DialogTitle><DialogDescription>{selected?.description} · {range === '12M' ? '1Y' : range}</DialogDescription>{selected && <><TradingViewChart symbol={selected.symbol} range={range} expanded /><a href={chartUrl(selected.symbol)} target="_blank" rel="noreferrer" className="text-xs text-primary">{selected.label} chart by TradingView ↗</a></>}</DialogContent></Dialog>
  </Panel>;
}
