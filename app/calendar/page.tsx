'use client';

import { CalendarDays, Plus } from 'lucide-react';
import { PageHeader, Card, CardHeader, CardBody, Badge, StatCard, SectionGrid } from '@/components/shared';
import { mockCalendarEvents } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const typeVariant: Record<string, 'primary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  mainnet: 'success',
  'token-unlock': 'warning',
  governance: 'primary',
  earnings: 'outline',
  upgrade: 'primary',
  listing: 'destructive',
};

const importanceVariant: Record<string, 'destructive' | 'warning' | 'outline'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'outline',
};

export default function CalendarPage() {
  const grouped = mockCalendarEvents.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {} as Record<string, typeof mockCalendarEvents>);

  return (
    <div>
      <PageHeader title="Calendar" description="Upcoming mainnet launches, token unlocks, governance votes, and key dates.">
        <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Add Event
        </button>
      </PageHeader>

      <SectionGrid className="grid-cols-2 md:grid-cols-4 mb-6">
        <StatCard label="Upcoming Events" value={String(mockCalendarEvents.length)} sublabel="Next 30 days" icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="High Importance" value={String(mockCalendarEvents.filter((e) => e.importance === 'high').length)} sublabel="Requires attention" />
        <StatCard label="Token Unlocks" value={String(mockCalendarEvents.filter((e) => e.type === 'token-unlock').length)} sublabel="Supply events" />
        <StatCard label="Mainnet Launches" value={String(mockCalendarEvents.filter((e) => e.type === 'mainnet').length)} sublabel="New networks" />
      </SectionGrid>

      <Card>
        <CardHeader title="Event Timeline" description="Chronological view of upcoming events" />
        <CardBody className="p-0">
          <div className="space-y-px">
            {Object.entries(grouped).map(([date, events]) => (
              <div key={date}>
                <div className="bg-secondary/40 px-5 py-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{date}</span>
                </div>
                {events.map((e) => (
                  <div key={e.id} className="bg-card px-5 py-4 transition-colors hover:bg-secondary/30">
                    <div className="flex items-center gap-4">
                      <div className="flex w-20 shrink-0 flex-col items-center">
                        <span className="font-mono text-sm font-bold text-foreground">{e.time.split(' ')[0]}</span>
                        <span className="text-[10px] text-muted-foreground">{e.time.includes('UTC') ? 'UTC' : ''}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{e.title}</span>
                          <Badge variant={typeVariant[e.type]}>{e.type.replace('-', ' ')}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{e.project}</div>
                      </div>
                      <Badge variant={importanceVariant[e.importance]}>{e.importance}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
