export type TrendDirection = 'up' | 'down' | 'flat';

export interface AssetPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
}

export interface MarketStatus {
  label: string;
  sentiment: 'risk-on' | 'risk-off' | 'neutral';
  fearGreedIndex: number;
  fearGreedLabel: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NarrativeItem {
  id: string;
  title: string;
  description: string;
  momentum: number;
  trend: TrendDirection;
  mentions24h: number;
  changeMentions: number;
  topProjects: string[];
  category: string;
  age: string;
}

export interface ProjectResearchItem {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  rank: number;
  marketCap: number;
  price: number;
  change24h: number;
  conviction: 'high' | 'medium' | 'low' | 'none';
  status: 'researching' | 'watching' | 'conviction' | 'archived';
  tags: string[];
  lastUpdated: string;
  summary: string;
}

export interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  alerts: number;
}

export interface ConvictionItem {
  id: string;
  name: string;
  symbol: string;
  thesis: string;
  convictionScore: number;
  entryZone: string;
  target: string;
  stopLoss: string;
  positionSize: string;
  timeframe: string;
  status: 'open' | 'closed' | 'watching';
  pnl: number;
  category: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  type: 'analysis' | 'trade-log' | 'observation' | 'thesis';
  tags: string[];
  excerpt: string;
  author: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  url: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'mainnet' | 'token-unlock' | 'governance' | 'earnings' | 'upgrade' | 'listing';
  project: string;
  importance: 'high' | 'medium' | 'low';
}

export interface MarketCyclePhase {
  phase: string;
  description: string;
  position: number;
  startDate: string;
  indicators: {
    label: string;
    value: string;
    status: 'bullish' | 'bearish' | 'neutral';
  }[];
}

export interface MacroIndicator {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: TrendDirection;
  description: string;
  category: string;
  sparkline: number[];
}

export interface AIResearchSession {
  id: string;
  query: string;
  status: 'completed' | 'in-progress' | 'queued';
  summary: string;
  sources: number;
  date: string;
}
