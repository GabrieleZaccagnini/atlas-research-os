import { z } from 'zod';
export const projectStatuses = ['Research Queue', 'Watching', 'Buy List', 'Owned', 'Taking Profit', 'Archived'] as const;
export const convictionLevels = ['Unrated', 'Low', 'Medium', 'High'] as const;
export const narrativeOptions = ['AI', 'DePIN', 'Machine Economy', 'Data', 'RWA', 'Privacy', 'Quantum Resistant', 'Chain Abstraction', 'Bitcoin', 'PayFi', 'Stablecoins', 'DeSci', 'Infrastructure'] as const;
const text = z.string().max(20000);
const id = z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/);
export const projectSchema = z.object({
  id, name: z.string().trim().min(1).max(100), symbol: z.string().trim().max(20),
  narratives: z.array(z.string().trim().min(1).max(60)).max(30),
  status: z.enum(projectStatuses), conviction: z.enum(convictionLevels),
  coingeckoId: z.union([id, z.literal('')]),
  chainId: z.string().max(100).regex(/^[a-z0-9_-]*$/), address: z.string().max(128).regex(/^[a-zA-Z0-9:_-]*$/),
  summary: text, thesis: text, risks: text, catalysts: text, invalidation: text,
  fundamentals: text, capital: text, notes: text,
  updatedAt: z.string().datetime(),
});
export type ResearchProject = z.infer<typeof projectSchema>;
export const projectFileSchema = z.object({ version: z.literal(1), projects: z.array(projectSchema).max(2000) }).refine(file => new Set(file.projects.map(p => p.id)).size === file.projects.length, 'Duplicate project IDs');
export const projectStorageKey = 'atlas.research.projects.v1';
export function newProject(name: string, symbol: string): ResearchProject {
  return { id: crypto.randomUUID(), name: name.trim(), symbol: symbol.trim().toUpperCase(), narratives: [], status: 'Research Queue', conviction: 'Unrated', coingeckoId: '', chainId: '', address: '', summary: '', thesis: '', risks: '', catalysts: '', invalidation: '', fundamentals: '', capital: '', notes: '', updatedAt: new Date().toISOString() };
}
export function filterProjects(projects: ResearchProject[], query: string, status: string, narrative: string) {
  const q = query.trim().toLowerCase();
  return projects.filter(p => (!q || [p.name, p.symbol, ...p.narratives].join(' ').toLowerCase().includes(q)) && (status === 'all' || p.status === status) && (narrative === 'all' || p.narratives.includes(narrative)));
}
