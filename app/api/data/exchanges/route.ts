import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return serviceResponse(() => getServices().exchanges.getMarkets(params.get('id') ?? '', Number(params.get('page') ?? '1')));
}
