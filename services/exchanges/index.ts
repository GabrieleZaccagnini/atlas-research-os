import { slug, pageNumber } from '../core/validation';
import type { ExchangePage, ServiceResult } from '../core/types';
export interface ExchangeProvider { list(id: string, page: number): Promise<ServiceResult<ExchangePage>> }
export function createExchangeService(provider: ExchangeProvider) {
  return { getMarkets(id: string, page = 1) { return provider.list(slug.parse(id), pageNumber.parse(page)); } };
}
