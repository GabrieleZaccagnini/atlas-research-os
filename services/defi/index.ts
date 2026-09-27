import { z } from 'zod';
import type { DefiProtocol, ServiceResult } from '../core/types';
export interface DefiProvider { protocols(): Promise<ServiceResult<DefiProtocol[]>> }
export function createDefiService(provider: DefiProvider) {
  return { async getProtocols(limit = 50): Promise<ServiceResult<DefiProtocol[]>> {
    z.number().int().min(1).max(100).parse(limit);
    const result = await provider.protocols();
    if (!result.ok) return result;
    return { ...result, data: [...result.data].sort((a, b) => (b.tvlUsd ?? -1) - (a.tvlUsd ?? -1)).slice(0, limit) };
  } };
}
