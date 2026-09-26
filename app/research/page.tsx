'use client';

import { FileSearch, Plus, Filter } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge } from '@/components/shared';
import { DataTable, type Column } from '@/components/shared/data-table';
import { mockProjects } from '@/lib/mock-data';
import { formatPrice, formatCurrency, formatPercent, getTrendColor, getTrendBgColor } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProjectResearchItem } from '@/lib/types';

const convictionVariant: Record<string, 'success' | 'primary' | 'warning' | 'outline'> = {
  high: 'success',
  medium: 'primary',
  low: 'warning',
  none: 'outline',
};

const statusVariant: Record<string, 'success' | 'primary' | 'warning' | 'outline'> = {
  conviction: 'success',
  watching: 'primary',
  researching: 'warning',
  archived: 'outline',
};

export default function ResearchPage() {
  const columns: Column<ProjectResearchItem>[] = [
    {
      key: 'rank',
      header: '#',
      width: '40px',
      render: (row) => <span className="font-mono text-xs text-muted-foreground">{row.rank || '—'}</span>,
    },
    {
      key: 'name',
      header: 'Project',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{row.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{row.symbol}</span>
          </div>
          <div className="text-xs text-muted-foreground">{row.sector}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (row) => (
        <div>
          <div className="font-mono text-sm text-foreground">{row.price > 0 ? formatPrice(row.price) : '—'}</div>
          <div className={cn('inline-block rounded px-1.5 text-xs font-medium', getTrendBgColor(row.change24h))}>
            {row.price > 0 ? formatPercent(row.change24h) : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'marketCap',
      header: 'Market Cap',
      align: 'right',
      render: (row) => <span className="font-mono text-sm text-foreground">{row.marketCap > 0 ? formatCurrency(row.marketCap) : 'TBD'}</span>,
    },
    {
      key: 'conviction',
      header: 'Conviction',
      align: 'center',
      render: (row) => <Badge variant={convictionVariant[row.conviction]}>{row.conviction}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((t) => (
            <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{t}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      align: 'right',
      render: (row) => <span className="text-xs text-muted-foreground">{row.lastUpdated}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Project Research" description="Deep-dive research on individual projects. Track, analyze, and build conviction.">
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New Research
        </button>
      </PageHeader>

      <Card>
        <CardHeader title="Research Pipeline" description={`${mockProjects.length} projects tracked`} />
        <CardBody className="p-0">
          <DataTable columns={columns} data={mockProjects} />
        </CardBody>
      </Card>
    </div>
  );
}
