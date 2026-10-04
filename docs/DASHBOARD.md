# Atlas dashboard

The homepage is an anytime overview with no morning-brief framing. Use the arrow in a section heading to open its detail page. Gainers/losers use the available provider's top 200 assets with at least $1M reported daily volume; search trends are CoinGecko searches, not X activity.

- **Markets:** prices, 24h/7d changes, capitalization, volume, search and Watch buttons.
- **Macro:** grouped rates/markets, inflation/jobs and energy/liquidity. New core/headline PCE, CPI, unemployment, real yields, Brent and Henry Hub gas supplement existing histories. Dashboard adds core PCE YoY/MoM; detail tabs fetch their group on demand.
- **News:** CoinDesk, Cointelegraph, Fed and ECB headline feeds with dates, crypto/policy tabs, search and publisher filters. Sources fail independently.
- **Chains:** current TVL, stablecoin supply/history, covered venue volume and chain/app revenue rankings.
- **Portfolio:** select a saved project and enter quantity/optional average USD cost. No quantity is inferred from an Owned status. Blank price/cost remains unknown.
- **Watchlist:** saved Watching/Buy List projects with exact-ID quotes.
- **Calendar:** manually recorded project catalysts plus official external economic calendars.
- **Research Desk:** the previous research queue, reviews, discovery and backups, now at `/research`.

Panels load independently and refresh every five minutes while the page is visible, respecting longer server caches. Expand a source timestamp for retrieval/observation/cache details. A provider failure must not erase saved research. Backups now use version 4 and accept versions 1–3.

Still to connect: X/social metrics, funding/open interest/liquidations, global policy rates and money composite, automated economic/unlock events, and RWA/access details. New livestream ideas are captured in RELATIVE-STRENGTH-BOARD.md and the master plan/backlog.


## Grouped layout and theme — 2026-09-28

Market status combines six compact market values; sentiment/breadth sits alongside it. A compact structure snapshot follows; full-width Discovery is the main central section, then macro/trending/derivatives, personal positions/watchlist, news/calendar and onchain sections. Onchain switches between TVL/stablecoins and volume/revenue so the homepage does not need four separate large panels at once. Detail pages retain broader views. The derivatives card shows Binance BTCUSDT open interest and settled funding beside the separate CMC global volume observation, and opens `/derivatives`; liquidations and ETF flows remain unconnected.

Use the sun/moon control in the top bar for light/dark themes. The preference is stored in this browser separately from research and account records. The existing sidebar collapse preference remains independent.

The Market Structure detail page has Market caps and Dominance & ETH/BTC views, range controls, expanded chart dialogs and TradingView links. Widgets load as they approach the viewport, match the selected theme and own their data refresh. Atlas cannot inspect their source freshness or save editable drawings. Source definitions remain in an expandable note; TOTAL/top-125 is not interchangeable with CoinPaprika's aggregate. The dashboard contains no embedded charts. Its cap/share summary links to that detail page.

Future CMC-style table/token-page, saved project chart plans, news/X/Telegram, calendar and energy additions are captured in MASTER-PLAN §19, BACKLOG.md and PROVIDER-RESEARCH.md.


## Discovery and dedicated charts — 2026-09-28

Discovery shows twelve rows initially with Show more. Search combines with Overview/Top gainers/Top losers/Top volume, minimum market-cap/volume filters and sortable supported columns. Missing values sort last in either direction. Switching market view resets custom sort; Reset sort retains filters, and Clear filters retains search/view. The full Markets page shares these controls. No unsupported chain/social metric filters are implied.

The Charts entry under Research opens /charts: seven explicit Binance USDT spot pairs, range controls and TradingView candle/volume/indicator/drawing tools. Drawing persistence and project chart-library storage remain planned; the page states drawings are temporary. Structure cap-change history is unavailable except for provider-reported all-market 24h change. Estimated basket shares are percentages of the selected global provider’s cap, distinct from exact TradingView indices. No cross-provider cap subtraction.

## CMC, news and macro expansion — D-015

CMC global totals are preferred, with an explicit CoinPaprika fallback. Discovery and personal quotes remain CoinPaprika. CMC Crypto Fear & Greed and Altcoin Season replace the empty breadth placeholder, with independent timestamps; Alternative.me Bitcoin history remains separately labeled on Market Structure. CMC reported derivatives volume is global; Binance BTCUSDT funding/OI is venue-specific. The Derivatives detail page has a browser-collected past-event map with coverage gaps, MarginPad's sampled multi-venue observed price profile and separately labeled modeled future levels; Coinalyze historical hourly totals are connected with a local server-side key. Market Structure adds delayed BGeometrics short-term-holder realized price, daily ETF net BTC flows and hashprice history. ETF flow versus issuance remains planned. Outside-top-ten cap needs matching CMC rankings when global is CMC. All cap basket percentage histories remain planned.

D-038 adds a Binance-only BTCUSDT spot-versus-perpetual traded-volume card on the Derivatives detail page. Its 24h/7d/30d selectors use matched closed hourly USDT quote volume, show coverage and a spot/perp ratio, and avoid assigning buy/sell direction or price causality. The Dashboard summary still has its separate CMC global derivatives volume observation.

FRED inflation values are calculated from exact prior month/year baselines; missing baselines stay unknown. Charts display the underlying price-index levels. Dates are observation periods, not release timestamps. No automatic regime/causal conclusion is generated.


### CMC Discovery — D-016

Discovery now defaults to CMC top 100 by market-cap rank; the CoinPaprika wider view remains selectable and is shown with an explicit warning if CMC listings fail. Search/sort/liquidity filters operate within the displayed snapshot. CMC token names/Details open an on-demand reference card with supply, FDV, returns, descriptions and links. CoinPaprika Watch/Open flows remain unchanged; CMC does not auto-match or save personal projects. Outside-top-ten cap now uses complete, aligned CMC rank data when available; basket change history is still unknown.


### Market column controls — D-017

Discovery and Markets share browser-persisted columns, sortable rank/price/1h/24h/7d/cap/volume/BTC-relative returns and up to eight compound minimum/maximum numeric ranges, in addition to name/symbol search and cap/volume presets. Blank bounds are ignored; unknown values are excluded by an active bound and sort last either direction. Invalid/inverted bounds show an error and no matches. Column preferences are separate from research and resettable. 4h/12h columns are selectable but currently unknown because no CMC historical key exists. Optional history fetches only when these columns/filters need it, only under CMC, and after listing data exists. The same provider BTC benchmark is calculated before search/filtering. Gainers/losers tabs still mean 24h; sorting by another window does not silently change their universe. Sentiment/mindshare, 7d mini-chart and YTD options are disabled with a coverage reason.


### Cross-provider Discovery — D-018

Discovery feeds now groups Trending / Most visited / Newly added with CoinGecko / CMC / CoinPaprika controls. The default is CoinGecko 24h search trending. Working additions: CMC recent listings (up to 50, newest dates first within snapshot) and CoinPaprika five-day additions (up to 100, active first then rank, quotes unknown). Dashboard shows five rows and links to /markets#trending, where search and Show more browse the selected snapshot. Changing source/mode clears the previous feed's search/page state. Source order is preserved for trends; market rank remains separately labeled. Paid/unverified modes show the source link and access reason. Retrieval/cache/stale states are visible. Additions are explicitly distinguished from launches and DEX pools. Existing market table and research save paths are preserved.
