'use client';

import { BookOpen, Plus, Search } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, StatCard, SectionGrid } from '@/components/shared';
import { mockJournalEntries } from '@/lib/mock-data';

const typeVariant: Record<string, 'primary' | 'success' | 'warning' | 'outline'> = {
  analysis: 'primary',
  thesis: 'success',
  'trade-log': 'warning',
  observation: 'outline',
};

export default function JournalPage() {
  return (
    <div>
      <PageHeader title="Research Journal" description="Document analysis, trade logs, observations, and investment theses.">
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New Entry
        </button>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Total Entries" value="42" sublabel="This quarter" icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Analyses" value="18" sublabel="Deep-dive reports" />
        <StatCard label="Trade Logs" value="12" sublabel="Position updates" />
        <StatCard label="Theses" value="8" sublabel="Investment frameworks" />
      </SectionGrid>

      <Card>
        <CardHeader
          title="Journal Entries"
          description="Chronological log of research and decisions"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="h-8 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="space-y-px">
            {mockJournalEntries.map((entry) => (
              <div key={entry.id} className="bg-card px-5 py-4 transition-colors hover:bg-secondary/30">
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0">
                    <div className="font-mono text-xs font-medium text-foreground">{entry.date}</div>
                    <div className="mt-1">
                      <Badge variant={typeVariant[entry.type]}>{entry.type}</Badge>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.excerpt}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {entry.tags.map((t) => (
                        <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">{t}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground">· {entry.author}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
