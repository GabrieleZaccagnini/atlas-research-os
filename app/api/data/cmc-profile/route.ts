import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return serviceResponse(() => getServices().cmc.profile(new URL(request.url).searchParams.get('id') ?? ''));
}
