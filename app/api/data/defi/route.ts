import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const limit = Number(new URL(request.url).searchParams.get('limit') ?? '50');
  return serviceResponse(() => getServices().defi.getProtocols(limit));
}
