# Atlas candidate data-source map

This preserves the final conversation map, including Exchange & Liquidity Intelligence. Provider order describes the candidate architecture, not active routing or verified free-tier availability. Only the narrow capabilities in the final column are implemented; all other integrations remain planned. CMC now powers top-100 Discovery, token reference metadata, global totals and sentiment/altseason through verified public endpoints. CoinPaprika retains the wider discovery universe, saved asset mappings and personal quotes; existing CoinGecko adapters remain available when configured. No paid endpoints are enabled.

| Domain | Candidate sources (primary first; alternatives/later follow) | Implemented now |
|---|---|---|
| market | CoinMarketCap, CoinGecko, CoinStats, CoinPaprika | CMC top-100 ranked discovery and reference quotes; CoinPaprika wider discovery/personal quotes; CoinGecko when configured |
| global | CoinMarketCap, CoinGecko, CoinPaprika | CMC global metrics, lazy CoinPaprika fallback; CoinGecko separately when configured |
| sentiment | Alternative.me, CoinMarketCap, cryptocurrency.cv, LunarCrush, Santiment | CMC Crypto Fear & Greed and Altcoin Season; Alternative.me Bitcoin history separately |
| candles | Mobula, Binance, CoinGecko | Planned |
| charts | TradingView display; owned chart engine + permitted history later | External embeds on detail/Charts pages for crypto indices and explicit Binance spot pairs; no dashboard embeds; raw history/drawing persistence planned |
| technical | altFINS, Atlas | Planned |
| dex | DexScreener, Mobula, CoinMarketCap DEX | DexScreener token pools |
| projects | RootData, CoinMarketCap, CoinGecko, CoinPaprika, TokenInsight, Messari | CMC ID-based reference description/links/tags; CoinPaprika on-demand profile and reported team |
| ratings | TokenInsight, RootData, Messari | Planned |
| tokenomics | Mobula, CoinMarketCap, CoinGecko, manual | CMC reference circulating/total/max supply and FDV; allocation/vesting/unlocks planned |
| sales | manual CryptoRank, ICO Analytics, ICO Drops; RootData, Mobula, Dropstab | External ICO Analytics and ICO Drops research links in project funding and CMC token details; no feed or automatic import |
| funding | RootData, manual ICO Analytics/ICO Drops/CryptoRank, Dropstab, Messari | External ICO Analytics and ICO Drops research links; structured funding records remain manual |
| investors | RootData, TokenInsight, CryptoRank, Dropstab | Manual investor names in funding records; provider enrichment planned |
| organizations | Official counterparty/project/university sources; RootData and other structured feeds where access supports relationship types | Planned; typed evidence-backed relationships, not logo associations |
| chainCapital | DefiLlama, RWA.xyz (access to verify), official issuer documents | DefiLlama current chain TVL rankings; RWA/access/history planned |
| unlocks | Mobula, manual, Apify, Dropstab, CryptoRank, Messari | Planned |
| defi | DefiLlama, Dune, Token Terminal | Protocol and chain TVL; covered venue volume including prediction markets |
| economics | DefiLlama, Token Terminal, official disclosures | Signed daily chain/protocol revenue rankings; costs/holder capture/history planned |
| stablecoins | DefiLlama, Dune, Glassnode | USD-valued aggregate supply history and seven-day change |
| flows | DefiLlama, Dune, Mobula, Nansen | Planned |
| onchain | Mobula, Dune, CoinMarketCap DEX, Glassnode, Nansen, Arkham | Planned |
| rpc | Alchemy, native RPC | Planned |
| wallets | Mobula, Dune, Arkham, Nansen | Planned |
| derivatives | CoinMarketCap, Binance, Mobula, exchange APIs, CoinGlass | CMC reported global 24h volume only; OI/funding/liquidations/ETF flows planned |
| news | CoinDesk/Fed RSS; CoinStats, cryptocurrency.cv, NewsData, APITube, Webz, CryptoPanic, NewsAPI, CoinGecko news (access to verify) | CoinDesk/Cointelegraph headlines and Fed/ECB communications |
| social | CMC mindshare access unverified; permitted X/Telegram, Reddit, Atlas news-volume, LunarCrush, Santiment | Planned |
| search | CoinGecko trending searches, Google Trends (access conditional), manual | CoinGecko most-searched coins; not social/X trends |
| developer | GitHub | Planned |
| calendar | CoinMarketCal, Coindar, official/manual, RootData, news, Dropstab, CryptoRank | Manual dated project catalysts; automated feeds planned |
| macroCalendar | Official calendars, manual, Finnhub, EODHD, Trading Economics (access to verify) | Planned |
| macro | FRED/BEA, official central banks/statistical agencies, BIS, ECB, PBoC, BoJ, OECD, World Bank, Trading Economics; CME/Kalshi access to verify | FRED US nominal/real yields, fed funds, US M2, headline/core PCE, headline CPI and unemployment; global/expectations planned |
| globalMarkets | FRED, Twelve Data, Alpha Vantage, TradingView | FRED daily VIX, broad USD index, S&P 500, WTI/Brent and Henry Hub spot gas observations |
| geopolitics | Official government/foreign-ministry readouts and calendars, GDELT, sourced news/RSS, Stabilarity | Planned; meetings, agreements, developments and implementation tracked separately |
| regulation | Official legal/customs/trade sources, WTO, USTR, EU institutions, country authorities, GDELT, news, manual, Messari | Planned; tariffs, trade measures, sanctions/export controls and effective dates |
| rwa | RWA.xyz (access/terms to verify), official issuers, CoinMarketCap RWA, RootData | Planned; separate distributed/represented value, stablecoins and access conditions |
| security | Mobula, CoinMarketCap DEX, CoinStats | Planned |
| portfolio | Atlas manual holdings, CoinStats, Mobula, Nansen | Manual position snapshots, priced subtotal and unrealized P&L; no account imports |
| listingEvents | calendar, news, exchange APIs, manual, Dropstab, CryptoRank | Planned |
| exchanges | CoinGecko, CCXT, DexScreener | CoinGecko paginated tickers |
| liquidity | CCXT order books, DexScreener pools, Atlas calculations | Returned-pool summary only |
| watchlists | Atlas database | Project statuses/Watchlist and Buy List views exist; distinct named lists and snapshot monitoring planned |
| research | Atlas database | Manual project dossiers, evidence fields and private cloud persistence integration; CoinPaprika profile reference plus review history; broader enrichment planned |
| alerts | Atlas | Planned |
| cycle | Atlas, market data, Glassnode | Planned |
| narratives | Atlas, DexScreener, news tagging, LunarCrush, Messari | Planned |
| setups | Atlas, altFINS | Planned |
| ai | future LLM API | Planned |

## First provider slice and references

- [CoinGecko Demo market data](https://docs.coingecko.com/demo/reference/coins-markets) and [tickers](https://docs.coingecko.com/demo/reference/coins-id-tickers): free Demo key required by documented interface. Listings include CEX and DEX; no unsupported inference about venue type or order-book depth.
- [DexScreener reference](https://docs.dexscreener.com/api/reference): token-pairs endpoint; no key. Token lookup returns pool data, not executable slippage quotes.
- [DefiLlama API documentation](https://api-docs.defillama.com/): public protocol TVL endpoint; additional verified endpoints are listed below.

Checked 2026-09-27. Rate controls are conservative local budgets, not promises about provider quotas. Evaluate terms, attribution, access tiers and schemas again when implementing each future provider. The conversation's specific credit counts and premium endpoint availability are not treated as verified configuration.

## Integration order and ownership

[ROADMAP.md](ROADMAP.md) owns the current build order; [BACKLOG.md](BACKLOG.md) tracks feature status. The earlier provider-first integration list is superseded by feature-driven slices. Start with the project overview and a single metadata endpoint after checking access; reuse existing market adapters. Extend macro, chain capital, exchange depth and other domains when their named research views are selected for work.

For each integration, record the exact endpoint/fields, identity mapping, units/definitions, access tier and terms, credential handling, refresh/cache policy, quota budget, failure behavior and source timestamps. Verify these at implementation time. A candidate provider or implemented adapter is not proof of a healthy configured connection. Free access is preferred when it supports the feature; no paid subscription is activated by this map.

Charts remain a display integration, separate from raw OHLCV. Project-specific and narrative news are Atlas tagging over normalized news. Upcoming listing events are distinct from current exchange markets. AI, execution-depth simulation and premium integrations remain separate planned capabilities.

## Daily-desk provider — checked 2026-09-28

CoinPaprika public API, no key or paid subscription configured:

- `GET https://api.coinpaprika.com/v1/tickers?quotes=USD`: one five-minute shared snapshot for search and explicit-ID quotes. Free response currently covers 2,000 assets; not the whole token universe. Stablecoins/wrappers are included. Missing supply/FDV stays null. IDs may legitimately begin with a hyphen.
- `GET https://api.coinpaprika.com/v1/global`: five-minute cache; market cap, 24h volume, BTC dominance and upstream observation timestamp. ETH dominance is unavailable in this adapter.
- `GET https://api.coinpaprika.com/v1/coins/{id}`: on-demand, 24-hour cache; source/retrieval date, description, safe links, tags and reported team. Exact identity must match. Applying a profile never overwrites personal research.
- Attribution links are visible. Free personal-use tier/access checked against [pricing](https://coinpaprika.com/api/pricing/), [tickers](https://docs.coinpaprika.com/api-reference/tickers/get-tickers-for-all-active-coins), [global](https://docs.coinpaprika.com/api-reference/global/get-market-overview-data) and [coin profile](https://docs.coinpaprika.com/api-reference/coins/get-coin-by-id). Recheck terms before commercial/public deployment.
- The Research Desk refreshes on opening/request. New dashboard/detail panels refresh every five minutes while visible, sharing endpoint-specific server caches. Local minimum interval 300ms, coalescing, no multiplied retries and explicit stale/error states. These controls are not a provider quota guarantee or shared multi-instance budget.

## Dashboard provider expansion — checked 2026-09-28

| Provider / endpoint | Normalized data and refresh | Boundary |
| --- | --- | --- |
| FRED `graph/fredgraph.csv?id={allowedSeries}&cosd={date}` | Single-series CSV, fixed allowlist DGS10/DGS2/VIXCLS/DTWEXBGS/SP500/DCOILWTICO/M2SL/FEDFUNDS; two years requested; 1h cache | Public download, not keyed FRED API; observations are daily/monthly and revised. Missing CSV values skipped, never zero-filled. M2 is US-only; broad USD is not DXY; fed funds is an effective monthly average. |
| CoinDesk `arc/outboundfeeds/rss?outputType=xml` | Headline, source, link, publication date, categories; 5m cache | Exact non-redirecting path. No article bodies or AI interpretation. |
| Federal Reserve `feeds/press_monetary.xml` | Official monetary-policy releases; 30m cache | Not an economic calendar, tariff feed or complete global policy feed. |
| Alternative.me `fng/?limit=30` | Daily Bitcoin Fear & Greed/history; 1h cache | Visible attribution; not a cycle phase or automatic trade rule. |
| CoinGecko public `api/v3/search/trending` | Ranked most-searched coins, returned prices/changes; 15m cache | Anonymous endpoint returned successfully on this host; availability may change. Existing Demo key is reused if configured. Separate status from keyed exchange adapters. Not X/social trends. |
| DefiLlama `/v2/chains` | Current chain TVL; 15m cache | No TVL-history/inflow claims. |
| DefiLlama `/overview/fees?dataType=dailyRevenue&excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true` | Daily and 7d signed revenue, chain/app categories; 1h cache | Some values can be negative. No summed parent/child total, earnings or token-holder-income inference. |
| DefiLlama `/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true` | Covered venue volume and rankings; 15m cache | Feed includes prediction markets; UI labels venue volume, not a pure-DEX or all-exchange total. |
| `stablecoins.llama.fi/stablecoincharts/all` | Sum USD-converted currency buckets per date; last year retained, exact 7d change; 1h cache | Aggregate supply value, not cash inflow or executable liquidity. |

References: [FRED downloads](https://fredhelp.stlouisfed.org/fred/data/downloading/using-the-download-data-link/), [DefiLlama free API](https://api-docs.defillama.com/llms-free.txt), [Alternative.me API](https://alternative.me/crypto/fear-and-greed-index/#api), [CoinGecko trending definition](https://docs.coingecko.com/reference/trending-search). Source-specific attribution and observation dates appear in the UI; verify redistribution/licensing before public/commercial deployment.

XML/CSV requests stay inside fixed server origins, refuse redirects, cap text at 2MB and reject XML DOCTYPE/entity declarations. RSS output keeps approved source-host HTTPS links only and is rendered as text. Each panel can fail independently. Visible-page polling is five minutes; endpoints reuse their longer caches. One bounded retry handles short local cooldowns; external long rate limits are respected. Cache/status remain process-local.

Not connected: CoinGlass and detailed derivatives, X, global policy-rate coverage, global money composite, automated economic events and RWA access data. A direct BLS calendar-feed check returned HTTP 403 on this host; retain official external calendar links pending a permitted integration. CryptoCompare's news endpoint requested a key and was not used. CME, Kalshi and Investing.com are newly suggested candidates, not verified API integrations.


## Structure charts and recent candidate additions — 2026-09-28

Market Structure (/market-cycle) and Research Charts (/charts) use official TradingView advanced-chart display embeds for TOTAL/TOTAL2/TOTAL3/OTHERS, BTC.D/ETH.D and Binance ETHBTC, with lazy loading, selected range, theme matching, expanded view and direct links. TOTAL is a top-125 index, separate from CoinPaprika's provider-wide aggregate; TOTAL2/3 retain stablecoins and OTHERS follows designated exclusions. TradingView controls data/symbol availability and notices. Frame load is a display transport state, not Atlas API health or proof of fresh observations. Atlas Refresh does not refresh these independently operated widgets.

This introduces no chart API key, no raw-history adapter and no drawing persistence. Project chart library, MA/RSI/volume calculations and AI annotation remain planned. See [official widget documentation](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/) and [index definitions](https://www.tradingview.com/support/solutions/43000550480-where-do-i-find-crypto-market-capitalization-and-dominance/).

[PROVIDER-RESEARCH.md](PROVIDER-RESEARCH.md) preserves the recent news/X/Telegram/calendar, CMC mindshare, chart and commodity research. EIA, ENTSO-E, IMF PCPS, World Bank Pink Sheet, IRENA/IEA and USGS expand candidate energy/commodity coverage. OpenMarket, Alchemy, Codex and specialist wallet/DeFi feeds remain candidates, not new configured adapters. Selected endpoints will be tested one at a time. Marketing articles and screenshot lists do not establish entitlement or production reliability.


## Compact structure snapshot — 2026-09-28

CoinPaprika /global also normalizes optional signed `market_cap_change_24h` and `volume_24h_change_24h` percentages, preserving missing values and zero. See [official global response fields](https://docs.coinpaprika.com/api-reference/global/get-market-overview-data). No extra requests or credentials are introduced.

Dashboard cap/share exclusions are labeled estimates in this provider's universe: ex-BTC from reported dominance; ex-BTC/ETH adds ETH cap; outside-top-ten subtracts the ten provider-ranked caps (including stablecoins). ETH/top-ten observations must be within ten minutes of the global observation; missing/duplicate ranks, excessive excluded values or unaligned timestamps leave those values unavailable. This is not TradingView index methodology. Basket cap-change history is not available, and token price percentages are never substituted. Exact TradingView charts remain available on Market Structure; no iframe is mounted by the dashboard.

## Provider expansion — checked 2026-09-28 (D-015)

- **CMC:** official keyless public global `/public-api/v1/global-metrics/quotes/latest?convert=USD`, Fear & Greed `/public-api/v3/fear-and-greed/latest`, Altcoin Season `/public-api/v1/altcoin-season-index/latest` returned valid live responses. See [public API access](https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api) and [global/index reference](https://coinmarketcap.com/api/documentation/pro-api-reference/global-metrics). Optional CMC_API_KEY selects keyed paths; no credential is required for this slice. IP-based public quotas are not guaranteed. Cache/global 10m; indices 15m; local minimum 1s. Provider error envelopes, invalid scores/timestamps and HTTP failures remain unavailable, never zero. Latest CMC derivatives volume is a reported aggregate, not OI/liquidations or an execution metric.
- **Source universes:** Dashboard global totals prefer CMC with lazy, explicitly attributed CoinPaprika fallback. BTC/ETH prices, Discovery and personal valuation still use CoinPaprika IDs/quotes. Ex-BTC/ETH shares use the selected global provider’s own dominance. Outside-top-ten cap is unavailable on CMC until a matching CMC ranking snapshot is implemented; CoinPaprika caps are not subtracted from CMC totals. No CMC account holdings, website mindshare or numeric social sentiment is imported.
- **News:** `https://cointelegraph.com/rss` (5m) and `https://www.ecb.europa.eu/rss/press.html` (30m) supplement CoinDesk/Fed. The [ECB RSS directory](https://www.ecb.europa.eu/home/html/rss.en.html) documents its communications feed. Only titles, links, dates and supplied categories are retained, rendered as text with publisher attribution. Links are allowlisted to the original publisher HTTPS host; tracking parameters/fragments and duplicate slashes are normalized. No full-text, AI summaries or article-image import. Cross-source syndication/story clustering remains planned; URL duplicates are removed.
- **Macro:** [PCEPI](https://fred.stlouisfed.org/series/PCEPI), [PCEPILFE](https://fred.stlouisfed.org/series/PCEPILFE), [CPIAUCSL](https://fred.stlouisfed.org/series/CPIAUCSL), [UNRATE](https://fred.stlouisfed.org/series/UNRATE), [DFII10](https://fred.stlouisfed.org/series/DFII10), [DCOILBRENTEU](https://fred.stlouisfed.org/series/DCOILBRENTEU), [DHHNGSP](https://fred.stlouisfed.org/series/DHHNGSP), via the existing bounded FRED CSV adapter (1h cache). Inflation displays exact-calendar-month MoM/YoY from seasonally adjusted indices; chart levels keep base-index units. Monthly dates are reference periods, not release times. Unemployment changes use percentage points, yield changes basis points. Brent and Henry Hub are daily spot observations in USD/barrel and USD/MMBtu, respectively, not intraday/futures quotes. These histories may be revised; vintages and consensus are not captured. Detail tabs only fetch the selected group.


### CMC ranked discovery and project basics — D-016, 2026-09-28

CMC /v3/cryptocurrency/listings/latest is connected for the first 100 market-cap-ranked assets (five-minute cache), with numeric CMC identities, explicit USD quotes, price/volume/cap/FDV, supply and reported 1h/24h/7d/30d returns. V3 quote arrays must contain exactly one USD quote. CMC /v2/cryptocurrency/info is queried by one validated ID on the selected token page (24-hour cache), supplying descriptions, website/social/source-code/docs/explorer/community links and provider classification tags. Both were verified keyless against official documentation. Public access has a shared IP quota; Atlas retains cooldowns, errors and source-specific fallback. Optional CMC_API_KEY continues to select authenticated access; endpoint entitlement must be checked for the chosen plan.

Discovery defaults to CMC top 100, with a selectable CoinPaprika wider universe and visible fallback on CMC listing failure. Personal prices and saved IDs remain CoinPaprika. CMC token names/Details open /markets?cmc={id}; there is no symbol-based merge or write into saved research. Matching CMC rank 1–10 cap values now support outside-top-ten estimates when all ten unique ranks have observations within ten minutes of the CMC global snapshot. Missing/unaligned data still returns unknown; estimates are not exact TradingView OTHERS.

Metadata classifications, including portfolio labels, are not verified VC funding or partnership evidence. CMC date_added is listing date, not project inception. Description text may contain older prices; the displayed quote metrics have separate observation times. Full team/funding/unlocks, mindshare, contracts verification, and persistent CMC project mapping remain planned.


### Table windows and coverage — D-017, 2026-09-29

Connected list feeds support 1h/24h/7d price changes; 1h now retained from CoinPaprika too when returned. Atlas computes BTC-relative 1h/24h returns from aligned same-provider observations. CMC 4h/12h history is an optional wired adapter, not a live integration yet: no CMC key is configured and the public history probe returned 403. Official cryptocurrency docs list historical quotes and their plan-specific retention; keyless catalog does not include that endpoint. Sentiment, mindshare, YTD baseline and seven-day table sparkline remain unconnected.

References checked: https://coinmarketcap.com/api/documentation/pro-api-reference/cryptocurrency and https://coinmarketcap.com/api/documentation/pro-api-reference/keyless-public-api.


### Multi-provider discovery — D-018, 2026-09-29

Connected: CoinGecko /search/trending (default 15, most searched over 24h); CoinPaprika /v1/coins filtered by is_new (added within five days, active first then market rank, maximum 100); CMC regular /v3/cryptocurrency/listings/latest with date_added descending and limit 50. These three feeds returned successfully without new credentials. CMC returned the selected recent snapshot in ascending date order during verification, so Atlas explicitly sorts dates descending within that snapshot. This is not the dedicated /listings/new API and does not establish complete new-token coverage. CMC additions carry prices/24h returns and exact listing dates; CoinPaprika directory additions have no quotes or exact added date, displayed as unknown. CoinGecko provider trend order stays distinct from market rank.

All share the existing 15-minute process-local cache, request coalescing, fixed origins and status tracking. Only the selected feed is requested. CMC dedicated trending/most-visited/new APIs require Startup or above; CoinGecko /coins/list/new requires Pro access. CoinPaprika website attention lists and a separate CoinGecko most-visited API remain unverified. These unavailable combinations display access status/source links and consume no ranking requests, even when optional keys exist. No cross-provider ticker merge, aggregate ranking or saved project migration. Provider research and references are in PROVIDER-RESEARCH.md.


### Named watchlist coverage (D-019)

Named lists are Atlas browser-local records with exact CMC/Paprika/Gecko asset IDs; not an upstream account API. Prices reuse CMC top-100, CoinPaprika market snapshot and CoinGecko trending coverage, with source/freshness details and blank missing fields. No cross-provider symbol substitution or per-asset history request. Manual paste preview is available; CMC account/portfolio/curated-watchlist sync remains unconnected. Named-list backup v1 is separate from research backup v4.
