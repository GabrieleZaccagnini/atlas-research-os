import { z } from 'zod';
import type { ProviderRuntime } from '../core/runtime';
import type { ServiceResult } from '../core/types';
import { decodeCmcListings } from '../market/coinmarketcap';
import { coinPaprikaId } from '../market/coinpaprika';
import { intelligenceAdapters } from '../intelligence/adapters';
import { discoveryCoverage, type DiscoveryKind, type DiscoverySource, type DiscoverySnapshot } from '../../lib/discovery';

export function decodePaprikaAdditions(raw: unknown): DiscoverySnapshot {
  const rows = z.array(z.object({ id: z.string().min(1).max(200), name: z.string().min(1).max(200), symbol: z.string().min(1).max(100),
    rank: z.number().int().nonnegative(), is_new: z.boolean(), is_active: z.boolean(), type: z.enum(['coin', 'token']) })).max(100000).parse(raw);
  if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Duplicate CoinPaprika IDs');
  // Historic directory entries include non-ASCII and punctuation IDs. Validate path-safe IDs only for the selected additions.
  const added = rows.filter(r => r.is_new).map(r => ({ ...r, id: coinPaprikaId.parse(r.id) })).sort((a, b) => Number(b.is_active) - Number(a.is_active) || (a.rank || Infinity) - (b.rank || Infinity) || a.id.localeCompare(b.id));
  return { total: added.length, items: added.slice(0, 100).map(r => ({ id: r.id, name: r.name, symbol: r.symbol,
    href: `https://coinpaprika.com/coin/${r.id}/`, marketRank: r.rank || null,
    price: null, change24h: null, addedAt: null, active: r.is_active })) };
}
export function decodeCmcAdditions(raw: unknown): DiscoverySnapshot {
  const data = z.object({ status: z.object({ error_code: z.union([z.literal(0), z.literal('0')]) }), data: z.array(z.object({
    id: z.number().int().positive(), date_added: z.string().datetime({ offset: true })
  })).max(50) }).parse(raw).data;
  if (!data.length) return { items: [], total: 0 };
  const quotes = decodeCmcListings(raw);
  const dates = new Map(data.map(r => [r.id, r.date_added]));
  const items = quotes.map(q => ({ id: String(q.asset.coinmarketcapId!), name: q.name, symbol: q.symbol,
    href: `/tokens/cmc/${q.asset.coinmarketcapId!}`, marketRank: q.rank, price: q.price,
    change24h: q.change24hPercent, addedAt: dates.get(q.asset.coinmarketcapId!)!, active: null
  })).sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt) || Number(b.id) - Number(a.id));
  return { items, total: items.length };
}
export function createDiscoveryService(runtime: ProviderRuntime) {
  const intelligence = intelligenceAdapters(runtime);
  return {
    async list(source: DiscoverySource, kind: DiscoveryKind): Promise<ServiceResult<DiscoverySnapshot>> {
      const coverage = discoveryCoverage(source, kind);
      if (coverage.access !== 'available') return { ok: false, data: null, provider: source, error: { code: 'disabled', message: coverage.description } };
      if (source === 'coinpaprika') return runtime.query('coinpaprika', 'coins', {}, 900000, decodePaprikaAdditions);
      if (source === 'coinmarketcap') return runtime.query('coinmarketcap', 'v3/cryptocurrency/listings/latest',
        { start: '1', limit: '50', convert: 'USD', sort: 'date_added', sort_dir: 'desc' }, 900000, decodeCmcAdditions);
      const result = await intelligence.trending();
      return result.ok ? { ...result, data: { total: result.data.length, items: result.data.map(r => ({
        id: r.id, name: r.name, symbol: r.symbol, href: `https://www.coingecko.com/en/coins/${encodeURIComponent(r.id)}`,
        marketRank: r.rank, price: r.price, change24h: r.change24h, addedAt: null, active: null
      })) } } : result;
    }
  };
}
