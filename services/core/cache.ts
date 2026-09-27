import type { Provenance } from './types';
export interface CacheEntry<T> { data: T; meta: Provenance; freshUntil: number; staleUntil: number }
export interface CacheStore {
  get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  set<T>(key: string, value: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<void>;
}
/** Bounded process-local cache. Replace with Redis for shared deployment state. */
export class MemoryCache implements CacheStore {
  private entries = new Map<string, CacheEntry<unknown>>();
  constructor(private maxEntries = 250, private now: () => number = Date.now) {}
  async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = this.entries.get(key);
    if (entry && entry.staleUntil <= this.now()) { this.entries.delete(key); return undefined; }
    return entry as CacheEntry<T> | undefined;
  }
  async set<T>(key: string, value: CacheEntry<T>) {
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) this.entries.delete(this.entries.keys().next().value!);
    this.entries.set(key, value);
  }
  async delete(key: string) { this.entries.delete(key); }
}
