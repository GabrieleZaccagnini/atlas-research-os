import { z } from 'zod';

// Manual research is separate from provider snapshots and personal conviction.
export const reviewStatuses = ['Unverified', 'Verified', 'Disputed', 'Not applicable'] as const;
export const webUrl = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}, 'Use a full http:// or https:// URL without credentials');
const short = z.string().trim().max(500);
const date = z.string().refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value), 'Use a valid date');
const decimal = z.string().trim().max(80).regex(/^(?:\d+(?:\.\d+)?)?$/, 'Use a non-negative number without commas, or leave blank');
const evidence = {
  sourceUrl: webUrl.default(''),
  reviewedOn: date.default(''),
  reviewStatus: z.enum(reviewStatuses).default('Unverified'),
  notes: z.string().max(5000).default(''),
};
const record = { id: z.string().uuid(), ...evidence };
export const linkSchema = z.object({ ...record, label: short, url: webUrl });
export const teamSchema = z.object({ ...record, name: short, role: short, profileUrl: webUrl });
export const fundingSchema = z.object({ ...record, round: short, announcedOn: date, amountRaised: decimal, currency: short, tokenPrice: decimal, investors: z.string().max(5000) });
export const tokenomicsSchema = z.object({ ...record, metric: short, value: z.string().max(5000), unit: short, asOf: date });
export const projectDetailsSchema = z.object({
  links: z.array(linkSchema).max(50).default([]),
  team: z.array(teamSchema).max(100).default([]),
  funding: z.array(fundingSchema).max(100).default([]),
  tokenomics: z.array(tokenomicsSchema).max(100).default([]),
}).default({}).superRefine((details, ctx) => {
  for (const key of ['links', 'team', 'funding', 'tokenomics'] as const) {
    const rows = details[key];
    if (new Set(rows.map(row => row.id)).size !== rows.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'Duplicate research record IDs' });
    rows.forEach((row, index) => {
      if (row.reviewStatus === 'Verified' && (!row.sourceUrl || !row.reviewedOn)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key, index, 'reviewStatus'], message: 'Verified research needs a source URL and review date' });
    });
  }
});
export type ProjectDetails = z.infer<typeof projectDetailsSchema>;
export type DetailSection = keyof ProjectDetails;
export function newDetail<K extends DetailSection>(section: K): ProjectDetails[K][number] {
  const shared = { id: crypto.randomUUID(), sourceUrl: '', reviewedOn: '', reviewStatus: 'Unverified' as const, notes: '' };
  const records = {
    links: { ...shared, label: '', url: '' },
    team: { ...shared, name: '', role: '', profileUrl: '' },
    funding: { ...shared, round: '', announcedOn: '', amountRaised: '', currency: 'USD', tokenPrice: '', investors: '' },
    tokenomics: { ...shared, metric: '', value: '', unit: '', asOf: '' },
  };
  return records[section];
}
