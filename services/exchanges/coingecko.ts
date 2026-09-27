import { z } from 'zod';
import type { ProviderRuntime } from '../core/runtime';
import type { ExchangePage } from '../core/types';
import { optionalNumber as n, optionalDate, optionalUrl } from '../core/validation';
const ticker = z.object({ base: z.string(), target: z.string(), market: z.object({ name: z.string(), identifier: z.string() }),
  converted_last: z.object({ usd: n }), converted_volume: z.object({ usd: n }), bid_ask_spread_percentage: n,
  is_stale: z.boolean().nullish(), is_anomaly: z.boolean().nullish(), trade_url: optionalUrl, last_fetch_at: optionalDate,
});
export function coinGeckoExchanges(runtime: ProviderRuntime) {
  return { list: (id: string, page: number) => runtime.query<ExchangePage>('coingecko', `coins/${encodeURIComponent(id)}/tickers`, { page: String(page), order: 'volume_desc' }, 120000, raw => {
    const { tickers } = z.object({ tickers: z.array(ticker) }).parse(raw);
    return { page, mayHaveMore: tickers.length === 100, markets: tickers.map(t => ({
      exchangeId: t.market.identifier, exchangeName: t.market.name, exchangeType: 'unknown', base: t.base, quote: t.target,
      priceUsd: t.converted_last.usd, volume24hUsd: t.converted_volume.usd, spreadPercent: t.bid_ask_spread_percentage,
      isStale: t.is_stale ?? null, isAnomaly: t.is_anomaly ?? null, tradeUrl: t.trade_url, sourceUpdatedAt: t.last_fetch_at,
    })) };
  }) };
}
