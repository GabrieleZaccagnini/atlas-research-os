# Atlas provider research register

Recorded 2026-09-28 from the recent API discussions. These are candidates, not configured connections or subscriptions. DATA-SOURCES.md owns implemented coverage. Prices/quotas can change; check exact endpoint entitlement, intended-use terms, schema and health when a slice is selected. Marketing comparison articles are discovery leads, not authoritative access specifications.

## Charts and market data

| Candidate | Atlas use / next check |
| --- | --- |
| [TradingView widgets](https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/) | Free external display. Current structure panel uses official advanced-chart embeds. Does not supply Atlas OHLCV or saved editable drawings. [Index methodology](https://www.tradingview.com/support/solutions/43000550480-where-do-i-find-crypto-market-capitalization-and-dominance/) defines TOTAL/top-125, exclusions and stablecoin inclusion. |
| [CMC API](https://coinmarketcap.com/api/documentation/v1/) | CMC public global metrics, Crypto Fear & Greed and Altcoin Season are connected (D-015); top-100 ranked listings and on-demand ID-based metadata are connected (D-016). Wider listings/history remain candidates. Website availability does not establish API access. Check each endpoint and tier before integration. Personal account portfolios/watchlists are a separate import problem. |
| [CMC community reference](https://coinmarketcap.com/api/documentation/pro-api-reference/community/) | Documents trending token/topic endpoints on Growth and higher plans; these are not the exact numeric website mindshare metric. That field remains access-unverified; do not purchase a tier on that assumption. |
| [OpenMarket](https://openmarket.xyz/api) | Investigate raw history, market coverage, licensing and sustained free access; not connected. |
| [Mobula](https://docs.mobula.io/), [Codex](https://docs.codex.io/), [Alchemy](https://www.alchemy.com/docs) | Candidates for token/pool/history and wallet context. Alchemy Prices, Token and Portfolio are distinct products; verify quota, chains and field meaning. |
| CoinGecko, CoinStats, CoinAPI, CoinCap, CoinCodex, Solana Tracker, Portals.fi, Uniblock | Keep as coverage-specific candidates. Existing CG market/ticker adapters are separate from news. Solana Tracker is specialist; Portals is DeFi positions/yield; Uniblock is orchestration, not a reason to replace working adapters. Ripio/onramps, The Crypto App and arbitrage tools have lower priority for the research overview. |

## News and articles

| Candidate / source | Findings and boundary |
| --- | --- |
| [CoinStats news](https://coinstats.app/api-docs/openapi/get-news-by-type) | Useful latest/trending/category news candidate; key and weighted credit budget required. Verify news endpoint access with the chosen account. |
| [cryptocurrency.cv repository](https://github.com/nirholas/cryptocurrency.cv) | Advertises no-key hosted news aggregation. Host health/coverage not validated in Atlas. Repository availability is not permission to self-host/reuse every asset; review its license. |
| [CoinGecko news](https://docs.coingecko.com/reference/news) | CoinGecko has a free market Demo tier, but its news API is paid Analyst+ in the reviewed documentation. Do not equate free market API with free news. |
| [NewsAPI](https://newsapi.org/pricing) | Free Developer access is delayed and development-only; not an ongoing deployed internal-production feed. |
| [NewsData](https://newsdata.io/blog/pricing-plan-in-newsdata-io/) | Free delayed headlines candidate; credits, article counts, delay and full-text limits differ. |
| [APITube](https://apitube.io/pricing) | Free delayed/limited preview candidate with entity/sentiment features. Preserve provider method; not a substitute for CMC mindshare. |
| [CryptoPanic](https://cryptopanic.com/developers/api/plans/) | Useful crypto aggregation; current paid plans/access must be checked instead of relying on old free-API guides. |
| [CryptoNews API](https://cryptonews-api.com/pricing) | Trial rather than assumed ongoing free access. |
| [Webz](https://webz.io/pricing) | Broader macro/policy news and search candidate. Monthly free dollar credits with different feed/search costs; not an unlimited free stream or direct X replacement. Original publisher rights and full-text/AI permissions still matter. |

Use one selected aggregator in addition to existing RSS when it improves a named coverage gap. Normalize, deduplicate and cache server-side. D-015 adds Cointelegraph and ECB RSS; aggregator candidates remain inactive.

## X and Telegram

| Candidate / source | Findings and boundary |
| --- | --- |
| [Official X](https://docs.x.com/x-api/getting-started/pricing) | Usage-based access can support a narrow monitored account list with a capped budget. Price per returned post is separate from other operation costs. Verify endpoint/account access; no subscription enabled. |
| [TwtAPI](https://www.twtapi.com/zh/pricing/) | Advertised small recurring free monthly call allowance; trial exact timeline/search coverage, payload size and reliability before choosing. |
| [Tweet Harvest](https://github.com/helmisatria/tweet-harvest) | Node/Playwright session-based collection and CSV exports; not the Python tool described in the supplied screenshot. Requires sensitive X authentication and ongoing maintenance. |
| [twscrape](https://github.com/vladkens/twscrape) | Python internal-API/session approach; optional research import, not default ingestion. |
| [ScrapeBadger](https://docs.scrapebadger.com/credits-and-pricing) | Signup credits are one-off; returned posts consume credits in addition to a base request. Calls are not equal to articles/posts. |
| [Apify](https://apify.com/pricing) | Platform free compute credits do not guarantee any actor's API/monitoring entitlement. [Example actor](https://apify.com/apidojo/tweet-scraper) limits its free tier separately. |
| [ScraperAPI](https://www.scraperapi.com/pricing), [ZenRows](https://www.zenrows.com/pricing) | Proxy/rendering candidates with weighted credits and trials/free allowances. Do not solve dataset identity, stable extraction or X coverage themselves. |
| [Telegram Bot API](https://core.telegram.org/bots/api#update), [Telegram client API](https://core.telegram.org/api) | Receive channel posts through a bot with appropriate channel access, or an authorized reader. Cannot simply point an arbitrary bot at every public channel. Retain channel/post IDs, original links, edit timestamps and provenance. No token/session handling implemented. |

## Calendar and macro

| Candidate | Atlas use / next check |
| --- | --- |
| [CoinMarketCal](https://coinmarketcal.com/developer), [Coindar](https://coindar.org/en/api) | Crypto project events. Verify tier, source/evidence, tags, duplicates, tentative dates and actual time coverage before one adapter is selected. |
| [Finnhub economic calendar](https://finnhub.io/docs/api/economic-calendar), [EODHD](https://eodhd.com/financial-apis-blog/new-economic-events-calendar-api), [Trading Economics](https://docs.tradingeconomics.com/) | Macro actual/prior/forecast/calendar candidates; exact free access not assumed. |
| [BLS](https://www.bls.gov/schedule/), [BEA](https://www.bea.gov/news/schedule), [Fed](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) | Official publication/meeting dates and released observations. Current Atlas keeps external links; prior BLS feed check was blocked. Do not invent consensus from official release dates. |
| FRED, central-bank/statistical sources, BIS, ECB, OECD, World Bank | Reuse official histories for rates, inflation, global money and activity. Country instrument/unit, release time and revisions must be preserved. |
| CME/Kalshi and Investing.com | Rate expectations and PCE/calendar/consensus candidates; actual rates, futures expectations and event contract prices stay distinct. Access/licensing still to verify. |
| Qveris, Shibui, FindMyMoat, Magnidata/Medium, Datarade | Supplied discovery references; follow through to original documentation and specific source before treating as an API. |

## Energy and commodities

| Candidate / source | Atlas use / next check |
| --- | --- |
| [EIA open data](https://www.eia.gov/opendata/) | Free keyed US energy data candidate: oil/gas, inventories, demand and generation. Not a universal live global energy exchange feed. |
| [World Bank commodity markets](https://www.worldbank.org/en/research/commodity-markets) | Pink Sheet monthly broad commodity downloads; do not label monthly values live intraday quotes. |
| [IMF primary commodities](https://data.imf.org/Datasets/PCPS) | Monthly commodity averages/index context; verify dataset API route and units. |
| [ENTSO-E](https://transparency.entsoe.eu/) | European electricity generation/demand/prices; registration/token and region/timezone definitions required. |
| [IRENA](https://www.irena.org/Data), [IEA minerals explorer](https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer), [USGS minerals](https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries) | Renewable capacity/cost and critical-mineral supply context; publication frequency and downloads vary. Not interchangeable commodity spot quotes. |

Core dashboard candidates: Brent/WTI, gas, gold/silver/copper and bond yields/real yields. Electricity, industrial/agricultural inputs and critical minerals belong in deeper macro/sector research until actual use justifies a dashboard slot. Wind/solar are capacity, generation, cost and policy datasets rather than a single price ticker.


## Cross-provider discovery — checked 2026-09-29

| Provider | Trending | Most visited | Newly added | Atlas status |
| --- | --- | --- | --- | --- |
| CMC | /v1/cryptocurrency/trending/latest, search volume | /v1/cryptocurrency/trending/most-visited, page traffic | /v1/cryptocurrency/listings/new | Dedicated endpoints documented for Startup and above; not connected. D-018 connects free regular listings/latest sorted date_added, limit 50, as a bounded recent-additions alternative; not equivalent or complete coverage. |
| CoinGecko | /search/trending, last 24h searches, default 15 coins | No separate documented coin most-visited endpoint found | /coins/list/new, latest 200 IDs and activated_at, Pro key | Trending connected; new coins not connected and paid. |
| CoinPaprika | Present on website Highlights; no documented REST endpoint found | Present on website Highlights; no documented REST endpoint found | /v1/coins includes is_new for added within five days, Free plan | D-018 connects the new flag, active first then market rank, capped at 100; quotes remain unknown. Website list presence does not establish supported ranking API access. |

References: [CMC cryptocurrency reference](https://coinmarketcap.com/api/documentation/pro-api-reference/cryptocurrency), [CoinGecko trending](https://docs.coingecko.com/reference/trending-search), [CoinGecko newly added](https://docs.coingecko.com/reference/coins-list-new), [CoinGecko paid endpoint explanation](https://www.coingecko.com/learn/ethereum-dapp-crypto-api), [CoinPaprika coin list](https://docs.coinpaprika.com/api-reference/coins/list-coins), [CoinPaprika Highlights](https://coinpaprika.com/highlights/), [CoinPaprika API catalog](https://docs.coinpaprika.com/llms.txt). Documentation research only; no new live endpoint probes, credentials or subscriptions.

Keep provider additions, launch dates and pool creation separate. Trending search attention, page traffic and price gainers are different signals. Planned UI: modes plus provider selector, source-specific ranks and timestamps; unavailable feeds show an access explanation/direct source link. No symbol-based cross-provider overlap or invented combined rank.
