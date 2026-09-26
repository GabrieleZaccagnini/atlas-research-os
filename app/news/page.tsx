'use client';

import { Newspaper, Filter } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, StatCard, SectionGrid } from '@/components/shared';
import { mockNews } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const sentimentConfig: Record<string, { color: string; dot: string }> = {
  positive: { color: 'text-success', dot: 'bg-success' },
  negative: { color: 'text-destructive', dot: 'bg-destructive' },
  neutral: { color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
};

const impactVariant: Record<string, 'destructive' | 'warning' | 'outline'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'outline',
};

export default function NewsPage() {
  return (
    <div>
      <PageHeader title="News" description="Curated crypto news with sentiment analysis and impact scoring.">
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80">
          <Filter className="h-3.5 w-3.5" /> Filter by Category
        </button>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Stories Today" value="24" sublabel="8 high impact" icon={<Newspaper className="h-4 w-4" />} />
        <StatCard label="Positive Sentiment" value="62%" sublabel="Risk-on tone" />
        <StatCard label="Negative Sentiment" value="15%" sublabel="Low fear signals" />
        <StatCard label="Sources" value="12" sublabel="Curated feeds" />
      </SectionGrid>

      <Card>
        <CardHeader title="News Feed" description="Latest market-moving headlines" />
        <CardBody className="p-0">
          <div className="space-y-px">
            {mockNews.map((news) => {
              const sc = sentimentConfig[news.sentiment];
              return (
                <div key={news.id} className="bg-card px-5 py-4 transition-colors hover:bg-secondary/30">
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', sc.dot)} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground leading-snug">{news.headline}</h3>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{news.source}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{news.time}</span>
                        <Badge variant="outline">{news.category}</Badge>
                        {news.impact === 'high' && <Badge variant={impactVariant[news.impact]}>High Impact</Badge>}
                        <span className={cn('text-xs font-medium', sc.color)}>{news.sentiment}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
