import { Check, Circle } from 'lucide-react';
import { researchCoverage } from '@/lib/research-desk';
import type { ResearchProject } from '@/lib/projects';
import { Card } from '@/components/shared';
export function ResearchCoverage({ project }: { project: ResearchProject }) {
  const coverage = researchCoverage(project);
  return <Card className="p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-semibold">Research coverage</h2><span className="text-sm text-muted-foreground">{coverage.filled} of {coverage.total} areas started</span></div><div className="mt-4 flex flex-wrap gap-2">{coverage.checks.map(c => <span key={c.label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${c.present ? 'border-primary/30 bg-primary/10' : 'text-muted-foreground'}`}>{c.present ? <Check size={13} /> : <Circle size={13} />}{c.label}</span>)}</div><p className="mt-3 text-xs text-muted-foreground">Tracks recorded information, not quality or investment potential. {coverage.toVerify} manual record{coverage.toVerify === 1 ? '' : 's'} need verification or dispute resolution.</p></Card>;
}
