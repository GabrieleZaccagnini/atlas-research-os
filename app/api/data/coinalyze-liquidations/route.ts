import { NextResponse } from 'next/server';
import { parseCoinalyzeHistory } from '@/lib/liquidations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const symbol = 'BTCUSDT_PERP.A';

async function coinalyze(path: string, params: Record<string, string>, key: string, revalidate: number): Promise<unknown> {
  const url = new URL(`https://api.coinalyze.net/v1/${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, { headers: { api_key: key }, next: { revalidate }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Coinalyze returned ${response.status}`);
  return response.json();
}

export async function GET() {
  const key = process.env.COINALYZE_API_KEY?.trim();
  if (!key) return NextResponse.json({ status: 'missing_key', message: 'Coinalyze API key is not configured.' }, { status: 503 });
  try {
    const markets = await coinalyze('future-markets', {}, key, 86400);
    if (!Array.isArray(markets) || !markets.some(market => market && typeof market === 'object' && market.symbol === symbol &&
      ['A', 'BINANCE'].includes(String(market.exchange).toUpperCase()) && market.base_asset === 'BTC' && market.quote_asset === 'USDT' && market.is_perpetual === true)) {
      throw new Error('Coinalyze BTCUSDT market mapping could not be verified');
    }
    const closedHour = Math.floor(Date.now() / 3_600_000) * 3_600;
    const history = await coinalyze('liquidation-history', {
      symbols: symbol, interval: '1hour', from: String(closedHour - 30 * 86400), to: String(closedHour - 1), convert_to_usd: 'true',
    }, key, 3600);
    const points = parseCoinalyzeHistory(history);
    return NextResponse.json({ source: 'Coinalyze', symbol, interval: '1hour', unit: 'USD', fetchedAt: new Date().toISOString(), points },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' } });
  } catch {
    return NextResponse.json({ status: 'unavailable', message: 'Coinalyze liquidation history is unavailable or the BTCUSDT mapping could not be verified.' }, { status: 502 });
  }
}
