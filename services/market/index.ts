import { z } from 'zod';
import { slug } from '../core/validation';
import type { MarketQuote, GlobalMarket, ServiceResult } from '../core/types';
export interface MarketProvider {
  quotes(ids: string[]): Promise<ServiceResult<MarketQuote[]>>;
  global(): Promise<ServiceResult<GlobalMarket>>;
}
export function createMarketService(provider: MarketProvider, idSchema: z.ZodType<string> = slug) {
  return {
    getQuotes(ids: string[]) { return provider.quotes(Array.from(new Set(z.array(idSchema).min(1).max(25).parse(ids))).sort()); },
    getGlobal() { return provider.global(); },
  };
}
