export interface SeriesPoint { date: string; value: number }
export const macroSeries = {
  DGS10: { name: 'US 10Y yield', unit: '%', frequency: 'Daily', source: 'US Treasury via FRED' },
  DGS2: { name: 'US 2Y yield', unit: '%', frequency: 'Daily', source: 'US Treasury via FRED' },
  VIXCLS: { name: 'VIX', unit: 'index', frequency: 'Daily close', source: 'Cboe via FRED' },
  DTWEXBGS: { name: 'US dollar · broad', unit: 'index', frequency: 'Daily', source: 'Federal Reserve via FRED' },
  SP500: { name: 'S&P 500', unit: 'index', frequency: 'Daily close', source: 'S&P Dow Jones Indices via FRED' },
  DCOILWTICO: { name: 'WTI crude oil', unit: 'USD / barrel', frequency: 'Daily', source: 'EIA via FRED' },
  M2SL: { name: 'US M2 money supply', unit: 'USD billions', frequency: 'Monthly · seasonally adjusted', source: 'Federal Reserve via FRED' },
  PCEPI: { name: 'US headline PCE', unit: 'index 2017=100', frequency: 'Monthly · seasonally adjusted', source: 'BEA via FRED' },
  PCEPILFE: { name: 'US core PCE', unit: 'index 2017=100', frequency: 'Monthly · seasonally adjusted', source: 'BEA via FRED' },
  CPIAUCSL: { name: 'US headline CPI', unit: 'index 1982–84=100', frequency: 'Monthly · seasonally adjusted', source: 'BLS via FRED' },
  UNRATE: { name: 'US unemployment', unit: '%', frequency: 'Monthly · seasonally adjusted', source: 'BLS via FRED' },
  DFII10: { name: 'US 10Y real yield', unit: '%', frequency: 'Daily', source: 'US Treasury via FRED' },
  DCOILBRENTEU: { name: 'Brent crude oil · spot', unit: 'USD / barrel', frequency: 'Daily', source: 'EIA via FRED' },
  DHHNGSP: { name: 'Henry Hub gas · spot', unit: 'USD / MMBtu', frequency: 'Daily', source: 'EIA via FRED' },
  FEDFUNDS: { name: 'Effective federal funds', unit: '%', frequency: 'Monthly average', source: 'Federal Reserve via FRED' },
} as const;
export type MacroId = keyof typeof macroSeries;
export interface MacroSeries { id: MacroId; points: SeriesPoint[] }
export interface ChainSnapshot { name: string; tvlUsd: number | null }
export interface RevenueRow { name: string; slug: string; category: string | null; kind: string | null; revenue24h: number | null; revenue7d: number | null; change24h: number | null }
export interface DexActivity { volume24h: number | null; change24h: number | null; venues: { name: string; volume24h: number | null }[] }
export interface StablecoinSupply { points: SeriesPoint[] }
export interface Sentiment { points: { date: string; value: number; label: string }[] }
export interface NewsItem { title: string; url: string; publishedAt: string; source: 'CoinDesk' | 'Federal Reserve' | 'Cointelegraph' | 'ECB'; categories: string[] }

export interface TrendingCoin { id: string; name: string; symbol: string; rank: number | null; price: number | null; change24h: number | null }

export interface CmcSentiment { value: number; label: string; observedAt: string }
export interface AltcoinSeason { value: number; observedAt: string; yearlyHigh: number | null; yearlyLow: number | null }
export const newsSources = { coindesk: { name: 'CoinDesk', host: 'coindesk.com', path: 'arc/outboundfeeds/rss', category: 'crypto' }, cointelegraph: { name: 'Cointelegraph', host: 'cointelegraph.com', path: 'rss', category: 'crypto' }, federalreserve: { name: 'Federal Reserve', host: 'federalreserve.gov', path: 'feeds/press_monetary.xml', category: 'policy' }, ecb: { name: 'ECB', host: 'ecb.europa.eu', path: 'rss/press.html', category: 'policy' } } as const;
export type NewsSourceId = keyof typeof newsSources;
