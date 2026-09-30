'use client';
import { useEffect, useState } from 'react';
import type { ServiceResult } from '@/services/core/types';
export interface Feed<T> { result: ServiceResult<T> | null; data: T | null; loading: boolean; error: string | null }
export function useFeed<T>(url: string, revision = 0, delay = 0, enabled = true): Feed<T> {
  const [result, setResult] = useState<ServiceResult<T> | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) { setResult(null); setLoading(false); setError(null); return; }
    let active = true; let running = false; const controller = new AbortController();
    async function load() {
      if (running || !active || document.hidden) return;
      running = true; setLoading(true);
      try {
        let body: ServiceResult<T> | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const timeout = new AbortController(); const abort = () => timeout.abort();
          controller.signal.addEventListener('abort', abort);
          const timer = setTimeout(abort, 18000);
          try { const response = await fetch(url, { signal: timeout.signal }); body = await response.json(); }
          finally { clearTimeout(timer); controller.signal.removeEventListener('abort', abort); }
          if (body?.ok === false && body.error.code === 'rate_limited' && attempt === 0) {
            const wait = body.error.retryAt ? Date.parse(body.error.retryAt) - Date.now() : 1000;
            if (wait > 5000) break;
            await new Promise(resolve => setTimeout(resolve, Math.max(1000, wait + 100)));
            if (!active) return;
          } else break;
        }
        if (typeof body?.ok !== 'boolean') throw new Error('Unavailable');
        if (active) { setResult(body); setError(null); }
      } catch { if (active) setError('Could not refresh. Check your connection and retry.'); }
      finally { running = false; if (active) setLoading(false); }
    }
    let start = setTimeout(() => void load(), delay);
    const onVisible = () => { if (!document.hidden) { clearTimeout(start); start = setTimeout(() => void load(), delay); } };
    const interval = setInterval(() => { clearTimeout(start); start = setTimeout(() => void load(), delay); }, 300000);
    document.addEventListener('visibilitychange', onVisible);
    return () => { active = false; controller.abort(); clearTimeout(start); clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [url, revision, delay, enabled]);
  return { result, data: result?.ok ? result.data : null, loading, error };
}
