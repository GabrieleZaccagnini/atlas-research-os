import { NextResponse } from 'next/server';
import { parseMarginClusters, parseMarginEvents, parseMarginRecent } from '@/lib/specialist-feeds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function provider(path: string): Promise<unknown> {
  const response = await fetch(`https://marginpad.io/api/v1/${path}`, {
    next: { revalidate: 60 }, signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`MarginPad returned ${response.status}`);
  return response.json();
}

export async function GET() {
  const [recent, clusters, events, quote] = await Promise.allSettled([
    provider('liquidations/recent?symbol=BTC&minutes=1440'),
    provider('clusters?symbol=BTC'),
    provider('liquidations/live?symbol=BTC&limit=30'),
    provider('price?symbol=BTC'),
  ]);
  let observed: ReturnType<typeof parseMarginRecent> | null = null;
  let modeled: ReturnType<typeof parseMarginClusters> | null = null;
  let latestEvents: ReturnType<typeof parseMarginEvents> = [];
  let spotUsd: number | null = null;
  try { if (recent.status === 'fulfilled') observed = parseMarginRecent(recent.value); } catch { /* The other independent panels may still work. */ }
  try { if (clusters.status === 'fulfilled') modeled = parseMarginClusters(clusters.value); } catch { /* The other independent panels may still work. */ }
  try { if (events.status === 'fulfilled') latestEvents = parseMarginEvents(events.value); } catch { /* The other independent panels may still work. */ }
  if (quote.status === 'fulfilled' && quote.value && typeof quote.value === 'object' && 'ok' in quote.value && quote.value.ok === true &&
    'data' in quote.value && quote.value.data && typeof quote.value.data === 'object' && 'symbol' in quote.value.data && quote.value.data.symbol === 'BTC' &&
    'price' in quote.value.data && typeof quote.value.data.price === 'number' && Number.isFinite(quote.value.data.price) && quote.value.data.price > 0) spotUsd = quote.value.data.price;
  if (!observed && !modeled && !latestEvents.length) return NextResponse.json({ status: 'unavailable', message: 'MarginPad liquidation data is unavailable.' }, { status: 502 });
  return NextResponse.json({ source: 'MarginPad', symbol: 'BTC', observed, modeled, latestEvents, spotUsd }, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' },
  });
}
