import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return serviceResponse(() => getServices().dex.getPools(params.get('chain') ?? '', params.get('address') ?? ''));
}
