'use client';

import { Target, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, ProgressBar, StatCard, SectionGrid } from '@/components/shared';
import { mockConvictions } from '@/lib/mock-data';
import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ConvictionsPage() {
  const open = mockConvictions.filter((c) => c.status === 'open');
  const closed = mockConvictions.filter((c) => c.status === 'closed');

  return (
    <div>
      <PageHeader title="Convictions" description="High-conviction investment theses with entry, target, and risk management.">
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New Conviction
        </button>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Open Positions" value="5" sublabel="Total deployed: 15%" icon={<Target className="h-4 w-4" />} />
        <StatCard label="Avg Conviction" value="85.4" sublabel="High conviction bias" />
        <StatCard label="Total PnL" value="+18.9%" sublabel="Unrealized" />
        <StatCard label="Win Rate" value="83%" sublabel="5 of 6 positions" />
      </SectionGrid>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Open Positions</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {open.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {c.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{c.name}</span>
                        <Badge variant="outline">{c.category}</Badge>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{c.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Conviction</div>
                    <div className="font-mono text-2xl font-bold text-foreground">{c.convictionScore}</div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.thesis}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md border border-border bg-secondary/30 p-2.5">
                    <div className="text-muted-foreground">Entry Zone</div>
                    <div className="mt-0.5 font-mono font-medium text-foreground">{c.entryZone}</div>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/30 p-2.5">
                    <div className="text-muted-foreground">Target</div>
                    <div className="mt-0.5 font-mono font-medium text-success">{c.target}</div>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/30 p-2.5">
                    <div className="text-muted-foreground">Stop Loss</div>
                    <div className="mt-0.5 font-mono font-medium text-destructive">{c.stopLoss}</div>
                  </div>
                  <div className="rounded-md border border-border bg-secondary/30 p-2.5">
                    <div className="text-muted-foreground">Position Size</div>
                    <div className="mt-0.5 font-mono font-medium text-foreground">{c.positionSize}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Open</Badge>
                    <span className="text-xs text-muted-foreground">{c.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.pnl > 0 ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    <span className={cn('font-mono text-sm font-bold', c.pnl > 0 ? 'text-success' : 'text-destructive')}>
                      {formatPercent(c.pnl)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {closed.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Closed Positions</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {closed.map((c) => (
              <Card key={c.id} className="opacity-70">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                        {c.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground">{c.name}</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{c.symbol}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Closed</Badge>
                      <span className={cn('font-mono text-sm font-bold', c.pnl > 0 ? 'text-success' : 'text-destructive')}>
                        {formatPercent(c.pnl)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{c.thesis}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
