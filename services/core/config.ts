import type { ProviderId } from './types';
export interface ProviderConfig { enabled: boolean; apiKey?: string; requiresKey: boolean; minIntervalMs: number }
export interface ServiceConfig {
  timeoutMs: number; staleMs: number; maxCacheEntries: number;
  providers: Record<ProviderId, ProviderConfig>;
}
const integer = (v: string | undefined, fallback: number, min: number, max: number) => {
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error('Invalid Atlas numeric configuration');
  return n;
};
const enabled = (v: string | undefined) => {
  if (v === undefined || v === 'true') return true;
  if (v === 'false') return false;
  throw new Error('Atlas enable flags must be true or false');
};
// Pure parser: only server.ts reads process.env. Values are never returned by status routes.
export function readConfig(env: Record<string, string | undefined>): ServiceConfig {
  return {
    timeoutMs: integer(env.ATLAS_API_TIMEOUT_MS, 8000, 100, 30000),
    staleMs: integer(env.ATLAS_STALE_TTL_MS, 300000, 0, 3600000),
    maxCacheEntries: integer(env.ATLAS_CACHE_MAX_ENTRIES, 250, 1, 2000),
    providers: {
      coingecko: { enabled: enabled(env.ATLAS_COINGECKO_ENABLED), apiKey: env.COINGECKO_DEMO_API_KEY?.trim() || undefined, requiresKey: true, minIntervalMs: 2500 },
      dexscreener: { enabled: enabled(env.ATLAS_DEXSCREENER_ENABLED), requiresKey: false, minIntervalMs: 300 },
      defillama: { enabled: enabled(env.ATLAS_DEFILLAMA_ENABLED), requiresKey: false, minIntervalMs: 1000 },
    },
  };
}
