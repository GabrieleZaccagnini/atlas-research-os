'use client';

import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, ProgressBar, SectionGrid } from '@/components/shared';
import { mockNarratives } from '@/lib/mock-data';
import { formatPercent, formatNumber, getTrendColor } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function NarrativesPage() {
  return (
    <div>
      <PageHeader title="Narrative Intelligence" description="Track emerging narratives, momentum, and social signals across the crypto market.">
        <Badge variant="primary"><Brain className="mr-1 h-3 w-3" /> AI-Powered</Badge>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Narratives</div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">{mockNarratives.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Mentions 24h</div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">{formatNumber(mockNarratives.reduce((s, n) => s + n.mentions24h, 0))}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Momentum</div>
          <div className="mt-2 font-mono text-2xl font-bold text-foreground">{Math.round(mockNarratives.reduce((s, n) => s + n.momentum, 0) / mockNarratives.length)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Trending Up</div>
          <div className="mt-2 font-mono text-2xl font-bold text-success">{mockNarratives.filter((n) => n.trend === 'up').length}</div>
        </Card>
      </SectionGrid>

      <Card>
        <CardHeader title="Narrative Feed" description="All tracked narratives ranked by momentum" />
        <CardBody className="p-0">
          <div className="space-y-px">
            {mockNarratives.map((n) => (
              <div key={n.id} className="bg-card px-5 py-4 transition-colors hover:bg-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{n.title}</span>
                      <Badge variant="outline">{n.category}</Badge>
                      <Badge variant="primary">{n.age}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {n.topProjects.map((p) => (
                        <span key={p} className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">Momentum</div>
                    <div className="font-mono text-lg font-bold text-foreground">{n.momentum}</div>
                    <div className={cn('flex items-center justify-end gap-0.5 text-xs font-medium', getTrendColor(n.changeMentions))}>
                      {n.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : n.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {formatPercent(n.changeMentions)}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{formatNumber(n.mentions24h)} mentions</div>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={n.momentum} barClassName={n.momentum > 80 ? 'bg-success' : n.momentum > 60 ? 'bg-primary' : 'bg-warning'} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
