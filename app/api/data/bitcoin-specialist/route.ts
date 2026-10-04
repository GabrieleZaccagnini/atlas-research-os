import { NextResponse } from 'next/server';
import { parseSpecialistHistory, specialistViews, type SpecialistView } from '@/lib/specialist-feeds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const view = new URL(request.url).searchParams.get('view');
  if (!specialistViews.includes(view as SpecialistView)) return NextResponse.json({ error: 'Unknown specialist view.' }, { status: 400 });
  try {
    const response = await fetch(`https://bitcoin-data.com/v1/${view}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`BGeometrics returned ${response.status}`);
    const result = parseSpecialistHistory(await response.json(), view as SpecialistView);
    return NextResponse.json({ view, source: 'BGeometrics', ...result }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'This BGeometrics series is temporarily unavailable or rate limited.' }, { status: 502 });
  }
}
