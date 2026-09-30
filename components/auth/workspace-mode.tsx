'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const Context = createContext({ browserMode: false, useBrowser: () => {} });
export function WorkspaceModeProvider({ children }: { children: React.ReactNode }) {
  const [browserMode, setBrowserMode] = useState(false);
  useEffect(() => { try { setBrowserMode(localStorage.getItem('atlas.workspace.browser-mode') === 'true'); } catch { /* An explicit choice still works for this session. */ } }, []);
  function useBrowser() { try { localStorage.setItem('atlas.workspace.browser-mode', 'true'); } catch { /* The project store reports any storage failure. */ } setBrowserMode(true); }
  return <Context.Provider value={{ browserMode, useBrowser }}>{children}</Context.Provider>;
}
export function useWorkspaceMode() { return useContext(Context); }
