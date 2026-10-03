import { NextResponse } from 'next/server';
import { parseCurrentOpenInterest, parseFundingHistory, parseOpenInterestHistory, type BtcDerivatives } from '@/lib/btc-derivatives';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function binance(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`https://fapi.binance.com${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Binance returned ${response.status}`);
  return response.json();
}

export async function GET() {
  const [current, openInterest, funding] = await Promise.allSettled([
    binance('/fapi/v1/openInterest', { symbol: 'BTCUSDT' }).then(parseCurrentOpenInterest),
    binance('/futures/data/openInterestHist', { symbol: 'BTCUSDT', period: '1d', limit: '30' }).then(parseOpenInterestHistory),
    binance('/fapi/v1/fundingRate', { symbol: 'BTCUSDT', limit: '90' }).then(parseFundingHistory),
  ]);
  const unavailable = [
    current.status === 'rejected' ? 'Current open interest' : null,
    openInterest.status === 'rejected' ? 'Open-interest history' : null,
    funding.status === 'rejected' ? 'Funding history' : null,
  ].filter((value): value is string => value !== null);
  if (unavailable.length === 3) return NextResponse.json({ error: 'Binance BTC derivatives data is unavailable right now.' }, { status: 502 });
  const data: BtcDerivatives = {
    source: 'Binance USDⓈ-M Futures', symbol: 'BTCUSDT', fetchedAt: new Date().toISOString(),
    currentOpenInterest: current.status === 'fulfilled' ? current.value : null,
    openInterestHistory: openInterest.status === 'fulfilled' ? openInterest.value : [],
    fundingHistory: funding.status === 'fulfilled' ? funding.value : [], unavailable,
  };
  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } });
}
