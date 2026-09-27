import type { z } from 'zod';
import type { ProviderId, ProviderStatus, ServiceResult } from './types';
import type { ServiceConfig } from './config';
import { MemoryCache, type CacheStore } from './cache';
import { ProviderError, safeError } from './errors';
const origins: Record<ProviderId, string> = {
  coingecko: 'https://api.coingecko.com/api/v3/',
  dexscreener: 'https://api.dexscreener.com/',
  defillama: 'https://api.llama.fi/',
};
export class ProviderRuntime {
  private statuses: Record<ProviderId, ProviderStatus>;
  private nextRequest = new Map<ProviderId, number>();
  private inFlight = new Map<string, Promise<ServiceResult<unknown>>>();
  private cache: CacheStore;
  constructor(private config: ServiceConfig, private fetcher: typeof fetch = fetch, private now: () => number = Date.now, cache?: CacheStore) {
    this.cache = cache ?? new MemoryCache(config.maxCacheEntries, now);
    this.statuses = Object.fromEntries(Object.entries(config.providers).map(([id, p]) => [id, {
      id, state: !p.enabled ? 'disabled' : p.requiresKey && !p.apiKey ? 'missing_key' : 'idle',
      lastAttemptAt: null, lastSuccessAt: null, lastError: null, requests: 0, failures: 0,
    }])) as Record<ProviderId, ProviderStatus>;
  }
  status(): ProviderStatus[] { return Object.values(this.statuses).map(s => ({ ...s, lastError: s.lastError ? { ...s.lastError } : null })); }
  async query<T>(provider: ProviderId, path: string, params: Record<string, string>, ttlMs: number, decode: (value: unknown) => T): Promise<ServiceResult<T>> {
    const p = this.config.providers[provider];
    if (!p.enabled || (p.requiresKey && !p.apiKey)) return {
      ok: false, data: null, provider,
      error: { code: !p.enabled ? 'disabled' : 'missing_key', message: !p.enabled ? 'Provider disabled' : 'Provider API key is not configured' },
    };
    const url = new URL(path, origins[provider]);
    if (!url.href.startsWith(origins[provider]) || url.username || url.password) throw new Error('Provider URL is outside its fixed origin');
    Object.keys(params).sort().forEach(key => url.searchParams.set(key, params[key]));
    const key = `${provider}:${url.href}`;
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<ServiceResult<T>>;
    const operation = this.execute(provider, key, url, ttlMs, decode);
    this.inFlight.set(key, operation);
    try { return await operation; } finally { this.inFlight.delete(key); }
  }
  private async execute<T>(provider: ProviderId, key: string, url: URL, ttlMs: number, decode: (value: unknown) => T): Promise<ServiceResult<T>> {
    const cached = await this.cache.get<T>(key);
    if (cached && this.now() < cached.freshUntil) return { ok: true, data: cached.data, meta: { ...cached.meta, cache: 'fresh' } };
    const status = this.statuses[provider];
    let attempted = false;
    try {
      const next = this.nextRequest.get(provider) ?? 0;
      if (this.now() < next) throw new ProviderError('rate_limited', 'Provider is cooling down; retry later', new Date(next).toISOString());
      this.nextRequest.set(provider, this.now() + this.config.providers[provider].minIntervalMs);
      attempted = true;
      status.requests++;
      status.lastAttemptAt = new Date(this.now()).toISOString();
      const raw = await this.request(provider, url);
      const data = decode(raw);
      const fetched = this.now();
      const meta = { provider, fetchedAt: new Date(fetched).toISOString(), expiresAt: new Date(fetched + ttlMs).toISOString(), cache: 'live' as const };
      await this.cache.set(key, { data, meta, freshUntil: fetched + ttlMs, staleUntil: fetched + ttlMs + this.config.staleMs });
      status.state = 'healthy'; status.lastSuccessAt = meta.fetchedAt; status.lastError = null;
      return { ok: true, data, meta };
    } catch (error) {
      const safe = safeError(error);
      if (attempted) { status.state = 'degraded'; status.lastError = safe; status.failures++; }
      if (cached && this.now() < cached.staleUntil) return { ok: true, data: cached.data, meta: { ...cached.meta, cache: 'stale' }, warning: safe };
      return { ok: false, data: null, provider, error: safe };
    }
  }
  private async request(provider: ProviderId, url: URL): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (provider === 'coingecko' && this.config.providers.coingecko.apiKey) headers['x-cg-demo-api-key'] = this.config.providers.coingecko.apiKey;
      const response = await this.fetcher(url, { headers, signal: controller.signal, cache: 'no-store', redirect: 'error' });
      if (!response.ok) {
        if (response.status === 429) {
          const retry = response.headers.get('retry-after');
          const seconds = retry !== null && /^\d+(\.\d+)?$/.test(retry) ? Number(retry) : NaN;
          const date = retry ? Date.parse(retry) : NaN;
          const delay = Number.isFinite(seconds) ? seconds * 1000 : Number.isFinite(date) ? date - this.now() : 60000;
          const until = this.now() + Math.max(1000, Math.min(delay, 86400000));
          this.nextRequest.set(provider, until);
          throw new ProviderError('rate_limited', 'Provider rate limit reached', new Date(until).toISOString());
        }
        throw new ProviderError('upstream', `Provider request failed (HTTP ${response.status})`);
      }
      try { return await response.json(); } catch (error) {
        if (controller.signal.aborted) throw error;
        throw new ProviderError('invalid_response', 'Provider returned invalid JSON');
      }
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(controller.signal.aborted ? 'timeout' : 'network', controller.signal.aborted ? 'Provider request timed out' : 'Provider could not be reached');
    } finally { clearTimeout(timer); }
  }
}
export function parse<T>(schema: z.ZodType<T>, value: unknown): T { return schema.parse(value); }
