import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ranges = { '1y': '1year', '3y': '3years', all: 'all' } as const;
type Point = { x: number; y: number };

async function chart(name: string, timespan: string): Promise<Point[]> {
  const url = new URL(`https://api.blockchain.info/charts/${name}`);
  url.searchParams.set('timespan', timespan);
  url.searchParams.set('rollingAverage', '7days');
  url.searchParams.set('format', 'json');
  // Sampled series can choose different dates and silently lose the latest overlap.
  url.searchParams.set('sampled', 'false');
  const response = await fetch(url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Blockchain.com returned ${response.status}`);
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || !('values' in body) || !Array.isArray(body.values)) throw new Error('Invalid Blockchain.com chart response');
  const values = body.values.filter((point: unknown): point is Point =>
    !!point && typeof point === 'object' && 'x' in point && 'y' in point &&
    typeof point.x === 'number' && Number.isFinite(point.x) &&
    typeof point.y === 'number' && Number.isFinite(point.y) && point.y > 0);
  if (!values.length || values.length > 10000) throw new Error('Unexpected Blockchain.com chart length');
  return values;
}

export async function GET(request: Request) {
  const range = new URL(request.url).searchParams.get('range') ?? '1y';
  if (!(range in ranges)) return NextResponse.json({ error: 'Choose 1y, 3y, or all.' }, { status: 400 });
  try {
    const timespan = ranges[range as keyof typeof ranges];
    const [hashRate, price] = await Promise.all([chart('hash-rate', timespan), chart('market-price', timespan)]);
    const prices = new Map(price.map(point => [point.x, point.y]));
    const points = hashRate.flatMap(point => {
      const priceUsd = prices.get(point.x);
      return priceUsd === undefined ? [] : [{ date: new Date(point.x * 1000).toISOString().slice(0, 10), hashRateEhs: point.y / 1_000_000, priceUsd }];
    }).sort((a, b) => a.date.localeCompare(b.date));
    if (!points.length) throw new Error('Blockchain.com series did not share dates');
    const stride = range === 'all' ? Math.max(1, Math.ceil(points.length / 1000)) : 1;
    const displayed = stride === 1 ? points : points.filter((_, index) => index % stride === 0 || index === points.length - 1);
    return NextResponse.json({ source: 'Blockchain.com', average: '7 days', points: displayed }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=21600' } });
  } catch {
    return NextResponse.json({ error: 'Blockchain.com mining history is unavailable right now.' }, { status: 502 });
  }
}
