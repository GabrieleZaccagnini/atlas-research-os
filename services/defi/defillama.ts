import { z } from 'zod';
import type { ProviderRuntime } from '../core/runtime';
import type { DefiProtocol } from '../core/types';
import { optionalNumber, optionalText } from '../core/validation';
const protocol = z.object({ id: z.string(), slug: z.string(), name: z.string(), symbol: optionalText,
  chains: z.array(z.string()), category: optionalText, tvl: optionalNumber });
export function defiLlama(runtime: ProviderRuntime) {
  return { protocols: () => runtime.query<DefiProtocol[]>('defillama', 'protocols', {}, 300000, raw => z.array(protocol).parse(raw).map(p => ({
    id: p.id, slug: p.slug, name: p.name, symbol: p.symbol, chains: p.chains, category: p.category, tvlUsd: p.tvl,
  }))) };
}
