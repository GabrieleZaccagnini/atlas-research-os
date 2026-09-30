'use client';
import { useState } from 'react';
import type { MarketQuote, ServiceResult } from '@/services/core/types';
import { requestData, DataStamp } from '@/components/dashboard/data';
import { inputClass, buttonClass } from './fields';
export function AssetPicker({ onSelect, disabled = false }: { onSelect: (asset: MarketQuote) => void; disabled?: boolean }) {
  const [query, setQuery] = useState(''); const [result, setResult] = useState<ServiceResult<MarketQuote[]> | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function load() { setBusy(true); setError(''); try { setResult(await requestData('/api/data/assets')); } catch { setError('Asset search could not load. Retry or add a project manually.'); } finally { setBusy(false); } }
  const q = query.trim().toLowerCase();
  const matches = result?.ok ? result.data.filter(a => !q || `${a.name} ${a.symbol} ${a.asset.coinpaprikaId}`.toLowerCase().includes(q)).sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)).slice(0, 8) : [];
  return <div className="space-y-3"><div className="flex flex-wrap items-center gap-3"><h3 className="text-sm font-semibold">Find an asset</h3><button type="button" className={buttonClass} disabled={busy || disabled} onClick={load}>{busy ? 'Loading assets…' : result ? 'Refresh asset list' : 'Load asset search'}</button></div>{result?.ok && <><input className={inputClass} aria-label="Find an asset" placeholder="Search name or ticker; confirm the exact asset" value={query} onChange={e => setQuery(e.target.value)} /><div className="grid gap-2 sm:grid-cols-2">{matches.map(a => <button type="button" disabled={disabled} onClick={() => onSelect(a)} key={a.asset.coinpaprikaId} className="rounded-md border p-3 text-left hover:bg-secondary disabled:opacity-50"><span className="text-sm font-semibold">{a.name} <span className="text-muted-foreground">{a.symbol}</span></span><span className="mt-1 block text-xs text-muted-foreground">{a.asset.coinpaprikaId} · {a.rank ? `rank ${a.rank}` : 'unranked'}</span></button>)}</div>{!matches.length && <p className="text-sm text-muted-foreground">No match in this feed. You can still add the project manually.</p>}</>}{error && <p role="alert" className="text-sm text-warning">{error}</p>}<DataStamp result={result} /><p className="text-xs text-muted-foreground">CoinPaprika discovery covers its returned free-tier assets, not every token. A ticker alone does not establish identity.</p></div>;
}
