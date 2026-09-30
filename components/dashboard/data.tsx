'use client';
import { useEffect, useState } from 'react';
import type { ServiceResult } from '@/services/core/types';
export async function requestData<T>(url: string): Promise<ServiceResult<T>> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  if (typeof body?.ok !== 'boolean') throw new Error('Unexpected response');
  return body;
}
export function DataStamp<T>({ result, observedAt }: { result: ServiceResult<T> | null; observedAt?: string | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  if (!result) return null;
  if (!result.ok) return <p role="status" className="text-xs text-warning">Data unavailable · {result.error.message}{result.error.retryAt ? ` · Retry after ${new Date(result.error.retryAt).toLocaleTimeString()}` : ''}</p>;
  const expired = now >= Date.parse(result.meta.expiresAt);
  const oldObservation = observedAt && now - Date.parse(observedAt) > 20 * 60000;
  return <div className="space-y-1 text-xs text-muted-foreground"><p>{result.meta.provider} · retrieved {new Date(result.meta.fetchedAt).toLocaleString()} · {result.meta.cache === 'stale' ? 'Stale fallback' : expired ? 'Refresh due' : 'Cached snapshot'}</p>{observedAt && <p className={oldObservation ? 'text-warning' : ''}>Provider observation: {new Date(observedAt).toLocaleString()}{oldObservation ? ' · Older than 20 minutes' : ''}</p>}{result.ok && result.warning && <p className="text-warning">{result.warning.message}</p>}</div>;
}
