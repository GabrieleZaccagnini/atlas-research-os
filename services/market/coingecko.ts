import { z } from 'zod';
import type { GlobalMarket, MarketQuote } from '../core/types';
import { optionalNumber as n, optionalDate } from '../core/validation';
import type { ProviderRuntime } from '../core/runtime';
const quoteSchema = z.object({
  id: z.string(), name: z.string(), symbol: z.string(), current_price: n, market_cap: n,
  fully_diluted_valuation: n, total_volume: n, market_cap_rank: n,
  price_change_percentage_24h: n, price_change_percentage_7d_in_currency: n,
  circulating_supply: n, total_supply: n, max_supply: n, last_updated: optionalDate,
});
export function coinGeckoMarket(runtime: ProviderRuntime) {
  return {
    quotes: (ids: string[]) => runtime.query<MarketQuote[]>('coingecko', 'coins/markets', {
      vs_currency: 'usd', ids: ids.join(','), per_page: String(ids.length), page: '1', sparkline: 'false', price_change_percentage: '7d',
    }, 60000, raw => z.array(quoteSchema).parse(raw).map(q => ({
      asset: { coingeckoId: q.id }, name: q.name, symbol: q.symbol, currency: 'USD',
      price: q.current_price, marketCap: q.market_cap, fdv: q.fully_diluted_valuation,
      volume24h: q.total_volume, rank: q.market_cap_rank,
      change24hPercent: q.price_change_percentage_24h, change7dPercent: q.price_change_percentage_7d_in_currency,
      circulatingSupply: q.circulating_supply, totalSupply: q.total_supply, maxSupply: q.max_supply, sourceUpdatedAt: q.last_updated,
    }))),
    global: () => runtime.query<GlobalMarket>('coingecko', 'global', {}, 120000, raw => {
      const { data } = z.object({ data: z.object({ total_market_cap: z.object({ usd: n }), total_volume: z.object({ usd: n }), market_cap_percentage: z.object({ btc: n, eth: n }), updated_at: n }) }).parse(raw);
      return { currency: 'USD', marketCap: data.total_market_cap.usd, volume24h: data.total_volume.usd,
        btcDominancePercent: data.market_cap_percentage.btc, ethDominancePercent: data.market_cap_percentage.eth,
        sourceUpdatedAt: data.updated_at === null ? null : new Date(data.updated_at * 1000).toISOString() };
    }),
  };
}
