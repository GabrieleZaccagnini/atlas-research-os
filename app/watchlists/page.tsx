'use client';

import { Plus, Bell, Eye } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, Sparkline, StatCard, SectionGrid } from '@/components/shared';
import { DataTable, type Column } from '@/components/shared/data-table';
import { mockWatchlist } from '@/lib/mock-data';
import { formatPrice, formatCurrency, formatPercent, getTrendColor, getTrendBgColor } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { WatchlistItem } from '@/lib/types';

export default function WatchlistsPage() {
  const columns: Column<WatchlistItem>[] = [
    {
      key: 'name',
      header: 'Asset',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {row.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{row.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{row.symbol}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (row) => <span className="font-mono text-sm font-medium text-foreground">{formatPrice(row.price)}</span>,
    },
    {
      key: 'change24h',
      header: '24H',
      align: 'right',
      render: (row) => (
        <span className={cn('font-mono text-sm font-medium', getTrendColor(row.change24h))}>
          {formatPercent(row.change24h)}
        </span>
      ),
    },
    {
      key: 'change7d',
      header: '7D',
      align: 'right',
      render: (row) => (
        <span className={cn('font-mono text-sm font-medium', getTrendColor(row.change7d))}>
          {formatPercent(row.change7d)}
        </span>
      ),
    },
    {
      key: 'marketCap',
      header: 'Market Cap',
      align: 'right',
      render: (row) => <span className="font-mono text-sm text-foreground">{formatCurrency(row.marketCap)}</span>,
    },
    {
      key: 'volume',
      header: 'Volume 24h',
      align: 'right',
      render: (row) => <span className="font-mono text-sm text-foreground">{formatCurrency(row.volume24h)}</span>,
    },
    {
      key: 'sparkline',
      header: '7D Chart',
      align: 'center',
      render: (row) => <Sparkline data={row.sparkline} />,
    },
    {
      key: 'alerts',
      header: 'Alerts',
      align: 'center',
      render: (row) =>
        row.alerts > 0 ? (
          <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            <Bell className="h-2.5 w-2.5" /> {row.alerts}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Watchlists" description="Track assets across multiple watchlists with price alerts and custom indicators.">
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New Watchlist
        </button>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Assets Tracked" value="7" sublabel="Across 3 watchlists" icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Active Alerts" value="9" sublabel="3 triggered today" />
        <StatCard label="Best Performer" value="TAO" change={7.89} sublabel="Bittensor" />
        <StatCard label="Worst Performer" value="ONDO" change={-1.34} sublabel="Ondo Finance" />
      </SectionGrid>

      <Card>
        <CardHeader title="Primary Watchlist" description="Core portfolio tracking" action={<Badge variant="primary">{mockWatchlist.length} assets</Badge>} />
        <CardBody className="p-0">
          <DataTable columns={columns} data={mockWatchlist} />
        </CardBody>
      </Card>
    </div>
  );
}
