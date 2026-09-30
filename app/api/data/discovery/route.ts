import { z } from 'zod';
import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
import { discoverySources, discoveryKinds } from '@/lib/discovery';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return serviceResponse(async () => {
    const q = new URL(request.url).searchParams;
    const source = z.enum(discoverySources).parse(q.get('source') ?? 'coingecko');
    const kind = z.enum(discoveryKinds).parse(q.get('kind') ?? 'trending');
    return getServices().discoveryLists.list(source, kind);
  });
}
