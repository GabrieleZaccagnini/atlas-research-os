import { NextResponse } from 'next/server';
import { alignVolumeBars, parseVolumeKlines, volumeHistoryHours, volumeHourMs, type SpotPerpVolume } from '@/lib/spot-perp-volume';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function binanceVolume(origin: string, path: string, from: number, through: number, closedBefore: number) {
  const url = new URL(path, origin);
  url.searchParams.set('symbol', 'BTCUSDT');
  url.searchParams.set('interval', '1h');
  url.searchParams.set('startTime', String(from));
  url.searchParams.set('endTime', String(through + volumeHourMs - 1));
  url.searchParams.set('limit', String(volumeHistoryHours));
  const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Binance volume returned ${response.status}`);
  return parseVolumeKlines(await response.json(), closedBefore);
}

export async function GET() {
  const closedBefore = Math.floor(Date.now() / volumeHourMs) * volumeHourMs;
  const from = closedBefore - volumeHistoryHours * volumeHourMs;
  const through = closedBefore - volumeHourMs;
  try {
    const [spot, perp] = await Promise.all([
      binanceVolume('https://data-api.binance.vision', '/api/v3/klines', from, through, closedBefore),
      binanceVolume('https://fapi.binance.com', '/fapi/v1/klines', from, through, closedBefore),
    ]);
    const points = alignVolumeBars(spot, perp, from, through);
    if (!points.length) throw new Error('No matched Binance volume bars');
    const result: SpotPerpVolume = {
      source: 'Binance', symbol: 'BTCUSDT', spotMarket: 'Spot', perpMarket: 'USDⓈ-M perpetual',
      unit: 'USDT traded quote volume', interval: '1h', from, through, fetchedAt: new Date().toISOString(),
      expectedHours: volumeHistoryHours, matchedHours: points.length, points,
    };
    return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });
  } catch {
    return NextResponse.json({ error: 'Matched BTCUSDT spot and perpetual volume is unavailable right now.' }, { status: 502 });
  }
}
