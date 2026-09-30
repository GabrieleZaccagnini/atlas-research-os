'use client';
import type { CmcSentiment, AltcoinSeason } from '@/services/intelligence/types';
import { useFeed } from './use-feed';
import { Panel, FeedNote } from './panels';
export function CmcSentimentPanel({ revision }: { revision: number }) {
  const sentiment = useFeed<CmcSentiment>('/api/data/intelligence?feed=cmcSentiment', revision, 1500);
  const altseason = useFeed<AltcoinSeason>('/api/data/intelligence?feed=altseason', revision, 3000);
  const fear = sentiment.data; const alt = altseason.data;
  return <Panel title="Sentiment & breadth" href="/market-cycle" label="CoinMarketCap">
    <div className="space-y-3 px-4 pb-3">
      <div className="rounded-xl bg-secondary/35 p-3"><div className="flex justify-between text-[10px] text-muted-foreground"><span>CMC Crypto Fear & Greed</span><span>{fear?.label ?? (sentiment.loading ? 'Loading…' : 'Unavailable')}</span></div><p className="mt-1 text-2xl font-semibold tabular-nums">{fear?.value ?? '—'}<span className="text-xs font-normal text-muted-foreground"> / 100</span></p><div className="relative mt-3 h-1.5 rounded-full bg-gradient-to-r from-destructive via-warning to-success">{fear && <span className="absolute -top-1 h-3.5 w-1 rounded border border-card bg-foreground" style={{ left: `${Math.min(99, fear.value)}%` }} />}</div></div>
      <div className="rounded-xl bg-secondary/35 p-3"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Altcoin Season</span><span className="font-semibold tabular-nums">{alt?.value ?? '—'} / 100</span></div><p className="mt-1 text-[10px] text-muted-foreground">{alt ? alt.value >= 75 ? 'Altcoin season threshold met' : alt.value <= 25 ? 'Bitcoin season threshold met' : 'Between season thresholds' : altseason.loading ? 'Loading…' : 'Unavailable'}</p></div>
    </div>
    <FeedNote feed={sentiment} source="CMC · Crypto Fear & Greed" url="https://coinmarketcap.com/charts/fear-and-greed-index/" observed={fear?.observedAt} />
    <FeedNote feed={altseason} source="CMC · Altcoin Season Index" url="https://coinmarketcap.com/charts/altcoin-season-index/" observed={alt?.observedAt} />
  </Panel>;
}
