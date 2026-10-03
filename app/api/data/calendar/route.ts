import { z } from 'zod';
import { serviceResponse } from '@/services/core/response';
import { getServices } from '@/services/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  return serviceResponse(() => {
    const source = z.enum(['bea', 'fomc', 'bls']).parse(new URL(request.url).searchParams.get('source'));
    return source === 'bls' ? getServices().blsCalendar.get() : getServices().calendar.get(source);
  });
}
