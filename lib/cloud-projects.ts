import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { projectFileSchema, projectSchema, type ResearchProject } from './projects';
export const cloudRowSchema = z.object({ document: projectSchema, revision: z.string().uuid() });
export type CloudRow = z.infer<typeof cloudRowSchema>;
export async function loadCloudProjects(client: SupabaseClient, owner: string): Promise<CloudRow[]> {
  const rows: CloudRow[] = [];
  for (let offset = 0; offset <= 2000; offset += 500) {
    const { data, error } = await client.from('research_projects').select('document,revision').eq('owner_id', owner).order('project_id').range(offset, offset + 499);
    if (error) throw new Error('Cloud research could not be loaded. Check the connection and database setup, then retry.');
    rows.push(...z.array(cloudRowSchema).parse(data));
    if (rows.length > 2000) throw new Error('Cloud project limit exceeded.');
    if ((data?.length ?? 0) < 500) break;
  }
  projectFileSchema.parse({ version: 4, projects: rows.map(row => row.document) });
  return rows;
}
export async function saveCloudProject(client: SupabaseClient, project: ResearchProject, revision: string | null) {
  const { data, error } = await client.rpc('save_research', { p_document: projectSchema.parse(project), p_revision: revision });
  if (error) {
    if (error.code === '40001' || error.code === '23505') throw new Error('This project changed elsewhere. Copy your unsaved notes, then reload before saving.');
    throw new Error('Cloud save failed. Your draft is still here. Check your connection and try again.');
  }
  return z.array(cloudRowSchema).length(1).parse(data)[0];
}
export async function importCloudProjects(client: SupabaseClient, raw: string) {
  const file = projectFileSchema.parse(JSON.parse(raw));
  const { data, error } = await client.rpc('import_research', { p_documents: file.projects });
  if (error) throw new Error('Transfer failed. Your browser backup is unchanged; retry when the connection is available.');
  return z.number().int().nonnegative().parse(data);
}
