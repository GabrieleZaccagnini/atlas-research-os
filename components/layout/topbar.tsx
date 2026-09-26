'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';
import { mockPrices, mockMarketStatus } from '@/lib/mock-data';
import { formatPrice, formatPercent, getTrendColor } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Topbar() {
  const btc = mockPrices[0];
  const eth = mockPrices[1];

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-5 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, narratives, assets..."
            className="h-9 w-80 rounded-md border border-input bg-background/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* BTC price */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f7931a]/15 text-[10px] font-bold text-[#f7931a]">
              ₿
            </div>
            <span className="text-xs font-semibold text-muted-foreground">BTC</span>
          </div>
          <span className="font-mono text-sm font-medium text-foreground">
            {formatPrice(btc.price)}
          </span>
          <span className={cn('font-mono text-xs font-medium', getTrendColor(btc.change24h))}>
            {formatPercent(btc.change24h)}
          </span>
        </div>

        {/* ETH price */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#627eea]/15 text-[10px] font-bold text-[#627eea]">
              Ξ
            </div>
            <span className="text-xs font-semibold text-muted-foreground">ETH</span>
          </div>
          <span className="font-mono text-sm font-medium text-foreground">
            {formatPrice(eth.price)}
          </span>
          <span className={cn('font-mono text-xs font-medium', getTrendColor(eth.change24h))}>
            {formatPercent(eth.change24h)}
          </span>
        </div>

        {/* Market status */}
        <div className="hidden items-center gap-2 rounded-md border border-success/20 bg-success/10 px-2.5 py-1.5 md:flex">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs font-semibold text-success">{mockMarketStatus.label}</span>
          <span className="text-xs text-muted-foreground">|</span>
          <span className="text-xs font-medium text-muted-foreground">
            F&amp;G {mockMarketStatus.fearGreedIndex}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        {/* User profile */}
        <button className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-secondary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground">
            RA
          </div>
          <div className="hidden flex-col items-start leading-tight md:flex">
            <span className="text-xs font-semibold text-foreground">Researcher</span>
            <span className="text-[10px] text-muted-foreground">Pro Plan</span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
        </button>
      </div>
    </header>
  );
}
