'use client';

import { Repeat, TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, StatCard, Badge, ProgressBar, SectionGrid } from '@/components/shared';
import { AreaChartMock } from '@/components/shared/charts';
import { mockMarketCycle } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const cyclePhases = [
  { name: 'Accumulation', position: 0 },
  { name: 'Early Bull', position: 25 },
  { name: 'Mid-Bull', position: 50 },
  { name: 'Late Bull', position: 75 },
  { name: 'Distribution', position: 90 },
  { name: 'Bear', position: 100 },
];

export default function MarketCyclePage() {
  return (
    <div>
      <PageHeader title="Market Cycle" description="Identify where we are in the Bitcoin cycle using on-chain indicators." />

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Current Phase" value={mockMarketCycle.phase} sublabel="Based on 6 on-chain metrics" icon={<Repeat className="h-4 w-4" />} />
        <StatCard label="Cycle Position" value={`${mockMarketCycle.position}%`} sublabel="0% = bottom, 100% = top" />
        <StatCard label="Days Since Start" value="620" sublabel={`Started ${mockMarketCycle.startDate}`} />
        <StatCard label="Est. Days to Top" value="180-240" sublabel="Based on historical cycles" />
      </SectionGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Cycle Position Indicator" description="Composite of MVRV, NUPL, RHODL, Reserve Risk, Puell Multiple, and Altcoin Season Index" />
          <CardBody>
            <div className="relative mb-8">
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-success via-warning to-destructive" />
              <div
                className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-background bg-primary shadow-lg glow-primary"
                style={{ left: `${mockMarketCycle.position}%` }}
              />
              <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
                {cyclePhases.map((p) => (
                  <span key={p.name} className={cn(mockMarketCycle.phase === p.name && 'font-bold text-primary')}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <AreaChartMock data={[30, 35, 42, 38, 50, 58, 55, 62, 68, 65, 72, 78, 75, 82, 88, 85, 92, 95, 90, 55]} height={180} color="hsl(var(--chart-1))" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cycle Description" />
          <CardBody>
            <p className="text-sm leading-relaxed text-muted-foreground">{mockMarketCycle.description}</p>
            <div className="mt-5 space-y-3">
              {mockMarketCycle.indicators.map((ind) => (
                <div key={ind.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{ind.label}</div>
                    <div className="font-mono text-sm text-muted-foreground">{ind.value}</div>
                  </div>
                  <Badge variant={ind.status === 'bullish' ? 'success' : ind.status === 'bearish' ? 'destructive' : 'outline'}>
                    {ind.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
