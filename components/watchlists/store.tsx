'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { emptyWatchlists, parseWatchlists, updateWatchlists, watchlistStorageKey, type WatchlistFile } from '@/lib/watchlists';
interface Store { file: WatchlistFile; ready: boolean; error: string; commit: (change: (f: WatchlistFile) => WatchlistFile) => boolean; reload: () => void; exportFile: () => void }
const Context = createContext<Store | null>(null);
export function WatchlistsProvider({ scope, children }: { scope: string; children: React.ReactNode }) {
  const key = watchlistStorageKey(scope); const [file, setFile] = useState(emptyWatchlists); const [ready, setReady] = useState(false); const [error, setError] = useState('');
  function reload() {
    setReady(false);
    try { setFile(parseWatchlists(localStorage.getItem(key))); setReady(true); setError(''); }
    catch { setError('Watchlists could not be loaded. Saved data has not been overwritten. Export a backup before retrying.'); }
  }
  useEffect(() => { reload(); const sync = (e: StorageEvent) => { if (e.key === key || e.key === null) reload(); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
    // Each account/browser workspace receives a freshly mounted provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  function commit(change: (f: WatchlistFile) => WatchlistFile) {
    if (!ready) return false;
    try { const next = updateWatchlists(localStorage.getItem(key), file.revision, change); localStorage.setItem(key, JSON.stringify(next)); setFile(next); setError(''); return true; }
    catch (e) { setError(e instanceof Error && !('issues' in e) ? e.message : 'Could not save. Use a unique list name and stay within 50 lists / 1,000 assets per list. Your draft has been kept.'); return false; }
  }
  function exportFile() {
    try { const raw = localStorage.getItem(key) ?? JSON.stringify(emptyWatchlists()); const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `atlas-watchlists-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch { setError('Browser storage could not be read for backup.'); }
  }
  return <Context.Provider value={{ file, ready, error, commit, reload, exportFile }}>{children}</Context.Provider>;
}
export function useWatchlists() { const store = useContext(Context); if (!store) throw Error('WatchlistsProvider required'); return store; }
