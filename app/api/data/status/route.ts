import { NextResponse } from 'next/server';
import { getServices } from '@/services/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET() {
  try { return NextResponse.json({ scope: 'process-local', providers: getServices().status() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Invalid service configuration' }, { status: 500, headers: { 'Cache-Control': 'no-store' } }); }
}
