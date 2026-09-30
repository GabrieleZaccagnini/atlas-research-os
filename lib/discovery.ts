export const discoverySources = ['coingecko', 'coinmarketcap', 'coinpaprika'] as const;
export const discoveryKinds = ['trending', 'most-visited', 'new'] as const;
export type DiscoverySource = typeof discoverySources[number];
export type DiscoveryKind = typeof discoveryKinds[number];
export interface DiscoveryItem {
  id: string; name: string; symbol: string; href: string;
  marketRank: number | null; price: number | null; change24h: number | null;
  addedAt: string | null; active: boolean | null;
}
export interface DiscoverySnapshot { items: DiscoveryItem[]; total: number }
export const discoveryNames: Record<DiscoverySource, string> = { coingecko: 'CoinGecko', coinmarketcap: 'CoinMarketCap', coinpaprika: 'CoinPaprika' };
export const discoveryLabels: Record<DiscoveryKind, string> = { trending: 'Trending', 'most-visited': 'Most visited', new: 'Newly added' };
export function discoveryCoverage(source: DiscoverySource, kind: DiscoveryKind): { access: 'available' | 'paid' | 'unverified'; description: string; url: string } {
  if (source === 'coingecko') {
    if (kind === 'trending') return { access: 'available', description: 'Most searched coins over 24h · provider order.', url: 'https://www.coingecko.com/en/highlights/trending-crypto' };
    if (kind === 'new') return { access: 'paid', description: 'The dedicated recently added coins API requires paid CoinGecko access.', url: 'https://www.coingecko.com/en/new-cryptocurrencies' };
    return { access: 'unverified', description: 'A separate CoinGecko most-visited coin API has not been verified.', url: 'https://www.coingecko.com/en/highlights' };
  }
  if (source === 'coinmarketcap') {
    if (kind === 'new') return { access: 'available', description: 'Up to 50 recent additions from the regular listings feed · newest date first within the returned snapshot.', url: 'https://coinmarketcap.com/new/' };
    return { access: 'paid', description: `CMC’s dedicated ${kind === 'trending' ? 'search trending' : 'page traffic'} API requires Startup or above.`, url: kind === 'trending' ? 'https://coinmarketcap.com/trending-cryptocurrencies/' : 'https://coinmarketcap.com/most-viewed-pages/' };
  }
  if (kind === 'new') return { access: 'available', description: 'Added to CoinPaprika within five days · active coins first, then market rank. Prices are not included in this feed.', url: 'https://coinpaprika.com/highlights/' };
  return { access: 'unverified', description: `CoinPaprika shows ${kind === 'trending' ? 'trending' : 'most-visited'} coins on its website; a supported API for this ranking has not been verified.`, url: 'https://coinpaprika.com/highlights/' };
}
