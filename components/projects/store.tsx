'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { projectFileSchema, projectSchema, projectStorageKey, type ResearchProject } from '@/lib/projects';
import { loadCloudProjects, saveCloudProject, importCloudProjects, type CloudRow } from '@/lib/cloud-projects';
import { useAuth } from '@/components/auth/provider';
interface Store {
  projects: ResearchProject[]; ready: boolean; busy: boolean; error: string | null; mode: 'browser' | 'cloud';
  save: (project: ResearchProject, expectedUpdatedAt?: string) => Promise<boolean>;
  importFile: (raw: string) => Promise<void>; exportFile: () => void;
  migrateBrowser: () => Promise<number>; exportBrowser: () => void; reload: () => Promise<void>;
}
const Context = createContext<Store | null>(null);
function download(content: string, label: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = `atlas-${label}-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ProjectsProvider({ children, browserOnly = false }: { children: React.ReactNode; browserOnly?: boolean }) {
  const auth = useAuth(); const client = browserOnly ? null : auth.client; const session = browserOnly ? null : auth.session; const owner = session?.user.id;
  const mode = client && owner ? 'cloud' : 'browser';
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const revisions = useRef(new Map<string, string>()); const lock = useRef(false); const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  function accept(rows: CloudRow[]) {
    if (!active.current) return;
    revisions.current = new Map(rows.map(row => [row.document.id, row.revision]));
    setProjects(rows.map(row => row.document));
  }
  async function reload() {
    setError(null); setReady(false);
    if (client && !owner) { setProjects([]); setReady(true); return; }
    try {
      if (client && owner) accept(await loadCloudProjects(client, owner));
      else { const raw = localStorage.getItem(projectStorageKey); setProjects(raw ? projectFileSchema.parse(JSON.parse(raw)).projects : []); }
      if (active.current) setReady(true);
    } catch { if (active.current) setError('Research could not be loaded. Your saved data has not been overwritten. Check your connection or export the browser backup before retrying.'); }
  }
  useEffect(() => {
    void reload();
    if (mode === 'cloud') return;
    const onStorage = (event: StorageEvent) => { if (event.key === projectStorageKey) void reload(); };
    window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage);
    // This provider is remounted for each account; token refreshes must not discard drafts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function save(project: ResearchProject, expectedUpdatedAt?: string) {
    if (!ready || lock.current || (client && !owner)) return false;
    lock.current = true; setBusy(true); setError(null);
    try {
      const parsed = projectSchema.parse(project);
      if (parsed.cmcId && projects.some(other => other.id !== parsed.id && other.cmcId === parsed.cmcId)) throw new Error('This CMC asset is already connected to another project.');
      if (client && owner) {
        const current = projects.find(p => p.id === parsed.id);
        if (current?.updatedAt !== expectedUpdatedAt) throw new Error('This project changed. Copy your draft and reload before saving.');
        const row = await saveCloudProject(client, parsed, revisions.current.get(parsed.id) ?? null);
        if (!active.current) return false;
        revisions.current.set(parsed.id, row.revision);
        setProjects(current => current.some(p => p.id === parsed.id) ? current.map(p => p.id === parsed.id ? row.document : p) : [row.document, ...current]);
      } else {
        const raw = localStorage.getItem(projectStorageKey);
        const current = raw ? projectFileSchema.parse(JSON.parse(raw)).projects : [];
        const existing = current.find(p => p.id === parsed.id);
        if (parsed.cmcId && current.some(other => other.id !== parsed.id && other.cmcId === parsed.cmcId)) throw new Error('This CMC asset is already connected to another project.');
        if (existing?.updatedAt !== expectedUpdatedAt) throw new Error('This project changed in another tab. Copy your draft and reload before saving.');
        const next = existing ? current.map(p => p.id === parsed.id ? parsed : p) : [parsed, ...current];
        const file = projectFileSchema.parse({ version: 4, projects: next });
        localStorage.setItem(projectStorageKey, JSON.stringify(file)); setProjects(file.projects);
      }
      return true;
    } catch (e) { if (active.current) setError(e instanceof Error ? e.message : 'Save failed. Your draft has been kept.'); return false; }
    finally { lock.current = false; if (active.current) setBusy(false); }
  }
  function exportBrowser() {
    try { download(localStorage.getItem(projectStorageKey) ?? JSON.stringify({ version: 4, projects: [] }), 'browser-backup'); }
    catch { setError('Browser storage could not be read for export.'); }
  }
  function exportFile() {
    if (mode === 'browser') exportBrowser();
    else download(JSON.stringify({ version: 4, projects }, null, 2), 'cloud-research');
  }
  async function transfer(raw: string) {
    if (!ready || lock.current || (client && !owner)) throw new Error('Research is not ready. Retry after loading.');
    lock.current = true; setBusy(true); setError(null);
    try {
      const incoming = projectFileSchema.parse(JSON.parse(raw));
      let added = 0;
      if (client && owner) {
        added = await importCloudProjects(client, JSON.stringify(incoming));
        accept(await loadCloudProjects(client, owner));
      } else {
        const saved = localStorage.getItem(projectStorageKey);
        const current = saved ? projectFileSchema.parse(JSON.parse(saved)).projects : [];
        const ids = new Set(current.map(p => p.id)); const additions = incoming.projects.filter(p => !ids.has(p.id));
        const file = projectFileSchema.parse({ version: 4, projects: [...current, ...additions] });
        localStorage.setItem(projectStorageKey, JSON.stringify(file)); setProjects(file.projects); added = additions.length;
      }
      return added;
    } catch { throw new Error('Transfer did not complete or could not be confirmed. Existing projects were not overwritten. Retrying is safe.'); }
    finally { lock.current = false; if (active.current) setBusy(false); }
  }
  async function importFile(raw: string) { await transfer(raw); }
  async function migrateBrowser() {
    if (mode !== 'cloud') throw new Error('Sign in to cloud storage first.');
    const raw = localStorage.getItem(projectStorageKey);
    if (!raw) return 0;
    return transfer(raw);
  }
  return <Context.Provider value={{ projects, ready, busy, error, mode, save, importFile, exportFile, migrateBrowser, exportBrowser, reload }}>{children}</Context.Provider>;
}
export function useProjects() { const context = useContext(Context); if (!context) throw Error('ProjectsProvider required'); return context; }
