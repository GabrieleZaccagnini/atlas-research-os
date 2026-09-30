import { z } from 'zod';
import { optionalNumber as n, optionalDate } from '../core/validation';
import type { ProviderRuntime } from '../core/runtime';
import type { GlobalMarket, MarketQuote, ServiceResult } from '../core/types';
import { providerProfileSchema, type ProviderProfile } from '../../lib/provider-profile';

const nonnegative = z.number().finite().nonnegative().nullish().transform(v => v ?? null);
// Some provider IDs begin with a hyphen; still forbid paths, query strings and spaces.
export const coinPaprikaId = z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/);
const quoteSchema = z.object({
  id: coinPaprikaId, name: z.string(), symbol: z.string(), rank: nonnegative, last_updated: optionalDate,
  circulating_supply: nonnegative, total_supply: nonnegative, max_supply: nonnegative,
  quotes: z.object({ USD: z.object({ price: nonnegative, market_cap: nonnegative, volume_24h: nonnegative,
    percent_change_1h: n, percent_change_24h: n, percent_change_7d: n }) }),
});
const safeLink = (value: string) => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; } };
export function coinPaprikaMarket(runtime: ProviderRuntime) {
  const assets = () => runtime.query<MarketQuote[]>('coinpaprika', 'tickers', { quotes: 'USD' }, 300000, raw => {
    const quotes = z.array(quoteSchema).max(5000).parse(raw);
    if (new Set(quotes.map(q => q.id)).size !== quotes.length) throw new Error('Duplicate asset IDs');
    return quotes.map(q => ({ asset: { coinpaprikaId: q.id }, name: q.name, symbol: q.symbol, currency: 'USD',
      price: q.quotes.USD.price, marketCap: q.quotes.USD.market_cap, volume24h: q.quotes.USD.volume_24h,
      fdv: null, rank: q.rank && q.rank > 0 ? q.rank : null,
      change1hPercent: q.quotes.USD.percent_change_1h, change24hPercent: q.quotes.USD.percent_change_24h, change7dPercent: q.quotes.USD.percent_change_7d,
      circulatingSupply: q.circulating_supply, totalSupply: q.total_supply, maxSupply: q.max_supply,
      sourceUpdatedAt: q.last_updated,
    }));
  });
  return {
    assets,
    async quotes(ids: string[]): Promise<ServiceResult<MarketQuote[]>> {
      const selected = new Set(z.array(coinPaprikaId).min(1).max(25).parse(ids));
      const result = await assets();
      return result.ok ? { ...result, data: result.data.filter(q => selected.has(q.asset.coinpaprikaId!)) } : result;
    },
    global: () => runtime.query<GlobalMarket>('coinpaprika', 'global', {}, 300000, raw => {
      const data = z.object({ market_cap_usd: nonnegative, volume_24h_usd: nonnegative,
        market_cap_change_24h: n, volume_24h_change_24h: n,
        bitcoin_dominance_percentage: z.number().min(0).max(100).nullish(), last_updated: nonnegative }).parse(raw);
      return { currency: 'USD', marketCap: data.market_cap_usd, volume24h: data.volume_24h_usd,
        marketCapChange24hPercent: data.market_cap_change_24h, volumeChange24hPercent: data.volume_24h_change_24h,
        btcDominancePercent: data.bitcoin_dominance_percentage ?? null, ethDominancePercent: null,
        sourceUpdatedAt: data.last_updated === null ? null : new Date(data.last_updated * 1000).toISOString() };
    }),
    profile: (id: string) => runtime.query<ProviderProfile>('coinpaprika', `coins/${coinPaprikaId.parse(id)}`, {}, 86400000, raw => {
      const data = z.object({ id: coinPaprikaId, name: z.string(), symbol: z.string(), description: z.string().nullish(),
        links: z.record(z.array(z.string())).nullish(), tags: z.array(z.object({ name: z.string() })).nullish(),
        team: z.array(z.object({ name: z.string(), position: z.string().nullish() })).nullish(),
      }).parse(raw);
      if (data.id !== id) throw new Error('Provider identity mismatch');
      return providerProfileSchema.parse({ provider: 'coinpaprika', providerId: data.id, name: data.name, symbol: data.symbol,
        description: (data.description ?? '').slice(0, 20000), sourceUrl: `https://coinpaprika.com/coin/${data.id}/`, fetchedAt: new Date().toISOString(),
        links: Object.entries(data.links ?? {}).flatMap(([label, urls]) => urls.filter(safeLink).map(url => ({ label: label.replace(/_/g, ' '), url }))).slice(0, 30),
        team: (data.team ?? []).slice(0, 50).map(t => ({ name: t.name, role: t.position ?? '' })),
        tags: (data.tags ?? []).slice(0, 30).map(t => t.name),
      });
    }),
  };
}
