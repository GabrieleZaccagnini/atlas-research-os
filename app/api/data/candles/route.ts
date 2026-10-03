import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  return serviceResponse(() => getServices().candles.get(q.get('market'), q.get('interval')));
}
