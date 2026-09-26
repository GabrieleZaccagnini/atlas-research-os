'use client';

import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, ArrowUpRight } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, StatCard, Badge, Sparkline, ProgressBar, SectionGrid } from '@/components/shared';
import { AreaChartMock, DonutChartMock } from '@/components/shared/charts';
import { DataTable, type Column } from '@/components/shared/data-table';
import { mockPrices, mockNarratives, mockNews, mockConvictions, mockMarketStatus } from '@/lib/mock-data';
import { formatPrice, formatPercent, formatCurrency, formatNumber, getTrendColor, getTrendBgColor } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NarrativeItem, NewsItem } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Map the market. Find the signal. Build conviction.">
        <Badge variant="success">{mockMarketStatus.label}</Badge>
        <Badge variant="primary">Fear &amp; Greed: {mockMarketStatus.fearGreedIndex}</Badge>
      </PageHeader>

      {/* Top stat row */}
      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard
          label="Total Market Cap"
          value="$2.34T"
          change={2.14}
          sublabel="+$48.2B in 24h"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="24h Volume"
          value="$84.2B"
          change={5.67}
          sublabel="Above 30d average"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="BTC Dominance"
          value="56.4%"
          change={-0.32}
          sublabel="Altcoin season index: 68"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Active Convictions"
          value="5"
          sublabel="Avg conviction: 85.4"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </SectionGrid>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Market overview chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Market Overview"
            description="Top assets by market cap"
            action={
              <div className="flex gap-1.5">
                <Badge variant="outline">24H</Badge>
                <Badge variant="primary">7D</Badge>
                <Badge variant="outline">30D</Badge>
              </div>
            }
          />
          <CardBody>
            <AreaChartMock data={mockPrices[0].sparkline} height={220} />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {mockPrices.map((asset) => (
                <div key={asset.symbol} className="rounded-md border border-border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{asset.symbol}</span>
                    <span className={cn('text-xs font-medium', getTrendColor(asset.change24h))}>
                      {formatPercent(asset.change24h)}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-medium text-foreground">
                    {formatPrice(asset.price)}
                  </div>
                  <div className="mt-2">
                    <Sparkline data={asset.sparkline} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Portfolio allocation */}
        <Card>
          <CardHeader title="Conviction Allocation" description="By sector" />
          <CardBody>
            <DonutChartMock
              segments={[
                { label: 'Infrastructure', value: 35, color: 'hsl(var(--chart-1))' },
                { label: 'AI', value: 25, color: 'hsl(var(--chart-2))' },
                { label: 'DeFi', value: 20, color: 'hsl(var(--chart-3))' },
                { label: 'L1', value: 15, color: 'hsl(var(--chart-4))' },
                { label: 'Cash', value: 5, color: 'hsl(var(--muted-foreground))' },
              ]}
            />
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Deployed</span>
                <span className="font-mono font-medium text-foreground">95%</span>
              </div>
              <ProgressBar value={95} barClassName="bg-success" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cash Reserve</span>
                <span className="font-mono font-medium text-foreground">5%</span>
              </div>
              <ProgressBar value={5} barClassName="bg-muted-foreground" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Second row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Top narratives */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Trending Narratives"
            description="Highest momentum narratives in the last 24h"
            action={
              <Link href="/narratives" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="space-y-1">
              {mockNarratives.slice(0, 5).map((n) => (
                <Link
                  key={n.id}
                  href="/narratives"
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{n.title}</span>
                      <Badge variant="outline">{n.category}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{n.description}</p>
                  </div>
                  <div className="hidden sm:block w-24">
                    <ProgressBar value={n.momentum} barClassName={n.momentum > 80 ? 'bg-success' : 'bg-primary'} />
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold text-foreground">{n.momentum}</div>
                    <div className={cn('text-xs font-medium', getTrendColor(n.changeMentions))}>
                      {formatPercent(n.changeMentions)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Latest news */}
        <Card>
          <CardHeader
            title="Latest News"
            description="High-impact market events"
            action={
              <Link href="/news" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="space-y-1">
              {mockNews.slice(0, 5).map((news) => (
                <div key={news.id} className="px-5 py-3 transition-colors hover:bg-secondary/30">
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        news.sentiment === 'positive' ? 'bg-success' : news.sentiment === 'negative' ? 'bg-destructive' : 'bg-muted-foreground'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug">{news.headline}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{news.source}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{news.time}</span>
                        {news.impact === 'high' && <Badge variant="warning">High Impact</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Third row - convictions snapshot */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Active Convictions"
            description="Open positions and performance"
            action={
              <Link href="/convictions" className="flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="space-y-1">
              {mockConvictions.filter((c) => c.status === 'open').slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/30">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {c.symbol.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <Badge variant="outline">{c.category}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.thesis}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold text-foreground">{c.convictionScore}</div>
                    <div className={cn('text-xs font-medium', c.pnl > 0 ? 'text-success' : 'text-destructive')}>
                      {formatPercent(c.pnl)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Conviction Score Distribution" description="Portfolio risk map" />
          <CardBody>
            <div className="space-y-3">
              {[
                { label: 'High Conviction (>85)', count: 3, pct: 60, color: 'bg-success' },
                { label: 'Medium Conviction (70-85)', count: 2, pct: 30, color: 'bg-primary' },
                { label: 'Low Conviction (<70)', count: 1, pct: 10, color: 'bg-warning' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono font-medium text-foreground">{row.count} positions</span>
                  </div>
                  <ProgressBar value={row.pct} barClassName={row.color} />
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-md border border-border bg-secondary/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Avg PnL</div>
                <div className="mt-1 font-mono text-lg font-bold text-success">+18.9%</div>
              </div>
              <div className="rounded-md border border-border bg-secondary/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="mt-1 font-mono text-lg font-bold text-foreground">83%</div>
              </div>
              <div className="rounded-md border border-border bg-secondary/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Sharpe</div>
                <div className="mt-1 font-mono text-lg font-bold text-foreground">2.1</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
