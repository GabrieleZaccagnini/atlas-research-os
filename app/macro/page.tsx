'use client';

import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, StatCard, Badge, Sparkline, SectionGrid } from '@/components/shared';
import { AreaChartMock } from '@/components/shared/charts';
import { mockMacroIndicators } from '@/lib/mock-data';
import { formatPercent, getTrendColor } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function MacroPage() {
  return (
    <div>
      <PageHeader title="Macro" description="Global macro indicators driving crypto markets. Liquidity, rates, and risk assets." />

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Global M2" value="$94.2T" change={0.52} sublabel="Expanding — bullish" icon={<Globe className="h-4 w-4" />} />
        <StatCard label="Fed Funds Rate" value="4.75%" change={-0.25} sublabel="Cutting cycle started" />
        <StatCard label="DXY" value="102.34" change={-0.42} sublabel="Dollar weakening" />
        <StatCard label="10Y Yield" value="4.12%" change={-0.08} sublabel="Yields declining" />
      </SectionGrid>

      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <Card>
          <CardHeader title="Global Liquidity (M2)" description="Global M2 money supply vs BTC price" action={<Badge variant="success">Bullish</Badge>} />
          <CardBody>
            <AreaChartMock data={mockMacroIndicators[5].sparkline} height={200} color="hsl(var(--chart-1))" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Dollar Index (DXY)" description="Inverse correlation with crypto" action={<Badge variant="success">Bullish</Badge>} />
          <CardBody>
            <AreaChartMock data={mockMacroIndicators[0].sparkline} height={200} color="hsl(var(--chart-3))" />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Macro Indicator Dashboard" description="Key global macro metrics" />
        <CardBody className="p-0">
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {mockMacroIndicators.map((ind) => (
              <div key={ind.id} className="bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{ind.label}</span>
                  <Badge variant="outline">{ind.category}</Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold text-foreground">{ind.value}</span>
                  <span className={cn('flex items-center gap-0.5 font-mono text-xs font-medium', getTrendColor(ind.change))}>
                    {ind.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : ind.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                    {formatPercent(ind.change)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{ind.description}</p>
                <div className="mt-3">
                  <Sparkline data={ind.sparkline} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
