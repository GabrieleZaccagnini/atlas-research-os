import { tokenLookup } from '../core/validation';
import type { DexPool, ServiceResult } from '../core/types';
export interface DexProvider { pools(chainId: string, address: string): Promise<ServiceResult<DexPool[]>> }
export function createDexService(provider: DexProvider) {
  return { getPools(chainId: string, address: string) { const input = tokenLookup.parse({ chainId, address }); return provider.pools(input.chainId, input.address); } };
}
