'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/shared';
import type { ResearchProject } from '@/lib/projects';
import type { ProviderProfile } from '@/lib/provider-profile';
import type { ServiceResult } from '@/services/core/types';
import { requestData, DataStamp } from '@/components/dashboard/data';
import { buttonClass } from './fields';
export function ProviderProfileCard({ project, onApply }: { project: ResearchProject; onApply: (profile: ProviderProfile) => void }) {
  const [result, setResult] = useState<ServiceResult<ProviderProfile> | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { setResult(null); setError(''); }, [project.coinpaprikaId]);
  async function load() { setBusy(true); setError(''); try { setResult(await requestData(`/api/data/project?id=${encodeURIComponent(project.coinpaprikaId)}`)); } catch { setError('Profile could not load. Your research is unchanged.'); } finally { setBusy(false); } }
  const candidate = result?.ok && result.data.providerId === project.coinpaprikaId ? result.data : null;
  const profile = candidate ?? project.providerProfile;
  return <Card className="space-y-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Sourced project profile</h2><p className="mt-1 text-xs text-muted-foreground">Provider reference · separate from your own research</p></div><button className={buttonClass} disabled={!project.coinpaprikaId || busy} onClick={load}>{busy ? 'Loading…' : 'Load profile'}</button></div>
    {!project.coinpaprikaId && <p className="text-sm text-muted-foreground">Select an asset below to load its description, links and reported team.</p>}
    {error && <p role="alert" className="text-warning">{error}</p>}<DataStamp result={result} />
    {profile && <><p className="text-sm font-medium">{profile.name} · {profile.symbol}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{profile.description || 'No description returned.'}</p><div className="flex flex-wrap gap-2">{profile.links.map((l, i) => <a className={`${buttonClass} text-xs`} key={`${l.url}:${i}`} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</div>{profile.team.length > 0 && <details className="rounded border p-3 text-sm"><summary className="cursor-pointer">Reported team · {profile.team.length} names · verify roles</summary><ul className="mt-3 space-y-2">{profile.team.map((t, i) => <li key={i}>{t.name} <span className="text-muted-foreground">{t.role}</span></li>)}</ul></details>}<a className="block text-xs text-primary hover:underline" href={profile.sourceUrl} target="_blank" rel="noreferrer">Source: CoinPaprika · retrieved {new Date(profile.fetchedAt).toLocaleString()} ↗</a><p className="text-xs text-muted-foreground">Provider claims may be incomplete or outdated. Links and team entries are not independently verified by Atlas.</p>{candidate && <button className={buttonClass} onClick={() => onApply(candidate)}>Use profile in draft</button>}<p className="text-xs text-muted-foreground">Use profile in draft, then Save research to keep it. Your summary, notes and verified records are preserved.</p></>}
  </Card>;
}
