# Atlas — consolidated master plan

Updated 2026-09-28. This is the umbrella product plan combining the original Atlas conversation, the complete 31-section Gemini blueprint, terminal inspiration, and the implemented repository. The detailed requirements here are delivered through ROADMAP.md; BACKLOG.md owns current feature status. It does not certify provider availability, forecast accuracy or feature completion.

**Map the Market. Find the Signal. Build Conviction.**


## Start here: the whole product and its living plan

Atlas connects five questions: **What is happening in markets? Which projects deserve research? Where are assets and usable liquidity? What evidence supports my thesis? What should I review next?** The homepage summarizes these questions; specialist workspaces provide the detail.

| Workspace | What belongs here |
| --- | --- |
| Dashboard | Anytime market snapshot: crypto, movers, macro, news/policy, catalysts, positions, watchlist, trending searches, chain capital and revenue; concise summaries open specialist pages. |
| Research Desk | Research queue, next actions, reviews, discovery and research backups; separate from the market dashboard. |
| Project research | Product, team, official links/socials/GitHub, tokenomics, funding/sale prices, investors, organizations/universities/institutes, economics, risks, sources and personal thesis. |
| Markets and chain capital | CEX/DEX listings, price/volume/spread/depth, chain/protocol TVL, stablecoins, RWA, covered flows and actual access/redemption conditions. |
| Macro and policy | Global rates, yields, inflation, growth/jobs, money supply, dollar, stress, credit/commodities, central banks, tariffs/deals/meetings and editable Bitcoin-cycle scenarios. |
| Discovery and intelligence | Narratives, rotation, adoption themes, builders, news/attention, on-chain activity, security/regulation and comparisons. |
| Decisions and strategy | Conviction, saved evidence, journal, holdings, signal modules, backtests, paper tests and taken/skipped review; cited AI help and alerts when supported. |

All 31 Gemini sections are retained in §4 and mapped to stable feature IDs in the backlog. The screenshot additions are specified in §§11–16. Candidate sources are preserved without assuming all APIs are active, free or needed at once. The interface can evolve beyond Bolt; preserve working data/routes while designing around these research tasks. The accepted visual direction uses compact spacing, rounded panels, refined typography and an optional icon-only sidebar, while retaining Atlas colors. Reference screenshots guide style, not dashboard content.

**Read the plan in this order:**

1. [ROADMAP.md](ROADMAP.md) — build sequence, next implementation batch and completion gates.
2. [BACKLOG.md](BACKLOG.md) — feature IDs, actual status, acceptance boundaries and new ideas.
3. This document — detailed product requirements and methodology.
4. [DATA-SOURCES.md](DATA-SOURCES.md) — candidate sources and implemented coverage.
5. [PLANNING.md](PLANNING.md) and [DECISIONS.md](DECISIONS.md) — how to add/change ideas and why decisions were made.

**Next useful release:** refine the anytime dashboard through real use, then select the next PCE/rate-expectations or relationship/relative-strength slice. The broader project dossier, global macro, derivatives, RWA and research requirements remain in the backlog. Current implementation and remaining limits are documented in [DASHBOARD.md](DASHBOARD.md).

## 1. Product purpose

Atlas is a personal crypto intelligence and research operating system. It connects market context, project fundamentals, liquidity, narratives, technical setups and personal decisions. It should explain what changed, why it matters, what evidence supports it and what could invalidate the thesis. A trading scanner is one module, not the entire product.

The main workflow is discover → investigate → compare → build a thesis → monitor → plan → record the decision → review outcomes. Research and monitoring come first. Any future exchange execution is a separately designed and explicitly authorized capability.

## 2. Information architecture

### Dashboard — anytime market overview

The homepage is an organized market snapshot, usable at any time of day. It is not a morning brief, research-administration page or narrative report. Use the simple title “Dashboard”; omit slogans and unnecessary explanatory copy.

- Crypto overview: BTC/ETH, market capitalization, volume, dominance and sentiment.
- Markets: overview, gainers, losers and volume leaders; distinguish market movement from search/social attention.
- Macro: rates/yields, dollar, stress, equities/commodities, inflation and liquidity, with accurate frequency and observation dates.
- News/policy and calendar: current reporting and official releases; upcoming economic/project catalysts when supported.
- Personal: actual position quantities/valuation and watchlist changes; do not infer holdings from status.
- Discovery: trending searches, narratives and ecosystem relationships, with source-specific definitions.
- Chain capital/economics: TVL, stablecoins, venue activity and revenue; later RWA/access and derivatives.

Each summary opens a deeper workspace using the same source contracts. Panels load independently and display partial coverage, errors and source timestamps. Show genuine data or an honest empty state. Keep detailed definitions/coverage behind concise disclosures. The Research Desk retains saved-project reviews and research workflow. D-011 supersedes the old research-focused homepage.

### Projects and Research

Directory, saved filters, watchlists, Buy List, quick project previews, full project pages and side-by-side comparison of 2–4 projects. Each project is a persistent research dossier, not just a ticker. Capture potential pre-launch tokens as projects even when their ticker, contract and exact provider identity are unknown; keep the user's reason for interest, discovery source and any possible launch date separate from verified calendar events and developed investment thesis.

### Intelligence

Narratives; markets and liquidity; macro and cycles; news and attention; calendar; on-chain and derivatives; security and regulation; discovery and builders. Shared data feeds power multiple views.

### Strategy Lab

Signal deck, configurable strategies, historical tests, scenario analysis and paper forward testing. Technical observations remain distinguishable from investment judgments.

### Personal Workspace

Thesis vault, convictions, journal, holdings/transactions, scrapbook, alerts, account/storage and data-source coverage.

## 3. Complete project dossier

| Area | Required coverage |
| --- | --- |
| Identity and links | Canonical IDs, names/tickers, chains, verified contracts, website, docs, whitepaper, explorers, X, Telegram, Discord, GitHub |
| Product | What it does, problem solved, users/customers, architecture, roadmap, milestones, competitors and differentiation |
| People | Founders, team, roles, public backgrounds, advisors and organizational/foundation structure |
| Ecosystem | Narrative tags, integrations, partnerships, bank/institutional pilots, grants, hackathons and adoption evidence |
| Market and valuation | Price, market cap, FDV, rank, supply, volume, historical performance, relative strength and comparable scenarios |
| Funding and sales | Rounds, dates, amounts, currencies, lead/backing investors, disclosed seed/private/ICO/presale/public prices |
| Token economics | Supply, allocation, inflation/emissions, burns, vesting, cliff and linear unlocks, dilution and recipient groups |
| Utility and value capture | Gas, governance, staking, fees, token-holder revenue, buybacks/burns and actual token demand mechanisms |
| Financial/adoption evidence | TVL, users, activity, fees, protocol revenue, token-holder revenue, treasury assets, runway assumptions and grant budgets |
| Trading venues | CEX/DEX, chain, pair, price, 24h volume/share, pool liquidity/reserves, spread, bid/ask, depth bands, pair age and links |
| Execution context | Size-specific estimated slippage, fees, gas, liquidity coverage and transfer constraints where reliable data exists |
| On-chain | Holder concentration, labeled entities, whale/exchange flows, wallet activity and LP changes |
| Development | Repository mapping, contributors, meaningful development trends, releases and ecosystem builder activity |
| Attention | News, unique sources, social/search trends and narrative context; separate observed activity from interpretation |
| Events | Launches, upgrades, listings, governance, unlocks, partnerships, conferences and other catalysts |
| Risks | Contract/security findings, audit scope, exploits, concentration, governance, regulatory developments and project-specific risks |
| Personal research | Thesis, evidence, counterarguments, unanswered questions, conviction, invalidation, next review and decision history |
| Positions if owned | Transactions, quantities, cost basis, realized/unrealized results, plans and journal links; never infer holdings from a watchlist |

Every sourced item should retain provenance, as-of/retrieval time, units, coverage, verification state and uncertainty. Distinguish unknown, undisclosed, not applicable and zero. Facts, calculated metrics, hypotheses and personal judgments are separate records. Avoid silently overwriting manual research with provider enrichment.

## 4. All 31 Gemini sections, retained and mapped

These are planned capabilities unless explicitly listed as implemented below.

| # | Blueprint capability | Atlas implementation direction |
| --- | --- | --- |
| 1 | Bento visual identity | Obsidian/charcoal, purple/indigo, selective cyan, clear typography, responsive cards; current logo is a replaceable placeholder |
| 2 | Efficient data layers | Canonical identity map, batched requests, refresh controls, provider budgets and cached snapshots |
| 3 | Signal deck | Modular MA crosses, volume breakouts, 1-2-3-4 retests, 1-2-4-5 continuations, ATH breaks and support bounces |
| 4 | Backtesting and thesis vault | Reproducible configuration, returns/drawdown/trade metrics, historical tests and paper-forward/live-scanning lifecycle |
| 5 | AI research/strategy parser | Convert text to validated strategy configurations; chart attachments as evidence; historical macro questions via constrained tools |
| 6 | Macro cycle clock | Historical cycle comparison plus editable, labeled scenario windows; observed regimes separate from calendar hypotheses |
| 7 | Correlations and comparative valuation | Aligned return-series correlation/beta and supply-aware leader/challenger scenarios |
| 8 | Attention convergence | Multi-source trending/attention coverage with transparent weighting and available-source denominator |
| 9 | Media dissemination | Deduplicated stories, distinct outlets, narrative saturation and historical context |
| 10 | Search interest | Search trends where accessible; distinguish search interest from returned web-result counts |
| 11 | Taken vs skipped | Record signals at decision time; compare consistent hypothetical outcomes with actual trades and costs |
| 12 | Volatility compression | Bollinger/Keltner, ATR and compression observations with explicit parameters |
| 13 | Stablecoin liquidity | Supply, issuance/redemption, bridges and exchange flows, with observed coverage |
| 14 | Derivatives/liquidation context | Funding, open interest, actual liquidation feeds and explicitly labeled modeled heatmaps |
| 15 | Protocol economics | Fees, protocol revenue, token-holder revenue, yields and clearly defined valuation multiples |
| 16 | Regulation | Dated jurisdiction/project developments with primary sources and nuanced risk notes |
| 17 | Global central banks | Fed, ECB, PBoC, BoJ, BoE and other relevant policy/calendar series; scenario interpretation |
| 18 | VC momentum | Rounds, investors, sector funding trends and pre-token projects |
| 19 | Sale-price/unlock risk | Disclosed historical prices, spot-to-sale multiples, vesting and dilution context |
| 20 | Unified calendar | Project, macro, listing, governance, upgrade and unlock events |
| 21 | Corporate treasuries/equities | Sourced holdings, corporate liabilities/share structure, NAV methodology and related equity narratives |
| 22 | Supply concentration/whales | Holder distribution, exchange/bridge/treasury labels, custody caveats and abnormal flows |
| 23 | Early discovery | Developer activity, community metrics where accessible, new pools/contracts and liquidity growth |
| 24 | Yield/spread monitor | Yield composition and risks; executable spread estimates incorporating fees, gas, depth and transfer constraints |
| 25 | Relative strength | Benchmark-relative returns, beta/correlation, divergent performance; no automatic claims about accumulation |
| 26 | Journal and plans | Ideas, active plans, closed reviews; entries, invalidations, targets, sizing and behavioral notes |
| 27 | Builder/alliance intelligence | Developer datasets, hackathons, grants, conferences, corporate pilots and real integration evidence |
| 28 | Foundation treasury/tokenomics | Treasury composition, stablecoin reserves, native-token exposure, grants, emissions and unlocks |
| 29 | Scrapbook | Saved X/news/article links, notes and screenshots in a per-project library and general investing/crypto hub; project/topic tags, portable backups and optional AI summaries |
| 30 | Token value capture | Evidence-backed utility classifications and mechanisms linking project success to token economics |
| 31 | Narrative leaderboards | Category discovery, leader/challenger comparisons, sector rotation and valuation scenarios |

## 5. Original Atlas requirements that remain first-class

- Full per-project research coverage above, including website/socials/GitHub, team, VC investors and ICO/presale data.
- Exchange & Liquidity Intelligence: both CEX and DEX discovery, executable depth where available, accurate units and market links.
- Project-specific news, event tracking, comparative research, evidence and thesis invalidation.
- Personal watchlists, Buy List, holdings and decision history.
- CoinMarketCap watchlist/portfolio import as a separate access investigation. Do not assume a market-data API key grants access to personal CMC account data. Offer supported exports/manual import if direct access is unavailable; never fabricate holdings.
- RWA/security services, independent ratings and broad macro context in the candidate provider map.
- The Tie inspiration: configurable research views, screeners, relationships, event context and relevant alerts.
- Token Terminal inspiration: consistent metric definitions, historical comparisons, transparent methodology and source inspection.
- Article tool lists remain discovery inputs, not proof that endpoints are free or accessible.

## 6. Provider architecture and candidate stack

The complete domain-by-domain candidate map is in [DATA-SOURCES.md](DATA-SOURCES.md). This table summarizes the intended families, not active subscriptions.

| Data family | Candidate providers |
| --- | --- |
| Market, identity, categories | CoinMarketCap, CoinGecko; CoinStats/CoinPaprika alternatives |
| Candles/technicals/charts | Exchange APIs/Binance, Mobula, altFINS, Atlas calculations, TradingView display |
| CEX/DEX/liquidity | CoinGecko listings, CCXT order books, DexScreener, Mobula, CMC DEX |
| Fundamentals/team/funding/investors | RootData, CMC, CoinGecko, TokenInsight, CryptoRank/Dropstab/manual evidence; Messari later |
| Tokenomics/sales/unlocks | Official documents, Mobula, CryptoRank, Dropstab, Tokenomist/manual; endpoint access verified individually |
| Protocol economics/yields/treasuries | DefiLlama; Dune and Token Terminal where access supports the needed metrics |
| On-chain/wallets/security | Mobula, Dune, chain RPC/Alchemy; Nansen, Arkham, Glassnode and specialist security feeds later |
| Derivatives | Exchange APIs; CoinGlass or specialist data for richer coverage |
| News/attention/search | RSS, cryptocurrency.cv, official announcements, Reddit, permitted search-trend sources; LunarCrush/Santiment/X or other paid tools later |
| Builders/alliances | GitHub, Electric Capital datasets, official grants/hackathon/event and partnership sources |
| Macro/global markets | FRED, official central banks and calendars, World Bank; Trading Economics, Twelve Data, Alpha Vantage where appropriate |
| Regulation/geopolitics | Official sources, sourced news, GDELT and manual research |
| Calendar | Official project announcements, RootData, CoinMarketCal and verified unlock/listing sources |
| User-owned research | Supabase; exports/imports and retained browser recovery data |

One primary provider per metric, with contract-compatible fallbacks where justified. UI reads normalized snapshots instead of calling every provider at page load. Refresh by data type: markets often, fundamentals less often, events on schedule. Background jobs, shared durable cache, retries with backoff, request budgets, partial failures and monitoring are prerequisites for scaling. Number of providers alone does not determine speed: request design and isolation do.

## 7. Corrections required before implementation

The Gemini document contains product ideas mixed with unverified factual and API claims. Keep the capabilities; do not hardcode the claims as truth.

- The proposed October 2026 bottom, $30k–$50k zone and September 2029 target are user research scenarios. Verify historical anchors; never present a future bottom as certain or globally suppress signals based on a fixed date.
- Verify endpoint availability, permissions, quotas and prices at integration time. Do not assume one CMC credit per arbitrary batch, unlimited free OHLCV, or that market-chart series are exchange OHLCV.
- Attention/source coverage, setup counts and heuristic scores are not calibrated success probabilities. Missing feeds must not silently inflate a score.
- OI and funding alone cannot locate exact liquidation prices. Use observed datasets or label assumptions and uncertainty.
- A new open perpetual contract has both a long and a short; OI direction cannot identify the initiating side. Funding sign is a cost/pressure observation, not a proven entry or exit. Exchange funding intervals and baseline components can change. Estimated liquidation bands are relative model outputs, not exact orders or reliable price targets. Do not infer spot-led buying without aligned spot and futures data.
- Peer-market-cap scenarios are hypothetical, supply-sensitive calculations, not fair-value forecasts. Disclosed sale-price multiples are not known investor cost bases or realized profits.
- Protocol revenue, fees and token-holder distributions are different. Stablecoin supply changes are not automatically exchange buying pressure. Transactions to an exchange do not prove a sale.
- Governance-only does not prove zero economic value; treasury size, TVL floors, low volatility and country labels do not establish safety.
- News silence, search spikes, relative strength and whale movement require context; they do not establish institutional accumulation.
- Backtests use closed candles, consistent timestamps, realistic fees/slippage, no look-ahead and out-of-sample evaluation. Capture skipped decisions at the time, not after knowing outcomes.
- AI proposes structured interpretations/configurations with evidence and review. It must not execute arbitrary generated strategy code or silently change position sizes.

## 8. Implementation snapshot — 2026-09-28

Ongoing feature status is maintained in [BACKLOG.md](BACKLOG.md). This snapshot includes the first usable daily-desk implementation.

### Implemented, with bounded coverage

- Next.js/TypeScript app, shared navigation and temporary Atlas branding; domain/provider foundation with validation, timeouts, caching, throttling and observed status.
- Key-free CoinPaprika asset discovery, quotes/global context and on-demand sourced profiles. Existing CoinGecko adapters require configuration; DexScreener pools and DefiLlama protocol TVL remain narrow integrations.
- Projects, statuses, narrative tags, conviction, watchlists, Buy List and manual thesis/risks/invalidation/structured team/funding/tokenomics/evidence.
- Daily dashboard from real market snapshots and saved projects; research coverage, next actions/dates, dated review journal and manual catalyst calendar. Provider profile references do not overwrite personal notes.
- Private Supabase persistence integration and explicit browser-only mode. Version 3 compatible backups accept old records. Browser-to-cloud transfer remains deferred by the user.
- 38 automated checks, typecheck, lint and production build passed. Browser-only create/profile/save/reload/review/calendar/journal verified. Live cloud transactions verified new fields, revision conflicts and account isolation using rolled-back disposable data. Signed-in browser save/reload remains outstanding.

### Not yet implemented as working intelligence

- Most specialist pages remain previews. Macro rates/money supply, chain-level TVL/RWA/revenue comparison, typed organization connections and automatic news are planned.
- Full project/network/token model, shared evidence model, historical warehouse, scheduled ingestion and multi-instance budgets.
- Strategies/backtests, full charts/executable depth, AI, scrapbook, detailed portfolio accounting and richer decision history.
- Automatic CMC personal-account import, automatic trade execution or public deployment.

## 9. Delivery sequence

[ROADMAP.md](ROADMAP.md) is the authoritative build order and next batch. [BACKLOG.md](BACKLOG.md) records implementation status and maps every blueprint section to feature IDs. This replaces the earlier A–G sequence so there is one delivery plan to maintain.

The sequence is trusted foundation → usable project research → daily desk → macro/policy and chain/trading access → connected intelligence → decisions/strategy → assistance/alerts → specialist expansion. These are usable releases, not fixed dates or a requirement to complete every capability before starting a small dependent slice. Browser migration remains deferred and does not block independent work.

## 10. Shared completion standards

For every feature: source coverage is declared; units/definitions are visible; unknowns remain unknown; calculations are reproducible; errors and stale data are labeled; manual research is preserved; provider secrets stay server-side; personal records remain account-isolated; interactions work on mobile and desktop; tests cover meaningful data/access behavior. Add narrow providers only when a named feature needs them.

## 11. Screenshot additions — stress, rotation and adoption

Added 2026-09-28 from the three user-provided screenshots. Planning only; no indicator or UI implementation in this review. These expand Gemini sections 6–8, 13, 17, 25 and 31 rather than replacing the original scope. Keep three distinct timescales and do not collapse them into one buy/sell score.

### A. Cross-market stress monitor (VIX screenshot)

VIX measures annualized, option-implied expected S&P 500 volatility over roughly 30 days. It is not Bitcoin volatility and does not predict market direction. Treat the screenshot's action labels as proposed heuristics, not instructions or validated timing rules. Its displayed “current” 14.87 is part of the supplied image, not a verified current reading.

First version: VIX level, dated observation, daily/weekly change, historical percentile with explicit lookback, and configurable descriptive bands. For testing the pictured scheme use <20, 20–<30, 30–40 and >40 with unambiguous boundaries. Label these lower/elevated/high/extreme implied-volatility bands, not automatic trim/hold/buy instructions. Compare VIX direction against BTC returns, drawdown and realized volatility, alongside the already-planned dollar, rates and liquidity context. High volatility alone does not establish a bottom; lower volatility alone does not establish a top.

Initial candidate: FRED VIXCLS daily closing data (Cboe source); observe licensing/attribution and API access requirements before integrating. Preserve business-day timestamps; weekend crypto observations must not make Friday's equity reading appear newly updated. Optional later data: VIX term structure and a properly sourced BTC implied-volatility index, with their definitions and coverage kept distinct.

Validation: study forward BTC returns AND adverse excursions at multiple horizons after band entry, separate initial spikes from declining stress, handle repeated signals/dependence, and use out-of-sample periods. No claim of profitable timing until tested.

### B. Crypto leadership and rotation tracker (altseason screenshot)

Track evidence for Bitcoin leadership, Ethereum leadership, large-cap participation and broad altcoin participation. Permit mixed, unclear, defensive and reversal states: phases can overlap, skip or reverse, and altseason is not inevitable. Leadership observations do not by themselves prove money physically moved from one asset into another.

Inputs:
- BTC dominance and its change, with the denominator/universe defined.
- ETH/BTC relative performance over documented windows.
- Large-, mid- and small-cap baskets against BTC and USD.
- Percentage of eligible assets outperforming BTC over 30 and 90 days; show the constituent count and exclusions.
- Breadth above selected moving averages, participation by sector, volume and liquidity coverage.
- Defined aggregate altcoin series, including whether stablecoins/wrapped duplicates are excluded. Do not label a custom basket TOTAL2/TOTAL3/OTHERS unless its construction matches the named source.
- Stablecoin supply and observed flows as context, not inferred buying pressure.

Use point-in-time constituents and liquidity eligibility for historical tests, document rebalancing and delistings, and avoid survivor-only comparisons. Separate relative outperformance from positive absolute returns: an altcoin losing less than BTC is not necessarily in an expansion. Require persistence before changing the displayed phase to reduce one-day flicker.

CMC's published Altcoin Season Index uses the top-100 universe, excluding stablecoins and asset-backed wrappers, and a 90-day comparison; 75% outperforming BTC is its altseason threshold. It is a useful reference indicator, not proof of all four stages. Atlas's custom horizons/universe must have a distinct name; endpoint access remains to be verified.

Display: current observed leadership, supporting/contradicting signals, window, data coverage, last update and recent transitions. A rule-strength label describes the evidence, not a probability of future returns. Future alerts report changes such as “altcoin participation broadened” rather than buy instructions.

### C. Long-term crypto adoption map (industry-era screenshot)

Keep the six themes: digital money; programmable finance; speculative/collectible applications; tokenization; physical infrastructure/economy; machine economy. These are overlapping themes, not mutually exclusive historical eras. The image's future dates and “consensus future” language are a scenario supplied for discussion, not verified consensus. “Seriousness” is subjective and should not become an unexplained score.

Replace that axis with inspectable evidence: paying users, recurring fees/revenue, production deployments, developer retention, institutional usage, regulatory milestones and token value capture. Use sector-appropriate denominators and definitions; subsidized transactions, tokenized asset value and paid utilization are not interchangeable adoption measures.

Illustrative evidence by theme: settlement/store-of-value usage; stablecoin payments/DeFi usage; speculative attention; issued and actively used tokenized assets; paid compute/energy/network utilization; verified agent transactions and recurring service demand. Project stages may be research, testnet, pilot, production or demonstrated recurring usage. Record source, date, claim strength and counterevidence for each stage.

Projects can map to multiple themes. Link sector leaders/challengers, bank/corporate alliances, funding, grants and developer activity into this view. Maintain alternative futures and invalidation conditions rather than treating the pictured dates as a schedule.

### Display and rollout

Daily Dashboard: three concise summaries — market stress, crypto leadership and adoption themes — only when supported by sourced data. Macro & Cycle workspace: Stress, Rotation and Adoption tabs with history, definitions, evidence and scenario comparison. No current-state labels should be generated from screenshots.

Build order: VIX history and BTC/ETH/dominance first; breadth and rotation after historical constituents and market data are dependable; manually curated adoption map before automated evidence enrichment. Future alerts and backtests follow validated definitions. These screenshot requirements were captured during the planning review; current delivery order is in ROADMAP.md.

References checked for definitions, not current market readings:
- Cboe: https://www.cboe.com/insights/posts/what-the-vix-and-vix-1-d-indices-attempt-to-measure-and-how-they-differ
- FRED VIXCLS: https://fred.stlouisfed.org/series/VIXCLS
- CMC Altcoin Season Index: https://coinmarketcap.com/charts/altcoin-season-index/

## 12. Organization connections and relationship intelligence

Added 2026-09-28 from two user screenshots listing tokens beside corporate/institutional names. This expands project dossiers, funding/investor intelligence and Gemini section 27. Planning only. Screenshot pairings are unverified research leads, not confirmed partnerships; no pairings have been imported as facts.

### Coverage

Companies, banks, central banks, asset managers, payment networks, universities, research institutes, public agencies, standards bodies, foundations, nonprofits, industry consortia, VCs and other investment organizations. Projects, networks, operating companies, foundations and tokens remain distinct entities. A relationship with the company or a product must not automatically be assigned to its token.

### Relationship records

Model a many-to-many organization/project relationship with explicit direction and type:
- Equity investment, token investment, disclosed token holding, grant or sponsorship.
- Customer, supplier, commercial integration, payment acceptance or product deployment.
- Pilot, proof of concept, research collaboration or joint development.
- Council membership, consortium membership, validator/node operation or standards participation.
- Academic lab collaboration, sponsored research, university grant or student initiative.
- Ecosystem compatibility, third-party product exposure or indirect connection, clearly distinguished from a direct agreement.

Each record includes canonical organization/project IDs and aliases; exact named division, lab or subsidiary; relationship type; plain-language description; use case; direct/indirect status and intermediary; announcement/start/end dates when known; stage (announced, pilot, production, paused, ended, unknown); status-as-of and last-reviewed dates; supporting and contradicting source links; who made the claim; verification state; materiality evidence; and known or unknown token relevance. Allow multiple relationships between the same entities and retain change history.

Verification is separate from commercial maturity: a confirmed pilot is not a production customer. University affiliation of a founder, professor or student does not establish an institution-wide partnership. An asset manager offering exposure to a token is not automatically an investor in the project company. Cloud hosting/marketplace availability is not automatically a strategic alliance. Payment acceptance, merchandising, sponsorship and technical integration are different relationships. Keep source wording precise.

### Interface

- Project page: Organizations & Connections section with logo/name, relationship type, stage, evidence status and a concise explanation. Group by investors, enterprise/adoption, academic/research, and public-sector/ecosystem connections.
- Organization page: reverse view showing all connected projects, sectors and relationship types, with sources and historical changes.
- Directory filters: organization type, named organization, relationship type, sector, production vs pilot, verification state and review recency. Support queries such as projects with sourced university research collaborations or bank pilots.
- Optional relationship graph: typed, directional edges; visible indirect paths; filters to control clutter. A table remains the accessible default and fallback.
- Dashboard: only material, sourced relationship changes with links to evidence; a new logo is not by itself a high-priority signal.
- Comparison: evaluate adoption evidence and relationship maturity, not simply count prominent logos.

### Research and enrichment

Begin with structured manual records and official project/counterparty announcements, university/lab pages, institutional reports and relevant filings. Expand with verified provider/news feeds as available. AI may extract candidate entities and relationship claims for review; it must not label unsupported claims as confirmed or infer endorsement. Capture entity-resolution ambiguity, outdated branding/tickers and terminated relationships. The screenshots are a discovery queue only until each claim is checked.

### Delivery and safeguards

First deliver structured relationship records, sources, project display and organization filters. Next add reverse organization pages, change monitoring and deduplicated enrichment; graph visualization follows once enough reliable records exist. Evaluate significance through disclosed use, scale, production status and token linkage. Do not invent contract values, customer revenue, token demand or partnership-strength investment scores. Relationships can be valuable evidence without proving token value capture or future returns.

## 13. Chain capital, RWA and accessible liquidity intelligence

Added 2026-09-28 from the user-provided RWA chain-ranking screenshot. Extends TVL, stablecoins, flows, RWA, liquidity and adoption modules. Planning only. The screenshot's values/ranking are unverified leads with no established observation date or measurement definition; do not import them as current chain statistics. Its horizontal scale uses logarithmic-style ticks, so bar lengths must not be interpreted as proportional dollar comparisons.

### Questions to answer

Where are assets recorded? Where is capital deployed? Where is fresh capital moving? Which assets can users actually access, trade, borrow against or redeem, under what conditions? How does activity translate into protocol revenue or token value capture? These are separate questions, not one aggregate liquidity number.

### Metrics and definitions

- Chain and protocol TVL with history and 1d/7d/30d changes, asset composition, protocol/category breakdown and explicit staking/borrowed/double-counted inclusion settings. Use comparable methodology and time points across chains.
- Distinguish USD valuation changes from net deposits/withdrawals. Show provider-defined net flows where available; a TVL increase alone is not an inflow measurement.
- Stablecoin supply by chain/issuer, native versus bridged variants, supply changes and market share. Supply is not all idle purchasing power and may overlap protocol TVL or RWA categories.
- RWA value split by provider-defined distributed/represented classification, separately showing stablecoins by default. Break down asset class (government debt, credit, funds, equities, commodities, real estate), issuer/platform, network and outstanding value. Do not mix outstanding asset stock with cumulative issuance, serviced loan balances, transaction volume or market capitalization of an RWA project's governance token.
- Bridge inflows, outflows and net flows by covered route, period and asset, with canonical asset mapping. These are not comprehensive external inflows: bridges can miss issuer-native mint/burn transfers, exchange movements and other channels.
- Trading liquidity: DEX pool reserves and volume alongside size-specific executable quotes, price impact, spread, route and timestamp. CEX order-book depth is venue-specific and belongs in a separate connected view; it is not assigned as chain TVL. Large pool TVL or high reported volume does not establish executable depth.
- Lending: deposited collateral, outstanding borrowing, currently available liquidity, utilization and collateral/borrow limits where supported.
- Adoption context: holder/address counts with entity-count caveats, transfers distinct from trades, active protocols, fees/revenue, concentration by issuer/protocol/asset and relevant organization connections.

### Accessibility is a separate dimension

Store access conditions per asset, venue or product: permissionless, KYC/allowlist required, institutional/accredited eligibility, jurisdictional restrictions, minimum investment, supported wallets/networks, trading venue, transferability, collateral eligibility, mint/redemption terms, dealing windows, fees and settlement delays. Source and date these conditions; unknown does not mean unrestricted. Distributed classification does not itself establish permissionless access, active secondary markets or available depth. User-specific eligibility should not be presumed.

Keep asset value, market access and redemption liquidity distinct. No synthetic total from adding TVL + stablecoins + RWA + bridged value: these can describe overlapping claims on the same capital. Identify underlying assets and wrappers, source versus destination representations, and cross-chain deployments to prevent duplicate totals. Preserve gross provider figures with clear labels when reconciliation is not possible. Do not multiply global asset NAV across every supported chain.

### Interface

Chain Explorer with sortable tables and selectable metrics, plus small history charts. Default columns: chain, DeFi TVL, stablecoin supply, 30d chain fees, 30d chain revenue and freshness/coverage. Selectable columns include covered net flows, RWA distributed/represented value, DEX volume, app revenue and revenue growth. Keep the default table readable; offer a dedicated Economics view for revenue comparisons (see §17). Secondary pages expose pool/asset access, liquidity and concentration instead of forcing them into one score.

Drill-down: chain → protocols/issuers → assets/pools → trading/redemption conditions and sources. Compare chains using consistent filters, stablecoin inclusion, time windows and definitions. Connect issuer organizations to the Organizations & Connections module and protocols/tokens to the project dossier. Clearly label logarithmic axes when used; default ranking bars should use an understandable linear scale or a table when the range is too large.

Dashboard summaries highlight sourced changes in capital and usage, with links to details. An increase in chain assets does not by itself establish native-token demand or an investment recommendation.

### Providers and delivery

Extend the existing narrow DefiLlama TVL adapter first with verified chain/history endpoints, then stablecoins, DEX activity and covered flows. Evaluate RWA.xyz as a specialist source for asset/network/issuer classification and values; verify API entitlement, licensing, costs and fields before integration. Official issuer/platform documents support access, ownership, redemption and institutional relationship evidence. DexScreener supports pool discovery; quote/venue-specific integrations are required for executable liquidity estimates. Dune or chain RPC may fill named gaps with explicit methodologies.

First slice: chain TVL history and stablecoin comparison. Next: RWA classification and issuer/asset drill-down. Then: access conditions, executable liquidity and lending depth. Advanced net-flow attribution and historical concentration follow dependable data. This addition was captured as planning; current delivery order is in ROADMAP.md.

Definition references reviewed:
- DefiLlama TVL and USD inflows: https://defillama.com/data-definitions
- RWA.xyz dataset and classifications: https://app.rwa.xyz/
- RWA.xyz documentation: https://docs.rwa.xyz/home

## 14. Global money supply and monetary conditions

Added 2026-09-28 from the user-provided global money supply screenshot. Planning only. Expands global macro and Gemini sections 6, 7, 13 and 17. The quoted $103.66 trillion total, $1 trillion August increase and ten-month streak have not been verified and are not imported as observations.

### Scope and measures

Track official broad-money series first for the United States, China, euro area and Japan. Label this initial basket “Major-economy M2 composite (US, China, euro area, Japan)” rather than the whole world. Expand country coverage deliberately (UK and other major economies) and preserve basket versions. Do not count euro-area member countries again alongside the euro-area aggregate.

Country panels show native-currency money stock, USD equivalent, month-on-month/year-on-year growth, 3/6-month momentum, observation period, release date, retrieval date and revisions. Show an aggregate history, country contributions and data completeness. Treat acceleration/deceleration as changes in growth, distinct from expansion/contraction of the stock. Nominal record highs alone are not timing signals.

Use one documented M2 series per initial geography, keeping region-specific definitions and methodological differences visible. Euro-area M3 can be a separate broader-money view; do not silently substitute it for M2. UK additions may use M4/M4ex in a distinctly named broad-money basket rather than falsely label it M2. Record seasonal adjustment, units, frequency, period-average vs period-end basis and breaks/reclassifications. Where differences cannot be reconciled, label the composite approximate and keep country series available.

### Currency conversion and publication timing

Normalize units before aggregation. With FX quoted as USD per local-currency unit: composite = sum(native money stock × matching FX rate). Define whether monthly average or month-end FX is used, use it consistently, and retain FX source/date. Show a current-FX USD view alongside a fixed-FX-base comparison to distinguish domestic monetary changes from currency translation. State the fixed base period and avoid describing exchange-rate gains as new money creation.

Default the aggregate to the latest common available observation month. A separate latest-available estimate must display each component's month and missing/stale constituents; do not quietly mix vintages. These are published macro series, generally updated on release, not a live money counter. Cache until relevant releases. Backtests use values available on the actual release date and historical vintages where obtainable, not subsequently revised data. Flag limited vintage coverage explicitly.

### Separate macro layers

Broad money, central-bank assets/QE/QT, reserves and fiscal cash/liquidity measures are related but different datasets. Keep them separate in charts and calculations. M2 growth is not a measure of central-bank printing or a direct measurement of funds entering crypto. Do not add central-bank assets to broad money or count stablecoins as automatically additional global money.

### Bitcoin and cross-asset research

Offer normalized overlays for broad-money growth and BTC/ETH, gold and equity returns, with explicit transformations/time windows. Analyze growth/returns rather than infer relationships from two rising level charts. Optional user-selected lead/lag comparisons must expose the lag, test stability across periods and use out-of-sample evaluation; no fixed assumption that Bitcoin follows M2 by a specific number of days. Explain correlation, uncertainty and conflicting evidence without implying causality or guaranteed price targets.

Connect this view to VIX stress, crypto rotation, stablecoins and chain flows as complementary layers. Country-specific access/capital controls and the imperfect relation between money stock and investable risk capital remain visible caveats. No automatic position sizing or trade execution from a money-supply threshold.

### Presentation and sources

Dashboard: one dated monetary-context summary with growth, momentum, coverage and a link to detail. Macro workspace: country panels, composite, FX decomposition, release calendar, methodology and historical comparisons. Potential alerts: new release, growth turning positive/negative, growth acceleration/deceleration and divergences—not buy/sell instructions.

Candidates: Federal Reserve H.6/FRED for US M2, ECB Data Portal for euro-area monetary aggregates, PBoC official monetary statistics, Bank of Japan Money Stock statistics; official FX series or a suitable licensed source. Later consider IMF/other harmonized datasets for broader coverage. Verify access, licensing, definitions and release schedules before implementation. Preserve official revisions and series-definition changes.

References reviewed:
- Federal Reserve H.6: https://www.federalreserve.gov/releases/h6/about.htm
- ECB monetary aggregate definitions: https://data.ecb.europa.eu/methodology/what-are-monetary-aggregates
- Bank of Japan money stock: https://www.boj.or.jp/en/statistics/money/ms/index.htm
- Example PBoC official release (historical, not a current reading): https://www.pbc.gov.cn/en/3688247/3688978/3709137/5838983/index.html
- Bank of England money creation explanation: https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy

## 15. Trade policy, geopolitical events and agreements

Added 2026-09-28 from the user's screenshot describing a claimed US–China agreement. Planning only; the specific summit, tariff amounts, dates and commitments in the screenshot have not been verified and are not recorded as facts. Expands geopolitics, regulation, news and calendar services and Gemini sections 9, 16, 17, 20 and 27. No background monitoring or notifications are activated by this planning addition.

### Coverage

Tariff increases/decreases, exemptions and retaliation; trade agreements and negotiation rounds; leader/ministerial meetings and summits; sanctions and export controls; energy, commodity and critical-mineral agreements; technology/AI cooperation; investment commitments; relevant elections, legislative votes, judicial decisions and ceasefire/security developments when materially connected to the macro research scope. Track upcoming events, announcements and implementation as linked but separate records.

### Structured records

- Parties, jurisdictions, responsible agencies and participating organizations; geography and sector tags.
- Event type, scheduled date/time/time zone, timing precision, agenda, cancellation/postponement and actual outcome.
- Agreement/measure type and stage: reported claim, proposed, negotiating, announced, signed, ratification/implementation pending, effective, suspended, expired, terminated or disputed. Confirmation state is a separate field; do not force all legal processes into a single mandatory sequence.
- Announcement/publication/effective/expiry/review dates, deadlines, exceptions, conditions and renewal provisions. Preserve unknown dates instead of inventing countdowns.
- Tariff details: imposing jurisdiction and affected origin/destination, covered products/HS codes when available, previous/new rate, percentage-point change, additional vs total rate, specific-duty units where applicable, quotas, exemption scope and source text. Avoid inventing an average rate across unlike goods or stacking tariffs without the legal rules.
- Deal amounts: currency, period, goods/services coverage, bilateral direction and whether a figure is a commitment, ceiling, estimate or realized amount. Do not describe a multiyear pledge or covered trade value as cash already deployed.
- Official statement/legal text/readout links, counterparty confirmation or disagreement, news corroboration, quotation/translation provenance, first-seen time, last-reviewed time and revision history.

### Intelligence and presentation

Macro workspace: Trade & Geopolitics tab containing an upcoming calendar, a developments feed, an agreement/measure tracker and country-pair timelines. Filters for country, sector, event type, stage, source verification and date range. One event may produce multiple agreements/measures with distinct effective dates; deduplicate reporting while preserving conflicting accounts.

Dashboard: a few relevant changes and imminent deadlines with plain-language explanations. Project and narrative pages show explicitly sourced exposure paths (e.g. affected corporate counterparties, jurisdictions, supply chains or infrastructure costs), separated from analyst hypotheses. Connect these to Organizations & Connections. Do not infer a token partnership from participation in a summit or from a country's agreement.

Each detail view separates: what changed; what remains conditional; possible transmission channels; affected markets/sectors; supporting/countervailing evidence; observed price/volume reaction; and next milestones. Macro impact is an interpretation, not an established fact or guaranteed bullish/bearish signal. Event studies must account for announcement timing, market hours, concurrent news and available historical vintages; price movement after an event does not prove causation. Relevance and evidence strength are separate from predicted market impact.

Potential future alerts: meeting announced/rescheduled, joint statement published, tariff rule becomes effective, exemption/truce approaching expiry, ratification vote, material change in agreement status. User-configurable subscriptions and deduplication; no automatic trade execution or position changes. Do not claim that alerts are running until implemented and explicitly enabled.

### Sources and rollout

Prioritize legal gazettes, customs/trade ministries, official government and foreign-ministry statements and counterpart readouts; use WTO monitoring and agreement repositories for structured cross-checks. Candidate examples: USTR, US Federal Register/CBP, EU trade and Council sources, China MOFCOM/MFA and relevant country authorities. News/RSS/GDELT can discover claims, but an article or a one-sided statement is not automatically proof that a measure is legally in force. WTO monitoring is periodic, not a breaking-news stream. Verify API/feed access, language coverage, terms and update cadence before integrations.

First slice: manually curated, sourced event/measure records and calendar dates. Next: official announcement/feed ingestion, deduplication and change history. Later: project/narrative exposure mapping, event studies and configurable monitoring. Application implementation remains paused while requirements are collected.

Reference source discovery (not verification of the screenshot's claim):
- WTO trade monitoring: https://www.wto.org/english/tratop_e/tpr_e/trade_monitoring_e.htm
- USTR trade agreements: https://ustr.gov/trade-agreements
- European Council meeting calendar: https://www.consilium.europa.eu/en/meetings/calendar/

## 16. Global rates and macro trend framework

Added 2026-09-28. Planning only; extends the macro workspace rather than creating a separate disconnected dashboard. Objective: assess growth, inflation, financing conditions, monetary conditions and market stress, then examine their relationship with crypto without assigning automatic trade instructions.

### Global policy-rate monitor

Worldwide country/monetary-area directory as source coverage allows. Prioritize US, euro area, UK, Japan, China, Canada, Australia, Switzerland, India, Brazil, Mexico and South Korea; add other economies through verified coverage. The euro area is a shared monetary-policy jurisdiction, not independent national policy rates. Where central banks use several instruments, explicitly select and name the instrument rather than presenting unlike series as identical.

For each: policy instrument, current rate or target range, effective date, last decision and basis-point change, 3/6/12-month change, policy history, next scheduled decision/time zone, official guidance and source freshness. Preserve upper/lower bounds for target ranges. Distinguish target from effective/traded rates. Store scheduled vs confirmed meeting dates and unscheduled decisions. Add expected decision/market-implied policy path only when an entitled reliable source exists; do not substitute a previous reading or analyst narrative for consensus.

Show tightening, holding and easing breadth with explicit coverage and period. A high nominal rate or rate cut alone is not a risk-asset signal. Keep policy rates, bond yields and real-rate proxies separate. Current policy rate less trailing inflation is an ex-post proxy; inflation-linked yields and matched-horizon expected real rates are different measures. Label these precisely.

### Indicator families and priorities

| Family | First useful metrics | Deeper coverage |
| --- | --- | --- |
| Policy and funding costs | Policy decisions, US and selected sovereign 2y/10y yields, 10y-minus-2y curve, US inflation-linked real yield | OIS/futures expectations, country rate differentials, term-premium estimates, repo/funding stress |
| Inflation | Headline/core CPI, US PCE/core PCE, euro-area HICP; monthly and yearly changes | PPI, wage growth, survey expectations, breakevens with liquidity/risk-premium caveats |
| Growth and demand | Manufacturing/services surveys where licensed, retail sales, industrial output, quarterly GDP | New orders, OECD leading indicators, consumer/business confidence, country-specific activity indicators |
| Employment | US payrolls, unemployment, claims and wages; relevant country unemployment/employment releases | Vacancies, hours worked, participation and hiring/layoff trends |
| Money and credit | Previously planned money-stock baskets, central-bank balance sheets, lending growth | Lending standards, credit impulse with explicit definition, reserves and balance-sheet composition |
| Dollar and currencies | Broad dollar measure, EUR/USD, USD/JPY, USD/CNY and USD/CNH distinguished | Effective exchange rates, FX volatility, reserve holdings, carry/funding exposures |
| Financial stress | VIX, investment-grade/high-yield credit spreads and financial-conditions index | Bond volatility where licensed, bank funding indicators, sovereign spreads and CDS where accessible |
| Commodities and supply | Oil, gold and copper; selected gas benchmarks | Freight/shipping, supply-chain pressure, food/energy shocks and inventory context |
| Fiscal and sovereign context | Major budget/issuance announcements and Treasury cash developments | Deficits/debt, interest burden, maturity profile, current account/external financing; avoid false real-time precision |
| Trade and politics | Previously planned tariff/deal/sanction/meeting calendar | Sourced exposure mapping, implementation follow-through and event studies |
| Crypto transmission | Stablecoin supply/covered flows, BTC/ETH relative performance, relevant fund flows where sourced | Derivatives leverage, chain deposits, lending demand and observed liquidity changes |

### Daily display versus research depth

Daily overview contains six compact panels: rates/yields; money/liquidity; inflation; growth/jobs; dollar/stress; upcoming releases and policy events. Summaries emphasize what changed, freshness, missing inputs and conflicting evidence. Full country cards, historical overlays and tables live behind these panels. Crypto-specific flows link into the already-planned chain/market modules rather than duplicating datasets.

Provide a descriptive regime assessment across independent axes (growth improving/slowing, inflation rising/falling, financial conditions easing/tightening, stress elevated/subdued), with mixed/unclear states. Do not present recession probabilities or a single confidence/buy score without an explicitly validated model. If summaries use rules, expose their thresholds, inputs, version and rationale.

### Economic calendar and data integrity

Store reference period, publication date/time/time zone, prior first-release and revised values, actual, consensus and forecast-source timestamp when available. A surprise is actual minus the appropriate timestamped forecast with matched units, not an invented expectation. Preserve seasonality, year-over-year/month-over-month/annualized distinctions and rate changes in basis points. Retain revisions and point-in-time vintages for historical research. Do not mix today's revised history with what a trader could have known at the time. Respect macro release cadence, trading holidays and missing data rather than pretending every indicator updates live.

### Sources and rollout

BIS policy-rate statistics provide a candidate cross-country backbone; official central-bank decisions and calendars provide instrument details and timely changes. Use official statistical agencies (e.g. BLS, BEA, Eurostat and country equivalents), FRED with original-source provenance, ECB/PBoC/BoJ/BoE and other central banks. OECD leading indicators supplement activity analysis; IMF/World Bank support slower structural context, not intraday releases. Survey data, consensus estimates, futures expectations and specialist volatility indices can have licensing/access constraints; verify before connecting and leave unavailable fields explicit.

Initial delivery: rates/decision calendar, key sovereign yields, inflation and money/liquidity series alongside VIX/dollar. Next: growth/employment, credit conditions and commodities. Later: fiscal/external vulnerability, expectations/surprises and validated regime/event analysis. Reuse a modest set of providers across these indicators and retain the separate screenshot-review pause on application coding.

References reviewed:
- BIS policy-rate coverage/methodology: https://data.bis.org/topics/CBPOL
- BIS statistical families: https://www.bis.org/statistics
- OECD leading indicators: https://www.oecd.org/en/data/datasets/oecd-composite-leading-indicators-clis.html
- IMF World Economic Outlook dataset: https://data.imf.org/Datasets/WEO


## 17. Chain and project revenue — economic sustainability

Added 2026-09-28 to make the user's revenue requirement explicit at both chain and project level. Extends §3, §13 and Gemini sections 15/30; tracked by ATLAS-027 with ATLAS-022. Partial: current DefiLlama daily revenue rankings and chain/app filtering are available. The full economics view, costs, holder capture and revenue history remain planned.

**User questions:** Which networks and applications earn revenue from use? Who receives it? How dependent is activity on incentives? What costs are known? Does economic activity benefit the token?

### Separate economic entities

Keep network economics, applications operating on a network, the project/company/DAO and the token distinct. A chain comparison may show app revenue alongside chain revenue, with visible coverage; do not attribute app revenue to the chain treasury or native-token holders. Use chain-specific allocation for multi-chain apps only when supported. Otherwise show global app revenue separately, rather than duplicating it across deployments.

### Economics view

| Metric | Display requirement |
| --- | --- |
| User fees | Amount paid for usage, with provider definition and recipients; chain fees separate from application fees. |
| Chain/protocol revenue | Provider-defined share captured by the network/protocol, with allocation to treasury, operators or holders explained where known. Chain-specific definitions must be inspectable. |
| App revenue by chain | Covered applications' revenue attributed to that network, with included/excluded categories and missing coverage. |
| Token-holder value capture | Separate actual distributions, revenue-funded buybacks and burns. Distinguish cash received from noncash burn mechanisms; inflationary staking issuance is not fee revenue. |
| Incentives and operating costs | Record disclosed incentives, token emissions, validator/sequencer and settlement/data-availability costs where applicable, and operating expenses with period/coverage. Avoid deducting costs already netted by the provider. |
| Profit/earnings context | Show a defined surplus or earnings measure only when its inputs and accounting boundary are known. Revenue minus incentives alone is a partial measure, not proof of net profitability. Missing costs produce an unavailable/partial label. |
| History and valuation context | 24h/7d/30d revenue and matching previous-period growth where covered; trailing 12 months where history exists. Show fee/revenue ratios only with the exact denominator, time basis and token-economic relationship. Zero/missing denominators are unavailable. |

No synthetic “profitable” badge based only on revenue, TVL or transaction volume. Recurring usage, customer concentration and subsidy dependence add context when measurable. Keep native-token amounts and USD valuation methodology visible so price appreciation is not automatically interpreted as usage growth. An annualized short-window run rate must be labeled as an extrapolation, separate from observed trailing revenue.

### Display and delivery

- Chain Explorer: Economics view comparing chain fees/revenue, app revenue, growth, holder capture and coverage, alongside links to capital/access views.
- Project dossier: Revenue & Economics section with history, fee allocation, costs/incentives, value-capture mechanisms and inspectable sources.
- Project comparison: like-for-like periods and methodology; dashboard surfaces material changes for saved projects rather than a second dense table.
- First slice in M4: dated chain fees/revenue history where accessible, integrated with the chain comparison. Deeper app economics, costs and valuation context follow in M5. Verify endpoint access and supported metrics before selecting the integration; no new subscription is assumed.

DefiLlama is a candidate starting source; Token Terminal, official disclosures and documented Dune queries are alternatives for specific gaps, subject to access and methodology checks. DefiLlama's glossary separately defines fees, protocol revenue, holder revenue and app revenue, with explicit exclusions in chain-level app aggregation. Source: [DefiLlama data definitions](https://defillama.com/data-definitions), reviewed 2026-09-28. Atlas must preserve source-specific definitions rather than treating providers' similarly named fields as interchangeable.

## 18. September 28 research additions — recorded, not yet implemented

The user supplied VirtualBacon livestream screenshots and additional ideas after the dashboard build began. The source's numbers and relationship assertions are unverified reference material. See [RELATIVE-STRENGTH-BOARD.md](RELATIVE-STRENGTH-BOARD.md) for the proposed research board.

- **Rate expectations (ATLAS-016):** investigate CME FedWatch/futures and Kalshi event contracts. Actual policy rates, futures-implied expectations and prediction-market prices are separate observations with distinct instruments, settlement rules, liquidity and timestamps. Verify API/licensing/access before integrating.
- **Inflation (ATLAS-017):** add headline/core PCE, monthly/yearly changes, release/reference periods, revisions, actual/prior/consensus where supported. Prefer BEA/FRED official observations; investigate Investing.com calendar/consensus access rather than assume a free API.
- **Connections and ecosystems (ATLAS-009/031/049):** typed token relationships, counterparties, integrations, chain deployment and narrative membership with evidence. Observed return correlation/beta is separate from organizational relationships. Related tokens are research candidates, not guaranteed next movers.
- **50 MA (ATLAS-034/035):** start with explicitly defined 50-day SMA on daily closed candles; allow later timeframe/SMA/EMA selection. Show distance, slope and crossings; require complete adjusted history and defined missing-data rules.
- **Price targets (ATLAS-050):** attributable bull/base/bear forecasts with author, publication date, target horizon, currency, assumptions, original link and revision history. User targets stay distinct. Preserve disagreement and outdated/expired calls; do not present a media average as a calibrated forecast.
- **ISO 20022 / Quant narrative:** treat basket membership as a sourced market/research classification. Do not imply token certification, verified Overledger integration or corporate partnership from a narrative label or technical compatibility alone.


## 19. CMC references, chart library and expanded sources

Recorded 2026-09-28. These additions extend the existing 31-section framework. Implementation status belongs to BACKLOG.md; source/access findings belong to DATA-SOURCES.md and [PROVIDER-RESEARCH.md](PROVIDER-RESEARCH.md). Screenshots establish design preferences, not verified datasets or API entitlements.

### Dashboard and token research (ATLAS-006/011/012/045)

Use compact grouped panels, with clickable section headings opening deeper pages. Keep the Dashboard heading simple. Market status groups prices, cap/volume and ratios; sentiment/breadth and derivatives/flows stay easy to scan. Dashboard structure is a compact cap/share/change summary. Exact TOTAL/TOTAL2/TOTAL3/OTHERS, BTC.D/ETH.D and ETH/BTC charts belong in the Market Structure detail page, with cycle/phase research as it is implemented. Macro groups yields, dollar, stocks, energy, inflation and liquidity context as feeds are connected. Personal positions/watchlists, discovery/movers, news/calendar and onchain capital/economics remain first-class sections. Grouping must not hide dates or missing coverage.

The CMC-style market table will support sortable columns, meaningful filters, column selection/reordering and saved views. Final extra metrics will be selected with the user when that table is built, rather than automatically adding every brainstormed indicator. Existing table controls remain the first slice. Light/dark themes share the same information and remember the preference locally.

The token page will combine a persistent identity/price/market-facts column, a central tabbed chart/research area, markets table and a contextual news/social panel. Retain Atlas's deeper team, funding, sale-price, tokenomics, institutional connections, revenue, thesis and evidence requirements. Sentiment and mindshare need named sources, method and coverage. CMC numeric mindshare remains a preferred source pending documented access; trending searches and community-ranked tokens are different metrics.

### Charts and saved plans (ATLAS-014/034/035/040)

First display: official TradingView embeds on Market Structure and a dedicated Charts workspace under Research, with direct chart links, independent loading, theme matching and expanded view. No market-structure chart grid on the dashboard. Exact index definitions stay separate from Atlas's provider-wide aggregate. Display access does not provide downloadable OHLCV or a persistent drawing API.

Next owned chart slice: explicit asset/venue/quote/timeframe mapping; candles/line, volume, SMA/EMA (initially 50/200), RSI; horizontal levels, trend lines and annotations. Save named chart plans to a project with drawing coordinates in time/price, indicator settings, dataset/source, timeframe, created/updated dates, thesis/invalidation and optional image snapshot. A project chart library supports multiple scenarios and reopening/editing. A screenshot alone does not preserve editable drawing geometry. AI chart assistance follows retrievable evidence and reviewable annotations; no automatic trading.

Investigate OpenMarket, Mobula, exchange candles, Alchemy Prices and Codex for suitable data. Lightweight Charts is a rendering candidate, not a data provider; richer TradingView libraries require separate licensing/access review. Do not imply the CMC website chart or all website fields can be imported through its market API.

### News, X and calendar (ATLAS-015/021/030/041)

Expand source-backed headlines incrementally: RSS first, then one useful normalized aggregator. Deduplicate stories, retain original publisher/link/date, tag verified asset IDs, organizations, chains and topics, and preserve attribution. CoinStats, cryptocurrency.cv, NewsData, APITube, CryptoPanic, NewsAPI, Webz and CoinGecko news are candidates with different cost/delay/license boundaries. Full text, summaries and sentiment require permitted access and clear source/method labels.

User-selected X accounts may enter through a small official API budget or a verified alternative. Telegram channels can provide their own posts when a bot receives channel updates or an authorized reader has access; a Telegram mirror does not provide all of X. Tweet Harvest/twscrape are optional research tools with session and maintenance requirements, not default always-on dependencies. Never use the main account's session cookies silently. No scheduled monitor is activated by this plan.

Crypto calendar candidates: CoinMarketCal and Coindar. Macro calendar candidates: official agency/central-bank release schedules, Finnhub, EODHD and Trading Economics. Qveris, Shibui, FindMyMoat, Medium and Datarade are discovery references; verify the original provider. Events need timezone, reference period, scheduled/released/revised state, importance/source, and actual/prior/consensus only when available. Official release dates alone do not supply market consensus.

Users can star calendar events they want to watch and open a combined Starred view. Each star can carry a personal note and explicit Atlas project link, with upcoming stars visible on Dashboard and a separate browser-local backup/insert-only restore. A saved event needs its source and date; if it is no longer present in the live feed, show the saved date as an unverified snapshot rather than a current schedule. Alerts and cross-device sync are separate work.

The first BLS calendar slice, prioritized while Coindar access is pending, uses FRED's public mirror for CPI, Employment Situation, JOLTS and PPI dates because direct BLS access is blocked from Atlas's server. Label the mirror and link to BLS for checking changes; leave reference periods, consensus, actuals and other releases unclaimed until sourced.

### Commodities, energy and cross-asset context (ATLAS-019/029/031)

Core macro expansion: Brent/WTI, regional natural gas (Henry Hub, TTF, JKM), gold, silver, copper, nominal and real bond yields, dollar and broad stock benchmarks. Identify spot/futures instrument, units, region, observation time and delay; bond yields and bond prices are distinct. Energy/news shocks are context rather than automatic causal or directional claims about BTC.

Deeper detail: electricity wholesale prices, demand, inventories/storage, generation mix; industrial metals, agriculture/fertilizers and critical minerals where useful. Wind/solar are tracked through capacity (MW), generation (MWh), costs/LCOE, equipment/battery costs, contracts and policy. There is no single interchangeable wind/solar commodity price. EIA, ENTSO-E, World Bank Pink Sheet, IMF PCPS, IEA, IRENA and USGS are candidates with different frequencies/access. Global money supply remains a comparable common-month/FX composite, not the current US M2 series.

### Next build order

1. Group dashboard, add light theme and market-structure display (this batch).
2. Build the configurable market table with agreed metrics and explicit data coverage.
3. Refine token-page layout and deliver the first owned chart/saved-plan slice.
4. Add one calendar/news or macro observation slice based on actual use, preserving independent failures, caching and source provenance.

Keep new ideas in the existing living backlog; extend existing ATLAS IDs when they fit. Larger datasets, ingestion and providers are added for a named feature rather than all at once.


### This batch's validation and limits — 2026-09-28

Typecheck, lint, production build and the existing 46 automated checks pass. Browser inspection covers the structure displays, range/view/dialog controls, persistent light theme, sidebar collapse, onchain tab switch and 390px mobile width/navigation/dialog. No saved user project was edited in this batch. Existing dependency/build warnings remain; external chart transport/data availability remains controlled by TradingView. Raw candles, saved editable charts, table customization, exact CMC mindshare and wider provider integrations remain planned. Signed-in browser save verification and the user-deferred browser/cloud transfer remain separate.


### Dashboard placement refinement — 2026-09-28 (D-014)

The user requested compact numbers on the homepage and a central Discovery table. Structure charts move to /market-cycle (navigation: Market Structure); /charts lives under Research for token chart deep dives. Discovery sits immediately below the compact overview, before macro/trending/personal/news/onchain detail summaries. Its first controls are search, gainers/losers/volume views, sortable supported columns and minimum cap/volume filters. Column selection/reordering, saved views and additional agreed metrics follow later.

The compact summary uses provider-reported CoinPaprika all-market cap and 24h cap/volume changes. Ex-BTC, ex-BTC/ETH and outside-top-ten caps/shares are estimates, with explicit definitions and timestamp checks; they are not named or presented as exact TradingView TOTAL2/TOTAL3/OTHERS. Basket cap-change history is unavailable, so its change cells remain unknown instead of substituting price returns. Reliable per-basket history is the next source requirement for percentage change controls. Cycle phase classification and editable scenarios remain planned, independent of chart placement.

### Placement refinement validation

- 2026-09-28 compact dashboard/Discovery/chart workspace (D-014): 49 automated checks, typecheck, lint and production build pass; git diff whitespace check passes. Browser checks verify no dashboard chart iframes, compact cap/share/reported-change values, combined search/min-cap filtering, ascending/descending cap sorting and resets, structure-link navigation with four cap charts, and Research Charts with Binance BTC/ETH candles, volume, drawing/indicator controls and 1Y range. Dashboard and Charts fit a 390px document width; the table scrolls within its container. No saved project or position was edited in this batch. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. Basket percentage history, editable/saved project chart plans, column customization and cycle phase classification remain planned. No commit, push or deployment performed.

### Provider expansion — 2026-09-28 (D-015)

ATLAS-012/016/017/019/030 gain CMC global/index observations, Cointelegraph/ECB RSS and seven FRED histories. Grouped macro detail tabs avoid fetching every new history on the dashboard. CMC is now the preferred global universe, with an explicitly sourced CoinPaprika fallback. Discovery/personal prices retain their existing IDs and source; CMC ranked listings, personal account imports, metadata enrichment and numeric mindshare remain planned. Outside-top-ten cap is unknown under CMC until matching rank data exists. Source definitions/access/caches are in DATA-SOURCES.md. No paid subscription or research-record migration is introduced.


### Provider expansion validation — 2026-09-28 (D-015)

All 56 automated checks pass, including CMC public/keyed transport, secret isolation, decoding, lazy whole-snapshot fallback, exact inflation baselines and independent RSS failures. Typecheck, lint and production build pass. Twelve live local API requests succeed: CMC global/Fear & Greed/Altcoin Season, Cointelegraph/ECB and all seven added FRED series. Runtime status reports CMC, both new publishers and FRED healthy. Browser checks verify CMC dashboard values, inflation YoY/MoM with dated index histories, energy spot units, grouped macro tabs and combined policy/ECB/headline filtering. Macro and News fit 390px without document overflow; no browser error logs were observed. Existing saved project/position records were not edited. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. CMC ranked listings, matching outside-top-ten cap, mindshare, personal-account import, broader trade/political news and automated event calendars remain separate work. No paid plan, commit, push or deployment was performed.


### CMC reference enrichment — D-016 (2026-09-28)

ATLAS-006/007/012 now include CMC top-100 ranked Discovery and a selected token reference view (market values, supply, 1h/24h/7d/30d returns, descriptions, official/social/GitHub/docs links and classification tags). Matching source/rank data expands the outside-top-ten cap estimate. This does not complete the full dossier, save CMC metadata into research or establish investor/partnership evidence. Explicit CMC project mapping, wider rankings, column customization, contracts verification and team/funding/unlock sources remain future slices.


### CMC reference enrichment validation — 2026-09-29 (D-016)

All 60 automated checks pass, including exact CMC IDs, explicit USD quotes, safe metadata links, bounded cached requests and aligned top-ten estimates. Typecheck, lint and production build pass. Live requests return 100 ranked assets and token metadata; malformed IDs/providers return 400. A temporary upstream 429 exercised the visible CoinPaprika fallback and cooldown, followed by successful CMC recovery. Browser checks cover combined search/min-cap filters, both sort directions, provider switching, token links, distinct quote/metadata timestamps, refresh and Bitcoin/Ethereum navigation. Mobile classifications fit a 390px document width without overflow. A duplicate sibling-key rendering bug found during QA was fixed and the single-card behavior reverified. The dashboard shows CMC Discovery and a matching-source outside-top-ten cap/share estimate. No browser error logs were observed. Saved research/position records were not edited. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. CMC-to-project persistence, broader rankings, mindshare, verified funding/team/unlocks, column customization and automated calendars remain separate work. No paid plan, commit, push or deployment was performed.


## D-017 — Market columns and range filters (2026-09-29)

User screenshot adds rank/name/price, 1h/24h/7d returns, cap/volume, token sentiment/mindshare, seven-day mini-chart, BTC-relative returns and YTD; user additionally requests 4h/12h windows. Implement browser-persisted column selection and compound numeric ranges for the supported metrics. Name search remains separate. BTC-relative return is ((1 + token USD return)/(1 + BTC USD return) - 1) × 100, using exact provider BTC identity and observations aligned within five minutes. Never subtract percentage returns or join symbols across sources.

Historical 4h/12h adapter is optional and key-gated; no request runs without a configured CMC key. Official keyless catalog omits /v3/cryptocurrency/quotes/historical and a public probe returned HTTP 403 (API key required). Standard documentation lists Basic historical access, but no configured key exists and an authenticated live round-trip is unverified. Sample-data tests cover decoding/calculation/access. Do not call 4h/12h live until an entitled key successfully returns history. No signup/subscription was performed. Sentiment/mindshare, seven-day sparkline and YTD remain visibly unavailable until distinct source access/baselines exist.


### Market columns validation — 2026-09-29 (D-017)

65 automated checks, TypeScript, lint, production build and whitespace checks pass. Browser checks verify the live CMC 1h and computed BTC-relative columns, combined 24h >= 5% and volume >= $10M filters, signed/inverted range validation, search combined with ranges, BTC-relative sorting both directions, column reload persistence and provider switching with watchlist controls intact. At 390px, picker/ranges fit the document and the table scrolls internally. No browser errors were observed. The local performance route returns missing_key (503) with zero external history requests; runtime CMC status stays healthy. Keyed history decoding/batching/caching is verified with fixtures only; no configured key exists for an authenticated live check. Sentiment/mindshare/YTD/7d mini-chart remain disabled. Existing build warnings remain. No saved research or positions were edited; only the new UI column preference was saved. No registration, subscription, commit, push or deployment.


### Cross-provider discovery request — 2026-09-29 (ATLAS-012/030)

Show attention/discovery across CoinMarketCap, CoinPaprika and CoinGecko in one organized area, with Trending, Most visited and Newly added views and a provider selector. Preserve source rankings, methodology/window, retrieval date and access state. Cross-provider overlap is a later slice dependent on verified asset identity mappings; do not merge tickers or average incomparable rankings. Newly added to a provider is not a token launch date or a new DEX pool. D-018 connects CoinGecko search trending, regular CMC listings sorted by date_added (up to 50 recent additions) and CoinPaprika five-day additions (up to 100). Dedicated CMC attention feeds remain paid; CoinPaprika website attention feeds have no verified documented API. See PROVIDER-RESEARCH.md for the access matrix.


### Cross-provider Discovery validation — 2026-09-29 (D-018)

70 automated checks, TypeScript, lint, production build and whitespace checks pass. Three live local API feeds succeed without new credentials: CoinGecko trending (15 rows), CMC recent additions (50 rows) and CoinPaprika five-day additions (60 rows at verification). Paid CMC most-visited returns typed disabled/503; fixture checks verify all six unavailable combinations make zero external ranking requests, even with keys configured. Decoders preserve exact identities, zero/null values, independent errors, bounds/cache behavior and provider trend order. CoinPaprika validation accepts unrelated historical Unicode directory entries but rejects unsafe selected addition IDs.

Browser checks cover provider/mode switches, Paprika Show more (20 to 40 of 60), feed search, search reset on source change, CMC descending listing dates and asset metadata navigation outside the top 100. The existing reference page explicitly has no quote outside its top-100 snapshot; the additions feed's quote is not silently reused there. Dashboard shows five trend rows. At 390px the controls and long-name/price rows fit, with document width/scroll width both 390. No browser error logs were observed; temporary viewport override was reset. Existing saved research and positions were not edited. Build retains existing Supabase dependency, Browserslist and metadataBase warnings. No paid signup, subscription, commit, push or deployment. Named watchlists, canonical source overlap and numeric CMC sentiment/mindshare remain separate work.


### D-019 delivery — named watchlists

Named browser-local asset lists now complement the existing research Watching view. Create/rename, add from market/Discovery/reference pages, paste-preview explicit mappings, independent entry notes/status, archive/restore, sorting/ranges/column choices and a saved dashboard selector are implemented. Same-provider snapshots are reused with visible coverage; no symbol merging or invented prices. Version 1 list backups remain separate from unchanged version 4 research documents/positions. Direct CMC account/curated-list sync, cloud watchlist persistence, saved filter presets and historical monitoring remain planned. See RESEARCH-WORKSPACE.md and DECISIONS D-019.


### D-019 validation — 2026-09-29

77 automated checks, TypeScript, lint, production build and whitespace checks pass. Browser checks cover list creation, ambiguous paste preview (CMC/Paprika/Gecko candidates), exact-ID choice, unknown skips, saved notes/status after reload, column persistence, price sorting both directions, combined signed ranges, asset archive/restore, list archive/restore, duplicate and new CMC Discovery additions, dashboard selection and reload, and conflicting two-tab notes retaining the unsaved draft. At 390px document/scroll widths are both 390; the table scrolls internally. Final browser error logs were empty. The test list was archived and dashboard returned to Research watchlist; existing research/positions were not changed.

Backup schema round trips, insert-only import, malformed data, identity/name collisions and stale revisions are covered by automated tests. The in-app browser did not return a download event for Backup lists, so an actual downloaded-file restore was not verified in that browser. Build retains existing Supabase dependency, Browserslist and metadataBase warnings. No paid signup, new API key, subscription, commit, push or deployment.


### D-020 — Saved Discovery views delivered

Discovery supports three explainable quick filters (BTC outperformers, weekly-leader pullbacks and high-volume gainers) plus named browser-local configurations retaining provider, mode, columns, search, ranges and sorting. Selecting a saved view restores its exact source; filtering uses existing snapshots and coverage. Current settings can be adjusted or saved as another view. See BACKLOG D-020 for thresholds and validation. Cloud preferences, saved watchlist-specific filters, column reordering and richer metrics remain separate work.


### D-023 — First owned chart-plan delivery (2026-10-01)

The first §19 chart-plan slice is delivered: seven explicit Binance USDT spot pairs, bounded closed candle snapshots, SMA/EMA/RSI and volume, editable time/price levels/trend segments/annotations, project associations, thesis/invalidation and separate browser-local backups. Full requirements remain broader: cloud sync, image export, navigation through larger histories and richer asset mappings are still open. See BACKLOG D-023 for precise validation and limits; external embeds do not supply Atlas geometry.
