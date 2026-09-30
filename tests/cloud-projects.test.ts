import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { newProject } from '../lib/projects';
import { loadCloudProjects, saveCloudProject, importCloudProjects } from '../lib/cloud-projects';
const revision = '11111111-1111-4111-8111-111111111111';
test('cloud reads page beyond provider row limits and scope reads to the account', async () => {
  const scopes: string[] = []; const ranges: number[] = [];
  const rows = Array.from({ length: 501 }, (_, n) => ({ document: { ...newProject(`P${n}`, ''), id: `p-${n}` }, revision }));
  const client = { from: () => ({ select: () => ({ eq: (_key: string, owner: string) => { scopes.push(owner); return { order: () => ({ range: async (start: number, end: number) => { ranges.push(start); return { data: rows.slice(start, end + 1), error: null }; } }) }; } }) }) } as unknown as SupabaseClient;
  assert.equal((await loadCloudProjects(client, 'owner-a')).length, 501);
  assert.deepEqual(scopes, ['owner-a', 'owner-a']); assert.deepEqual(ranges, [0, 500]);
});
test('cloud save sends expected revision and reports conflicts without a successful save', async () => {
  const project = newProject('Example', 'EX');
  let args: unknown;
  const client = { rpc: async (_name: string, input: unknown) => { args = input; return { data: null, error: { code: '40001' } }; } } as unknown as SupabaseClient;
  await assert.rejects(saveCloudProject(client, project, revision), /changed elsewhere/);
  assert.deepEqual(args, { p_document: project, p_revision: revision });
});
test('cloud import validates legacy backup before a single atomic import request', async () => {
  const { details, ...legacy } = newProject('Legacy', 'LEG'); let calls = 0;
  const client = { rpc: async (name: string, args: { p_documents: unknown[] }) => { calls++; assert.equal(name, 'import_research'); assert.equal(args.p_documents.length, 1); return { data: 1, error: null }; } } as unknown as SupabaseClient;
  assert.equal(await importCloudProjects(client, JSON.stringify({ version: 1, projects: [legacy] })), 1);
  await assert.rejects(importCloudProjects(client, JSON.stringify({ version: 99, projects: [legacy] })));
  assert.equal(calls, 1);
});
test('invalid cloud documents and failed responses never become saved projects', async () => {
  const client = { rpc: async () => ({ data: [{ document: {}, revision }], error: null }) } as unknown as SupabaseClient;
  await assert.rejects(saveCloudProject(client, newProject('Example', 'EX'), null));
});
