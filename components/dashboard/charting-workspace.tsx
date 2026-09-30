'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/shared';
import { inputClass } from '@/components/projects/fields';
import { TradingViewChart } from './market-structure';
const pairs = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'LINK'].map(asset => ({ name: `${asset} / USDT`, symbol: `BINANCE:${asset}USDT` }));
export function ChartingWorkspace() {
  const [symbol, setSymbol] = useState(pairs[0].symbol); const [range, setRange] = useState('3M');
  const name = pairs.find(p => p.symbol === symbol)?.name;
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold tracking-tight">Charts</h1><Link href="/market-cycle#structure" className="text-xs text-primary">Market structure & cycle ↗</Link></div><Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"><label className="text-[10px] text-muted-foreground">Market<select className={`${inputClass} ml-2 w-auto`} aria-label="Chart market" value={symbol} onChange={e => setSymbol(e.target.value)}>{pairs.map(p => <option key={p.symbol} value={p.symbol}>{p.name}</option>)}</select></label><div className="flex gap-1" aria-label="Chart range">{[['1M','1M'],['3M','3M'],['1Y','12M'],['All','ALL']].map(([label,value]) => <button key={value} aria-pressed={range === value} className={`rounded-lg px-3 py-1.5 text-xs ${range === value ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`} onClick={() => setRange(value)}>{label}</button>)}</div></div><TradingViewChart symbol={symbol} range={range} expanded /><a className="block border-t px-4 py-3 text-[11px] text-muted-foreground hover:text-primary" href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`} target="_blank" rel="noreferrer">{name} · Binance spot · chart by TradingView ↗</a></Card><Card className="px-4 py-3 text-xs text-muted-foreground">Indicators and drawing tools are available inside the chart. Drawings here are temporary; saving named chart plans to projects is the next charting slice.</Card></div>;
}
