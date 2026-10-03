import { serviceResponse } from '@/services/core/response';
import { getServices } from '@/services/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return serviceResponse(() => getServices().coindar.upcoming());
}
