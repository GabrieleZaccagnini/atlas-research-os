import type { ResearchProject } from './projects';

export function researchCoverage(p: ResearchProject) {
  const checks = [
    { label: 'Project summary', present: Boolean(p.summary.trim() || p.providerProfile?.description.trim()) },
    { label: 'Useful links', present: p.details.links.some(l => Boolean(l.url)) || Boolean(p.providerProfile?.links.length) },
    { label: 'Thesis', present: Boolean(p.thesis.trim()) },
    { label: 'Risks', present: Boolean(p.risks.trim()) },
    { label: 'Invalidation', present: Boolean(p.invalidation.trim()) },
    { label: 'Team research', present: p.details.team.some(t => Boolean(t.name.trim())) },
    { label: 'Tokenomics research', present: p.details.tokenomics.some(t => Boolean(t.metric.trim() && t.value.trim())) },
  ];
  const records = [...p.details.links.filter(r => r.url), ...p.details.team.filter(r => r.name.trim()), ...p.details.funding.filter(r => r.round.trim()), ...p.details.tokenomics.filter(r => r.metric.trim() && r.value.trim())];
  return { checks, filled: checks.filter(c => c.present).length, total: checks.length,
    toVerify: records.filter(r => r.reviewStatus === 'Unverified' || r.reviewStatus === 'Disputed').length };
}
export function reviewQueue(projects: ResearchProject[], today: string) {
  return projects.filter(p => p.status !== 'Archived').map(project => ({ project, coverage: researchCoverage(project),
    due: Boolean(project.review.nextReviewOn && project.review.nextReviewOn <= today) }))
    .sort((a, b) => Number(b.due) - Number(a.due) || Number(b.project.status === 'Research Queue') - Number(a.project.status === 'Research Queue') || a.coverage.filled - b.coverage.filled || a.project.updatedAt.localeCompare(b.project.updatedAt));
}
export function projectEvents(projects: ResearchProject[]) {
  return projects.filter(p => p.status !== 'Archived').flatMap(project => project.events.map(event => ({ project, event })))
    .sort((a, b) => a.event.date.localeCompare(b.event.date) || a.event.title.localeCompare(b.event.title));
}
export function reviewHistory(projects: ResearchProject[]) {
  return projects.flatMap(project => project.review.entries.map(entry => ({ project, entry })))
    .sort((a, b) => b.entry.recordedAt.localeCompare(a.entry.recordedAt));
}
