import { z } from 'zod';
import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return serviceResponse(() => {
    const provider = z.enum(['coingecko', 'coinpaprika', 'coinmarketcap', 'auto']).parse(new URL(request.url).searchParams.get('provider') ?? 'coingecko');
    if (provider === 'auto') return getServices().globalOverview();
    if (provider === 'coinmarketcap') return getServices().cmc.global();
    return (provider === 'coinpaprika' ? getServices().publicMarket : getServices().market).getGlobal();
  });
}
