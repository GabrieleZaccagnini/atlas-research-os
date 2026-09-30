import { z } from 'zod';
import type { MarketQuote } from '@/services/core/types';
import type { DiscoverySnapshot } from './discovery';
import { marketMetrics, type MarketRow } from './market-dashboard';
export const watchProviders = ['coinmarketcap', 'coinpaprika', 'coingecko'] as const;
export const watchProviderNames = { coinmarketcap: 'CMC', coinpaprika: 'CoinPaprika', coingecko: 'CoinGecko' };
export const watchStatuses = ['Watching', 'Research Queue', 'Buy List', 'Paused'] as const;
const slug = z.string().min(1).max(200).regex(/^[a-z0-9_-]+$/);
const identity = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('coinmarketcap'), id: z.string().regex(/^[1-9]\d{0,9}$/) }),
  z.object({ provider: z.literal('coinpaprika'), id: slug }),
  z.object({ provider: z.literal('coingecko'), id: slug }),
]);
export const watchAssetSchema = identity.and(z.object({ name: z.string().trim().min(1).max(200), symbol: z.string().trim().max(100) }));
export type WatchAsset = z.infer<typeof watchAssetSchema>;
export const assetKey = (a: Pick<WatchAsset, 'provider' | 'id'>) => `${a.provider}:${a.id}`;
export const watchEntrySchema = z.object({ asset: watchAssetSchema, status: z.enum(watchStatuses), notes: z.string().max(20000), archived: z.boolean(), addedAt: z.string().datetime(), updatedAt: z.string().datetime() });
export type WatchEntry = z.infer<typeof watchEntrySchema>;
export const watchlistSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(60), archived: z.boolean(), entries: z.array(watchEntrySchema).max(1000), updatedAt: z.string().datetime() }).refine(l => new Set(l.entries.map(e => assetKey(e.asset))).size === l.entries.length, 'Duplicate asset IDs in list');
export type Watchlist = z.infer<typeof watchlistSchema>;
export const watchlistFileSchema = z.object({ version: z.literal(1), revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), selectedId: z.string().uuid().nullable(), lists: z.array(watchlistSchema).max(50) }).superRefine((f, ctx) => {
  if (new Set(f.lists.map(l => l.id)).size !== f.lists.length) ctx.addIssue({ code: 'custom', message: 'Duplicate list IDs' });
  if (new Set(f.lists.filter(l => !l.archived).map(l => l.name.toLowerCase())).size !== f.lists.filter(l => !l.archived).length) ctx.addIssue({ code: 'custom', message: 'Choose a different list name' });
  if (f.lists.reduce((n, l) => n + l.entries.length, 0) > 5000) ctx.addIssue({ code: 'custom', message: 'Watchlist backup exceeds 5,000 entries' });
  if (f.selectedId && !f.lists.some(l => l.id === f.selectedId && !l.archived)) ctx.addIssue({ code: 'custom', message: 'Invalid dashboard list' });
});
export type WatchlistFile = z.infer<typeof watchlistFileSchema>;
export function emptyWatchlists(): WatchlistFile { return { version: 1, revision: 0, selectedId: null, lists: [] }; }
export function watchlistStorageKey(scope: string) { return `atlas.watchlists.v1:${encodeURIComponent(scope)}`; }
export function parseWatchlists(raw: string | null) { return raw === null ? emptyWatchlists() : watchlistFileSchema.parse(JSON.parse(raw)); }
export function updateWatchlists(raw: string | null, expected: number, change: (f: WatchlistFile) => WatchlistFile) {
  const current = parseWatchlists(raw);
  if (current.revision !== expected) throw new Error('Watchlists changed in another tab. Reload lists before saving; your draft is still here.');
  return watchlistFileSchema.parse({ ...change(current), version: 1, revision: current.revision + 1 });
}
export function makeWatchlist(name: string, id: string, now: string): Watchlist { return watchlistSchema.parse({ id, name, archived: false, entries: [], updatedAt: now }); }
export function addWatchAssets(list: Watchlist, assets: WatchAsset[], now: string): Watchlist {
  if (list.archived) throw new Error('Restore this list before adding assets.');
  const entries = list.entries.map(e => ({ ...e }));
  for (const raw of assets) {
    const asset = watchAssetSchema.parse(raw); const existing = entries.find(e => assetKey(e.asset) === assetKey(asset));
    if (existing) { if (existing.archived) { existing.archived = false; existing.updatedAt = now; } }
    else entries.push({ asset, notes: '', status: 'Watching', archived: false, addedAt: now, updatedAt: now });
  }
  return watchlistSchema.parse({ ...list, entries, updatedAt: now });
}
export function mergeWatchlistBackup(current: WatchlistFile, raw: string): WatchlistFile {
  const incoming = watchlistFileSchema.parse(JSON.parse(raw)); const ids = new Set(current.lists.map(l => l.id));
  const names = new Set(current.lists.filter(l => !l.archived).map(l => l.name.toLowerCase())); const additions: Watchlist[] = [];
  for (const list of incoming.lists) {
    if (ids.has(list.id)) continue;
    let name = list.name; let n = 2;
    while (!list.archived && names.has(name.toLowerCase())) name = `${list.name.slice(0, 45)} (import ${n++})`;
    if (!list.archived) names.add(name.toLowerCase()); additions.push({ ...list, name }); ids.add(list.id);
  }
  return watchlistFileSchema.parse({ ...current, lists: [...current.lists, ...additions] });
}
export function restoreWatchlist(current: WatchlistFile, id: string, now: string): WatchlistFile {
  const list = current.lists.find(l => l.id === id); if (!list?.archived) return current;
  const names = new Set(current.lists.filter(l => !l.archived).map(l => l.name.toLowerCase()));
  let name = list.name; let n = 2;
  while (names.has(name.toLowerCase())) name = `${list.name.slice(0, 43)} (restored ${n++})`;
  return watchlistFileSchema.parse({...current, lists:current.lists.map(l => l.id === id ? {...l, name, archived:false, updatedAt:now} : l)});
}
export function quoteWatchAsset(q: MarketQuote): WatchAsset | null {
  const provider = q.asset.coinmarketcapId !== undefined ? 'coinmarketcap' : q.asset.coinpaprikaId ? 'coinpaprika' : q.asset.coingeckoId ? 'coingecko' : null;
  if (!provider) return null;
  const parsed = watchAssetSchema.safeParse({ provider, id: provider === 'coinmarketcap' ? String(q.asset.coinmarketcapId) : provider === 'coinpaprika' ? q.asset.coinpaprikaId : q.asset.coingeckoId, name: q.name, symbol: q.symbol });
  return parsed.success ? parsed.data : null;
}
export function discoveryWatchAsset(provider: WatchAsset['provider'], item: { id: string; name: string; symbol: string }): WatchAsset | null {
  const parsed = watchAssetSchema.safeParse({ provider, ...item }); return parsed.success ? parsed.data : null;
}
export function watchHref(a: WatchAsset) {
  return a.provider === 'coinmarketcap' ? `/tokens/cmc/${a.id}` : a.provider === 'coinpaprika' ? `/markets?asset=${encodeURIComponent(a.id)}` : `https://www.coingecko.com/en/coins/${encodeURIComponent(a.id)}`;
}
export function watchCatalog(cmc: MarketQuote[], paprika: MarketQuote[], gecko: DiscoverySnapshot | null): WatchAsset[] {
  const all = [...cmc, ...paprika].map(quoteWatchAsset).filter((a): a is WatchAsset => !!a);
  for (const item of gecko?.items ?? []) { const a = discoveryWatchAsset('coingecko', item); if (a) all.push(a); }
  return Array.from(new Map(all.map(a => [assetKey(a), a])).values());
}
export function pasteTokens(raw: string): string[] {
  if (raw.length > 20000) throw new Error('Paste up to 100 token names, tickers or provider IDs.');
  const tokens = raw.split(/[\n,]/).map(t => t.trim()).filter(Boolean);
  if (!tokens.length || tokens.length > 100 || tokens.some(t => t.length > 200)) throw new Error('Paste 1–100 entries, one per line or separated by commas.');
  return Array.from(new Map(tokens.map(t => [t.toLowerCase(), t])).values());
}
export function previewWatchImport(raw: string, catalog: WatchAsset[]) {
  return pasteTokens(raw).map(token => {
    const term = token.toLowerCase().replace(/^cmc:/, 'coinmarketcap:');
    const matches = catalog.filter(a => term.includes(':') ? assetKey(a) === term : [a.name.toLowerCase(), a.symbol.toLowerCase(), a.id.toLowerCase()].includes(term));
    return { token, matches };
  });
}
export interface WatchRow extends MarketRow { entry: WatchEntry; watchKey: string }
export function watchRows(entries: WatchEntry[], cmc: MarketQuote[], paprika: MarketQuote[], gecko: DiscoverySnapshot | null, archived = false): WatchRow[] {
  // Derive benchmarks on complete, separate provider snapshots before selecting list members.
  const quotes = [...marketMetrics(cmc), ...marketMetrics(paprika)];
  const byId = new Map(quotes.flatMap(q => { const a = quoteWatchAsset(q); return a ? [[assetKey(a), q] as const] : []; }));
  for (const item of gecko?.items ?? []) byId.set(`coingecko:${item.id}`, { asset: { coingeckoId: item.id }, name: item.name, symbol: item.symbol, currency: 'USD', price: item.price, marketCap: null, fdv: null, volume24h: null, rank: item.marketRank, change24hPercent: item.change24h, change7dPercent: null, circulatingSupply: null, totalSupply: null, maxSupply: null, sourceUpdatedAt: null });
  return entries.filter(e => e.archived === archived).map(entry => {
    const key = assetKey(entry.asset); const q = byId.get(key);
    const empty: MarketRow = { asset: {}, currency: 'USD', name: entry.asset.name, symbol: entry.asset.symbol, price: null, marketCap: null, fdv: null, volume24h: null, rank: null, change24hPercent: null, change7dPercent: null, circulatingSupply: null, totalSupply: null, maxSupply: null, sourceUpdatedAt: null };
    return { ...(q ?? empty), name: entry.asset.name, symbol: entry.asset.symbol, entry, watchKey: key };
  });
}
