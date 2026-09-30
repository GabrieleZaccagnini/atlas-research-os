import { z } from 'zod';
import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return serviceResponse(() => {
    const params = new URL(request.url).searchParams;
    const provider = z.enum(['coingecko', 'coinpaprika']).parse(params.get('provider') ?? 'coingecko');
    const ids = params.get('ids') ?? (provider === 'coinpaprika' ? 'btc-bitcoin,eth-ethereum' : 'bitcoin,ethereum');
    return (provider === 'coinpaprika' ? getServices().publicMarket : getServices().market).getQuotes(ids.split(','));
  });
}
