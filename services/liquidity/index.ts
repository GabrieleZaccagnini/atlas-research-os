import type { DexPool } from '../core/types';
/** Summarize returned pools only. Missing liquidity is not a measured zero. */
export function summarizeDexLiquidity(pools: DexPool[]) {
  const unique = Array.from(new Map(pools.map(p => [`${p.chainId}:${p.dexId}:${p.pairAddress}`, p])).values());
  const known = unique.filter(p => p.liquidityUsd !== null);
  return { poolCount: unique.length, poolsWithLiquidity: known.length,
    reportedLiquidityUsd: known.length ? known.reduce((sum, p) => sum + p.liquidityUsd!, 0) : null,
    coverage: 'returned-pools-only' as const,
  };
}
