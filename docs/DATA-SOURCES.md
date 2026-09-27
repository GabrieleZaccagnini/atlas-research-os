# Atlas candidate data-source map

This preserves the final conversation map, including Exchange & Liquidity Intelligence. Provider order describes the candidate architecture, not active routing or verified free-tier availability. Only the narrow capabilities in the final column are implemented; all other integrations remain planned. CoinGecko is the initial market adapter while CoinMarketCap remains the planned primary. No paid endpoints are enabled.

| Domain | Candidate sources (primary first; alternatives/later follow) | Implemented now |
|---|---|---|
| market | CoinMarketCap, CoinGecko, CoinStats, CoinPaprika | CoinGecko quotes |
| global | CoinMarketCap, CoinGecko | CoinGecko global metrics |
| sentiment | CoinMarketCap, cryptocurrency.cv, LunarCrush, Santiment | Planned |
| candles | Mobula, Binance, CoinGecko | Planned |
| charts | TradingView | Planned |
| technical | altFINS, Atlas | Planned |
| dex | DexScreener, Mobula, CoinMarketCap DEX | DexScreener token pools |
| projects | RootData, CoinMarketCap, CoinGecko, TokenInsight, Messari | Planned |
| ratings | TokenInsight, RootData, Messari | Planned |
| tokenomics | Mobula, CoinMarketCap, CoinGecko, manual | Planned |
| sales | manual CryptoRank/ICO Drops, RootData, Mobula, Dropstab | Planned |
| funding | RootData, manual CryptoRank, Dropstab, Messari | Planned |
| investors | RootData, TokenInsight, CryptoRank, Dropstab | Planned |
| unlocks | Mobula, manual, Apify, Dropstab, CryptoRank, Messari | Planned |
| defi | DefiLlama, Dune, Token Terminal | DefiLlama protocol TVL |
| stablecoins | DefiLlama, Dune, Glassnode | Planned |
| flows | DefiLlama, Dune, Mobula, Nansen | Planned |
| onchain | Mobula, Dune, CoinMarketCap DEX, Glassnode, Nansen, Arkham | Planned |
| rpc | Alchemy, native RPC | Planned |
| wallets | Mobula, Dune, Arkham, Nansen | Planned |
| derivatives | Binance, Mobula, exchange APIs, CoinGlass | Planned |
| news | cryptocurrency.cv, RSS, TokenInsight, CoinGecko News, Messari | Planned |
| social | Reddit, Atlas news-volume, CoinGecko, LunarCrush, Santiment, X | Planned |
| search | Google Trends (access conditional), manual | Planned |
| developer | GitHub | Planned |
| calendar | RootData, CoinMarketCal, manual, news, Dropstab, CryptoRank | Planned |
| macroCalendar | FRED, official calendars, manual, Trading Economics | Planned |
| macro | FRED, World Bank, Trading Economics | Planned |
| globalMarkets | Twelve Data, Alpha Vantage, TradingView charts | Planned |
| geopolitics | GDELT, Stabilarity | Planned |
| regulation | GDELT, news, official sources, manual, Messari | Planned |
| rwa | CoinMarketCap RWA, RootData | Planned |
| security | Mobula, CoinMarketCap DEX, CoinStats | Planned |
| portfolio | CoinStats, Mobula, Atlas manual holdings, Nansen | Planned |
| listingEvents | calendar, news, exchange APIs, manual, Dropstab, CryptoRank | Planned |
| exchanges | CoinGecko, CCXT, DexScreener | CoinGecko paginated tickers |
| liquidity | CCXT order books, DexScreener pools, Atlas calculations | Returned-pool summary only |
| watchlists | Atlas database | Planned |
| research | Atlas database | Planned |
| alerts | Atlas | Planned |
| cycle | Atlas, market data, Glassnode | Planned |
| narratives | Atlas, DexScreener, news tagging, LunarCrush, Messari | Planned |
| setups | Atlas, altFINS | Planned |
| ai | future LLM API | Planned |

## First provider slice and references

- [CoinGecko Demo market data](https://docs.coingecko.com/demo/reference/coins-markets) and [tickers](https://docs.coingecko.com/demo/reference/coins-id-tickers): free Demo key required by documented interface. Listings include CEX and DEX; no unsupported inference about venue type or order-book depth.
- [DexScreener reference](https://docs.dexscreener.com/api/reference): token-pairs endpoint; no key. Token lookup returns pool data, not executable slippage quotes.
- [DefiLlama API documentation](https://api-docs.defillama.com/): public protocol TVL endpoint. Other datasets remain planned.

Checked 2026-09-27. Rate controls are conservative local budgets, not promises about provider quotas. Evaluate terms, attribution, access tiers and schemas again when implementing each future provider. The conversation's specific credit counts and premium endpoint availability are not treated as verified configuration.

## Next incremental slices

1. Wire a single market widget to these contracts with loading, unavailable and stale states while preserving its appearance.
2. Add CoinMarketCap quotes behind a server-only key, explicit identity mapping, and contract-compatible fallback to CoinGecko.
3. Add CCXT for an allowlisted set of read-only CEX order books, with quote currency conversion, depth coverage and timestamps. Keep DEX reserves separate.
4. Add RootData fundamentals/funding, then Mobula and altFINS endpoint by endpoint after checking free access and response fixtures.
5. Add news/RSS, FRED/global markets and calendar domains, then intelligence calculations and durable user-owned research/watchlists.

Charts remain a display integration, separate from raw OHLCV. Project-specific and narrative news are Atlas tagging over normalized news. Upcoming listing events are distinct from current exchange markets. AI, execution-depth simulation and premium integrations are deferred.
