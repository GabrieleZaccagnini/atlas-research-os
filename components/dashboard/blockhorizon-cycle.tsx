'use client';

import { useState } from 'react';
import { Card } from '@/components/shared';
import { BitcoinMiningChart } from './bitcoin-mining-chart';

const charts = [
  {
    id: 'mvrv-z-score',
    label: 'MVRV Z-Score',
    description: 'How stretched Bitcoin’s market value is relative to its on-chain cost basis.',
    measures: 'Market cap minus realized cap, divided by the historical standard deviation of market cap. The chart plots this score alongside BTC price on a separate axis.',
    read: 'Higher readings mean market value is further above the value of coins when they last moved. Compare with prior cycles; a low reading alone does not confirm a bottom.',
    methodUrl: 'https://docs.blockhorizon.io/chart-tutorials/price-and-valuation/mvrv-z-score',
  },
  {
    id: 'realized-price',
    label: 'Realized Price',
    description: 'Bitcoin price compared with an estimated network-wide on-chain cost basis.',
    measures: 'Realized cap divided by circulating BTC. Realized cap values coins at their price when they last moved on-chain.',
    read: 'Price above the line implies aggregate unrealized profit relative to that on-chain basis; below implies aggregate loss. It is not every holder’s purchase price or guaranteed support.',
    methodUrl: 'https://docs.blockhorizon.io/chart-tutorials/price-and-valuation/realized-price',
  },
  {
    id: 'pb-various',
    label: 'PlanB composite',
    description: 'A model comparison of Bitcoin price, momentum, long trend and on-chain cost basis.',
    measures: 'BTC price is coloured by PlanB RSI and plotted with realized price, the 200-week moving average and a 2024-refit stock-to-flow model.',
    read: 'Compare price with the cost-basis and long-term trend lines. Stock-to-flow maps issuance scarcity to a modelled price; that line is a hypothesis, not a price target.',
    methodUrl: 'https://docs.blockhorizon.io/chart-tutorials/planb/planb-market-cycle',
  },
  {
    id: 'asopr',
    label: 'Adjusted SOPR',
    description: 'Whether coins spent on-chain are being moved at a profit or a loss.',
    measures: 'The value of spent outputs at the time they move divided by their value when created, excluding outputs held for less than one hour. BTC price is shown on a separate axis.',
    read: 'Above 1 means the coins spent in that period moved at an aggregate profit; below 1 means an aggregate loss. It describes spending, not every holder or miner, and a crossing is not a reliable turn signal by itself.',
    methodUrl: 'https://docs.blockhorizon.io/chart-tutorials/spend-outputs/asopr',
  },
  {
    id: 'price-drawdown',
    label: 'Price Drawdown',
    description: 'How far Bitcoin sits below its previous price high.',
    measures: 'The percentage distance from the running all-time high, shown alongside BTC price. The drawdown scale shows the depth as a positive percentage.',
    read: 'Zero means a new high; 50% means price is half its previous peak. Compare the depth and duration with past cycles, but a similar drawdown does not imply the same recovery path.',
    methodUrl: 'https://charts.blockhorizon.io/charts/price-drawdown',
  },
  {
    id: 'miner-revenue-total',
    label: 'Miner Revenue',
    description: 'Bitcoin paid to miners across the network each day, compared with BTC price.',
    measures: 'Daily block rewards plus transaction fees, measured in BTC, with BTC price on a separate axis. This is network-wide gross revenue, not revenue per machine.',
    read: 'Compare changes around halvings and fee spikes with BTC price. This does not show miner profit: electricity, hardware and other operating costs are absent.',
    methodUrl: 'https://docs.blockhorizon.io/chart-tutorials/miners/miner-revenue-total',
  },
] as const;

export function BlockHorizonCycle() {
  const [selectedId, setSelectedId] = useState<(typeof charts)[number]['id']>('mvrv-z-score');
  const selected = charts.find(chart => chart.id === selectedId) ?? charts[0];
  const chartUrl = `https://charts.blockhorizon.io/charts/${selected.id}`;

  return <section id="bitcoin-cycles" className="scroll-mt-4 space-y-3" aria-label="Bitcoin cycle context">
    <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bitcoin cycle context</h2><p className="mt-1 text-xs text-muted-foreground">Provider-hosted displays from BlockHorizon; Atlas does not calculate or save these signals.</p></div><a className="text-xs text-primary hover:underline" href="https://charts.blockhorizon.io/signals" target="_blank" rel="noreferrer">Open signal history ↗</a></div>
    <Card className="overflow-hidden">
      <div className="border-b border-border/40 px-4 py-3">
        <h3 className="text-sm font-semibold">BlockHorizon Cycle Index</h3>
        <p className="mt-1 text-xs text-muted-foreground">One daily summary of several on-chain indicators, scored by BlockHorizon.</p>
      </div>
      <div className="grid gap-3 border-b border-border/40 px-4 py-3 text-xs leading-relaxed sm:grid-cols-2">
        <div><p className="font-semibold">What it measures</p><p className="mt-1 text-muted-foreground">BlockHorizon scales selected indicators to 0–100 and averages them. Bottom, Bearish, Bullish and Top are positions on its cycle spectrum.</p></div>
        <div><p className="font-semibold">How to read it</p><p className="mt-1 text-muted-foreground">A low or high score describes historical cycle context, not the chance of a price move. Open the signal history to see which components agree or differ.</p></div>
      </div>
      <div className="bg-white p-3 sm:p-4"><iframe className="block h-[120px] w-full rounded-lg border border-black/10" src="https://charts.blockhorizon.io/embed/signal/blockhorizon" title="BlockHorizon Cycle Index signal" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
      <p className="border-t border-border/40 px-4 py-2 text-xs text-muted-foreground">If the display is blank, <a className="text-primary hover:underline" href="https://charts.blockhorizon.io/signals" target="_blank" rel="noreferrer">view it on BlockHorizon ↗</a>. <a className="text-primary hover:underline" href="https://www.blockhorizon.io/" target="_blank" rel="noreferrer">Index definition ↗</a></p>
    </Card>
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
        <div><h3 className="text-sm font-semibold">Cycle charts</h3><p className="mt-1 text-xs text-muted-foreground">{selected.description}</p></div>
        <a className="text-xs text-primary hover:underline" href={chartUrl} target="_blank" rel="noreferrer">Open full chart ↗</a>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border/40 px-3 py-2" aria-label="Bitcoin cycle chart">
        {charts.map(chart => <button key={chart.id} type="button" aria-pressed={chart.id === selectedId} className={`rounded-lg px-3 py-1.5 text-xs ${chart.id === selectedId ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary'}`} onClick={() => setSelectedId(chart.id)}>{chart.label}</button>)}
      </div>
      <div className="grid gap-3 border-b border-border/40 px-4 py-3 text-xs leading-relaxed sm:grid-cols-2">
        <div><p className="font-semibold">What it measures</p><p className="mt-1 text-muted-foreground">{selected.measures}</p></div>
        <div><p className="font-semibold">How to read it</p><p className="mt-1 text-muted-foreground">{selected.read}</p></div>
      </div>
      <div className="bg-white p-2 sm:p-3"><iframe key={selected.id} className="block h-[360px] w-full rounded-lg border border-black/10 sm:h-[460px]" src={`https://charts.blockhorizon.io/embed/chart/${selected.id}`} title={`BlockHorizon ${selected.label} chart`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
      <p className="border-t border-border/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">These are BlockHorizon’s displays, separate from Atlas’s price feeds and saved research. A model is context, not a confirmed market phase or forecast. If the display is blank, use the full-chart link above. <a className="text-primary hover:underline" href={selected.methodUrl} target="_blank" rel="noreferrer">Read the provider’s explanation ↗</a></p>
    </Card>
    <BitcoinMiningChart />
  </section>;
}
