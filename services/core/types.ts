export type ProviderId = 'coingecko' | 'dexscreener' | 'defillama';
export type ErrorCode = 'disabled' | 'missing_key' | 'rate_limited' | 'timeout' | 'network' | 'upstream' | 'invalid_response' | 'invalid_input';
export interface ServiceError { code: ErrorCode; message: string; retryAt?: string }
export interface Provenance {
  provider: ProviderId;
  fetchedAt: string;
  expiresAt: string;
  cache: 'live' | 'fresh' | 'stale';
}
export type ServiceResult<T> =
  | { ok: true; data: T; meta: Provenance; warning?: ServiceError }
  | { ok: false; data: null; error: ServiceError; provider: ProviderId };
export interface ProviderStatus {
  id: ProviderId;
  state: 'idle' | 'healthy' | 'degraded' | 'disabled' | 'missing_key';
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: ServiceError | null;
  requests: number;
  failures: number;
}
// Asset symbols are display labels, never cross-provider identity keys.
export interface AssetIdentity {
  atlasId?: string;
  coingeckoId?: string;
  coinmarketcapId?: number;
  contracts?: { chainId: string; address: string }[];
}
export interface MarketQuote {
  asset: AssetIdentity; name: string; symbol: string; currency: 'USD';
  price: number | null; marketCap: number | null; fdv: number | null;
  volume24h: number | null; rank: number | null;
  change24hPercent: number | null; change7dPercent: number | null;
  circulatingSupply: number | null; totalSupply: number | null; maxSupply: number | null;
  sourceUpdatedAt: string | null;
}
export interface GlobalMarket {
  currency: 'USD'; marketCap: number | null; volume24h: number | null;
  btcDominancePercent: number | null; ethDominancePercent: number | null;
  sourceUpdatedAt: string | null;
}
export interface ExchangeMarket {
  exchangeId: string; exchangeName: string;
  // CoinGecko tickers do not reliably identify CEX vs DEX.
  exchangeType: 'cex' | 'dex' | 'unknown';
  base: string; quote: string; priceUsd: number | null;
  volume24hUsd: number | null; spreadPercent: number | null;
  isStale: boolean | null; isAnomaly: boolean | null;
  tradeUrl: string | null; sourceUpdatedAt: string | null;
}
export interface ExchangePage { markets: ExchangeMarket[]; page: number; mayHaveMore: boolean }
export interface DexPool {
  chainId: string; dexId: string; pairAddress: string; url: string;
  base: { address: string; symbol: string; name: string };
  quote: { address: string | null; symbol: string | null; name: string | null };
  // Provider prices describe the base token, even if lookup matched the quote token.
  basePriceUsd: number | null; basePriceNative: number | null;
  volume24hUsd: number | null; liquidityUsd: number | null;
  baseReserve: number | null; quoteReserve: number | null;
  buys24h: number | null; sells24h: number | null; createdAt: string | null;
}
export interface DefiProtocol {
  id: string; slug: string; name: string; symbol: string | null;
  chains: string[]; category: string | null; tvlUsd: number | null;
}
// Reserved contract for a future CCXT adapter. Depth is not pool liquidity.
export interface OrderBook {
  exchangeId: string; base: string; quote: string; sourceUpdatedAt: string;
  bids: [priceInQuote: number, baseAmount: number][];
  asks: [priceInQuote: number, baseAmount: number][];
}
