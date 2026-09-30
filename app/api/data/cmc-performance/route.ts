import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// A bounded request for the current ranked universe; no arbitrary IDs/times/URLs.
export async function GET() { return serviceResponse(() => getServices().cmc.performance()); }
