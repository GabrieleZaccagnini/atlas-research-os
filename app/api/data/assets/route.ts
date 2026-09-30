import { z } from 'zod';
import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// One shared, five-minute snapshot; a search does not fan out to one call per asset.
export async function GET(request: Request) {
  return serviceResponse(() => {
    const provider = z.enum(['coinpaprika', 'coinmarketcap']).parse(new URL(request.url).searchParams.get('provider') ?? 'coinpaprika');
    return provider === 'coinmarketcap' ? getServices().cmc.listings() : getServices().discovery.assets();
  });
}
