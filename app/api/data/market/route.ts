import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get('ids') ?? 'bitcoin,ethereum';
  return serviceResponse(() => getServices().market.getQuotes(ids.split(',')));
}
