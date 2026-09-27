import { z } from 'zod';
import type { ProviderRuntime } from '../core/runtime';
import type { DexPool } from '../core/types';
import { optionalNumber as n, optionalText, numericString } from '../core/validation';
const base = z.object({ address: z.string(), symbol: z.string(), name: z.string() });
const quote = z.object({ address: optionalText, symbol: optionalText, name: optionalText });
const pair = z.object({ chainId: z.string(), dexId: z.string(), pairAddress: z.string(), url: z.string().url().refine(v => /^https?:\/\//.test(v)),
  baseToken: base, quoteToken: quote, priceUsd: numericString, priceNative: numericString,
  volume: z.object({ h24: n }).nullish(), liquidity: z.object({ usd: n, base: n, quote: n }).nullish(),
  txns: z.object({ h24: z.object({ buys: n, sells: n }).nullish() }).nullish(), pairCreatedAt: n,
});
export function dexScreener(runtime: ProviderRuntime) {
  return { pools: (chainId: string, address: string) => runtime.query<DexPool[]>('dexscreener', `token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(address)}`, {}, 30000, raw =>
    z.array(pair).parse(raw).map(p => ({ chainId: p.chainId, dexId: p.dexId, pairAddress: p.pairAddress, url: p.url,
      base: p.baseToken, quote: p.quoteToken, basePriceUsd: p.priceUsd, basePriceNative: p.priceNative,
      volume24hUsd: p.volume?.h24 ?? null, liquidityUsd: p.liquidity?.usd ?? null,
      baseReserve: p.liquidity?.base ?? null, quoteReserve: p.liquidity?.quote ?? null,
      buys24h: p.txns?.h24?.buys ?? null, sells24h: p.txns?.h24?.sells ?? null,
      createdAt: p.pairCreatedAt === null ? null : new Date(p.pairCreatedAt).toISOString(),
    }))) };
}
