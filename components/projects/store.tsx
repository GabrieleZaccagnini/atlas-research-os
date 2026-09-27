'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { projectFileSchema, projectSchema, projectStorageKey, type ResearchProject } from '@/lib/projects';
interface Store { projects: ResearchProject[]; ready: boolean; error: string | null; save: (project: ResearchProject) => boolean; importFile: (raw: string) => void; exportFile: () => void }
const Context = createContext<Store | null>(null);
export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(projectStorageKey); if (raw) setProjects(projectFileSchema.parse(JSON.parse(raw)).projects); }
    catch { setError('Saved research could not be read. Your stored data has not been overwritten. Export it before repairing browser storage.'); }
    finally { setReady(true); }
  }, []);
  const save = useCallback((project: ResearchProject) => {
    try {
      if (!ready || error) return false;
      // Re-read on every save so another tab's unrelated edits are preserved.
      const raw = localStorage.getItem(projectStorageKey);
      const current = raw ? projectFileSchema.parse(JSON.parse(raw)).projects : [];
      const parsed = projectSchema.parse(project);
      const next = current.some(p => p.id === parsed.id) ? current.map(p => p.id === parsed.id ? parsed : p) : [parsed, ...current];
      const file = projectFileSchema.parse({ version: 1, projects: next });
      localStorage.setItem(projectStorageKey, JSON.stringify(file));
      setProjects(file.projects); return true;
    } catch { setError('Could not save research. Browser storage may be unavailable or full. Export a backup before continuing.'); return false; }
  }, [ready, error]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== projectStorageKey) return;
      try { setProjects(event.newValue ? projectFileSchema.parse(JSON.parse(event.newValue)).projects : []); }
      catch { setError('Research was changed in another tab but could not be read. Reload after exporting a backup.'); }
    };
    window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage);
  }, []);
  function exportFile() {
    let content = JSON.stringify({ version: 1, projects }, null, 2);
    // Preserve unreadable data too, rather than exporting an empty replacement.
    try { content = localStorage.getItem(projectStorageKey) ?? content; } catch { /* export in-memory records */ }
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `atlas-research-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  }
  function importFile(raw: string) {
    const incoming = projectFileSchema.parse(JSON.parse(raw));
    const saved = localStorage.getItem(projectStorageKey);
    const current = saved ? projectFileSchema.parse(JSON.parse(saved)).projects : [];
    // Import only new IDs; never silently overwrite existing notes.
    const ids = new Set(current.map(p => p.id));
    const file = projectFileSchema.parse({ version: 1, projects: [...current, ...incoming.projects.filter(p => !ids.has(p.id))] });
    localStorage.setItem(projectStorageKey, JSON.stringify(file)); setProjects(file.projects); setError(null);
  }
  return <Context.Provider value={{ projects, ready, error, save, exportFile, importFile }}>{children}</Context.Provider>;
}
export function useProjects() { const context = useContext(Context); if (!context) throw Error('ProjectsProvider required'); return context; }
