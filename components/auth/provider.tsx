'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
interface Auth { client: SupabaseClient | null; session: Session | null; ready: boolean; error: string | null }
const Context = createContext<Auth>({ client: null, session: null, ready: false, error: null });
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Auth>({ client: null, session: null, ready: false, error: null });
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      const client = getSupabase();
      if (!client) { setState({ client, session: null, ready: true, error: null }); return; }
      // INITIAL_SESSION is emitted after redirect-token processing and storage recovery.
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        if (active) setState({ client, session, ready: true, error: null });
      });
      unsubscribe = () => data.subscription.unsubscribe();
      client.auth.getSession().then(({ error }) => {
        if (active && error) setState({ client, session: null, ready: true, error: 'Sign-in could not be restored. Reload and sign in again.' });
      }).catch(() => { if (active) setState({ client, session: null, ready: true, error: 'Sign-in is unavailable. Reload to retry.' }); });
    } catch (error) { setState({ client: null, session: null, ready: true, error: error instanceof Error ? error.message : 'Cloud setup is invalid.' }); }
    return () => { active = false; unsubscribe(); };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useAuth() { return useContext(Context); }
