import { NextResponse } from 'next/server';
import { buildCycleView, cycleViews, type CycleView, type DailyPoint } from '@/lib/bitcoin-cycle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SourcePoint = { x: number; y: number };

async function chart(name: string): Promise<SourcePoint[]> {
  const url = new URL(`https://api.blockchain.info/charts/${name}`);
  url.searchParams.set('timespan', 'all');
  url.searchParams.set('sampled', 'false');
  url.searchParams.set('format', 'json');
  const response = await fetch(url, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${name} returned ${response.status}`);
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || !('values' in body) || !Array.isArray(body.values)) throw new Error(`Invalid ${name} response`);
  const values = body.values.filter((point: unknown): point is SourcePoint =>
    !!point && typeof point === 'object' && 'x' in point && 'y' in point &&
    typeof point.x === 'number' && Number.isFinite(point.x) &&
    typeof point.y === 'number' && Number.isFinite(point.y) && point.y > 0);
  if (values.length < 366 || values.length > 12000) throw new Error(`Unexpected ${name} coverage`);
  return values;
}

async function blockHeight(): Promise<number | undefined> {
  try {
    const response = await fetch('https://api.blockchain.info/stats', { next: { revalidate: 1800 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return undefined;
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'n_blocks_total' in body && typeof body.n_blocks_total === 'number' && Number.isFinite(body.n_blocks_total)) return body.n_blocks_total;
  } catch { /* Historical chart still works without a live height. */ }
  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const view = url.searchParams.get('view') ?? 'reward-era';
  if (!cycleViews.includes(view as CycleView)) return NextResponse.json({ error: 'Unknown Bitcoin cycle view.' }, { status: 400 });
  const era = Number(url.searchParams.get('era') ?? 2020);
  if (view === 'cycle-repeat' && ![2012, 2016, 2020].includes(era)) return NextResponse.json({ error: 'Choose a completed halving era.' }, { status: 400 });
  try {
    const needsHash = view === 'hash-ribbons';
    const needsRevenue = view === 'puell';
    const [price, hash, revenue, height] = await Promise.all([
      chart('market-price'),
      needsHash ? chart('hash-rate') : Promise.resolve([]),
      needsRevenue ? chart('miners-revenue') : Promise.resolve([]),
      view === 'halving-progress' ? blockHeight() : Promise.resolve(undefined),
    ]);
    const key = (x: number) => new Date(x * 1000).toISOString().slice(0, 10);
    const hashes = new Map(hash.map(point => [key(point.x), point.y / 1_000_000]));
    const revenues = new Map(revenue.map(point => [key(point.x), point.y]));
    const daily: DailyPoint[] = price.map(point => {
      const date = key(point.x);
      return { date, priceUsd: point.y, hashRateEhs: hashes.get(date), minerRevenueUsd: revenues.get(date) };
    });
    const result = buildCycleView(daily, view as CycleView, era, height);
    return NextResponse.json({ view, source: 'Blockchain.com Charts API', ...result }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=21600' } });
  } catch {
    return NextResponse.json({ error: 'Bitcoin cycle history is unavailable or incomplete right now.' }, { status: 502 });
  }
}
