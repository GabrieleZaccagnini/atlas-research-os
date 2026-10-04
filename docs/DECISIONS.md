# Atlas decisions and plan changes

This is an append-only rationale/history log. Current requirements live in [MASTER-PLAN.md](MASTER-PLAN.md), delivery order in [ROADMAP.md](ROADMAP.md), and feature status in [BACKLOG.md](BACKLOG.md). A later entry can supersede an earlier choice; retain both. These entries document product choices, not verified market claims.

## D-001 — Consolidate planning in the repository

- Recorded: 2026-09-28.
- Decision: use the master plan for requirements, roadmap for sequence, backlog for status and this log for rationale. Stable ATLAS IDs connect them.
- Why: the user will continue supplying ideas and usage feedback; the old short sprint list no longer covered the platform.
- Consequence: replace the old roadmap, preserve all 31 blueprint capabilities and screenshot additions, and update the relevant document rather than appending competing master plans to chat.

## D-002 — Build a complete research path in small slices

- Recorded: 2026-09-28; consolidates the agreed foundation-first direction.
- Decision: verify the existing save path, establish identity/evidence conventions, finish a reusable project overview, then compose the daily dashboard from the same records. Macro/policy and chain capital become distinct subsequent workspaces.
- Why: a broad collection of preview pages is less useful than a working research-to-decision workflow.
- Consequence: retain advanced requirements in the backlog; do not integrate all APIs upfront. The roadmap can be reordered based on actual use.

## D-003 — Evolve the interface around research tasks

- Recorded: 2026-09-28; consolidates the user's instruction that the Bolt UI need not be preserved.
- Decision: keep existing working routes/data safe while freely improving information architecture and display. Use compact daily summaries with detailed research drill-downs. The accepted Atlas logo remains a replaceable placeholder.
- Consequence: avoiding regressions does not require freezing the Bolt layout. Validate real interactions, readability and mobile behavior in each affected slice.

## D-004 — Store evidence and scenarios separately

- Recorded: 2026-09-28; consolidates the existing master plan's methodology corrections.
- Decision: preserve the cycle-calendar hypothesis, VIX bands, rotation model, adoption themes, organization leads, RWA comparisons and macro/trade ideas as requirements or research scenarios. Verify sourced facts independently.
- Consequence: no forced future-bottom countdown presented as fact; no logo pairing automatically becomes a partnership; no TVL/RWA/stablecoin sum becomes an invented liquidity total. Calculated observations and personal judgments remain distinguishable.

## D-005 — Keep providers replaceable and additions deliberate

- Recorded: 2026-09-28; consolidates the service architecture.
- Decision: one primary source per needed metric, normalized contracts, compatible fallback only where justified, caching/refresh by data type and visible partial failures. Begin with verified free access where it meets the need.
- Consequence: many candidate providers are retained without all being activated. Verify endpoint access, attribution, quota and cost when implementing; add shared scheduling/storage as feature load requires it. No paid subscriptions are authorized by this planning document.

## D-006 — Preserve the deferred browser transfer

- Recorded: 2026-09-28; preserves the user's earlier deferral.
- Decision: leave browser-to-cloud migration for later. Continue independent product work and verify cloud behavior with clearly identified test data.
- Consequence: do not silently transfer user records or label transfer verification complete. Keep exports/browser recovery available.

## D-007 — Treat this update as planning work

- Recorded: 2026-09-28.
- Decision: consolidate scope and recommend the next implementation batch; do not start feature coding or activate background monitors in this update.
- Consequence: new items remain planned unless existing implementation supports a partial status. No commit, push or deployment is performed by this planning update.

## D-008 — Make chain and project revenue explicit

- Recorded: 2026-09-28; related ATLAS-027/022.
- Trigger: the user wants to see which chains/projects are actually earning money.
- Decision: add a Chain Explorer Economics view and project Revenue & Economics section. Separate chain revenue, application revenue, token-holder capture and costs; disclose the accounting boundary before showing earnings.
- Consequence: the first chain fees/revenue slice is included with M4; deeper protocol economics remain in M5. This expands the existing feature rather than creating a duplicate backlog item. It does not activate a data feed or claim profitability from revenue alone.

## D-009 — Deliver a usable daily research loop first

- Recorded: 2026-09-28; ATLAS-001/002/006/007/010/012/013/015/037/047.
- Trigger: user requests something usable for morning market research, then asks to finish current work before discussing adjustments.
- Decision: move a narrow daily-desk slice forward: key-free CoinPaprika market context/discovery and profile lookup, manual research, scheduled reviews, dated notes and project catalysts. Use existing storage with version 3 compatible backups.
- Reason/tradeoff: provides one usable loop without waiting for every intelligence domain. CoinPaprika's limited free universe is explicit; no symbol-based matching, fabricated macro regime or automatic signals.
- Storage: signed-in accounts use private cloud storage; signed-out users can explicitly choose a separate browser workspace. This does not transfer browser research or weaken cloud authorization.
- Remaining: signed-in browser verification, full identity/evidence model, macro, chain revenue, automated feeds and deployment. User interface feedback informs the next slice.

## D-010 — Apply reference design style before revising dashboard information

- Recorded: 2026-09-28; ATLAS-045/012.
- Trigger: user supplied two terminal references, clarified that layout/design rather than colors matters, and requested an icon-only sidebar.
- Decision: retain Atlas's palette and current content; refresh typography, compact spacing, rounded panels/controls and shared navigation. Desktop sidebar can collapse to a labeled icon rail and remembers the choice in this browser. Mobile retains the full navigation drawer.
- Boundary: no copied reference balances, charts, trading controls or invented data. Dashboard information priorities will be revised after the user's next input.

## Future entry template

```text
ID — decision title
Date:
Related ATLAS IDs:
Trigger / user need:
Decision:
Reason and tradeoff:
Affected requirements / delivery order:
Supersedes (if applicable):
Revisit when:
```

## D-011 — Make the homepage an anytime market overview

- Recorded: 2026-09-28; ATLAS-012/016/018/019/022/023/027/030/038/047.
- Trigger: the user clarified that a morning workflow was only an example; the dashboard should replace repeated jumps among market, news, macro and chain tools.
- Decision: compact source-backed summaries with deeper pages; simple Dashboard heading and no slogan. Move the existing research workflow to /research. Prioritize independent loading, useful partial coverage and truthful missing data.
- First slice: CoinPaprika market/movers, FRED selected US macro, CoinDesk/Fed RSS, Alternative.me sentiment, CoinGecko search trends, DefiLlama chain/supply/volume/revenue, saved watchlist and manual position snapshots.
- Storage: version 4 adds nullable positions; imports accept versions 1–3. Existing research and cloud owner/revision controls remain intact. No CMC account or wallet balance is inferred.
- Supersedes D-009's homepage focus and D-010's temporary content freeze. This is a partial intelligence terminal, not completion of every domain.

## D-012 — Queue the livestream ideas after the dashboard

- Recorded: 2026-09-28; ATLAS-016/017/031/034/035/049/050.
- Decision: capture CME/Kalshi, PCE, ISO/Quant narrative, relationships/ecosystems, 50 MA, sourced targets and beta/rebound comparison in the living plan. Finish dashboard verification before implementing that next slice.
- Evidence boundary: screenshot values are not a dataset; inferred compatibility is not a partnership; historical beta and co-movement do not establish a future lead/lag opportunity. Compare like-for-like dates, baskets and low/high definitions.


## D-013 — Group the dashboard and separate chart display from owned analysis

- Recorded: 2026-09-28; ATLAS-006/011/012/014/019/030/034/045.
- Trigger: the user prefers CMC density, wants light theme and TOTAL2/TOTAL3/OTHERS, and authorized the next build while retaining recent source ideas.
- Decision: grouped homepage panels, persistent theme preference and official TradingView structure embeds first. Reuse existing feeds/storage; add WTI to the compact macro panel. Keep derivatives/ETF and unconnected metrics visibly unavailable. Document recent news/X/Telegram/calendar/commodity candidates without activating them all.
- Boundary: external chart displays do not provide Atlas OHLCV, drawing persistence or API health. CMC website mindshare remains preferred but exact API access is unverified; ranked community tokens/search trends are different metrics.
- Next: configurable market table with agreed metrics, token-page refinement and named editable project chart plans, then one verified news/calendar or macro slice. Broader 31-section scope and the livestream ideas remain intact.


## D-014 — Put Discovery at the center and move charts off the dashboard

- Recorded: 2026-09-28; ATLAS-011/012/019/020/034/045.
- Trigger: the user wants compact cap/share/change numbers, central CMC-style Discovery filters and separate structure/chart deep dives.
- Decision: replace dashboard embeds with CoinPaprika cap/share summary; place the full-width searchable/sortable/filterable market table immediately below it. Preserve /market-cycle and rename its navigation Market Structure. Add /charts under Research with explicit spot pairs and TradingView tools.
- Data boundary: provider-reported total cap/volume changes; timestamp-aligned exclusions are estimates, not TradingView index figures. No price-return substitution for missing basket cap-change history. Missing observations/ranks remain unavailable.
- Remaining: basket change history, saved table views/column controls, owned editable saved charts/project library and evidence-backed cycle phase/scenario intelligence. Supersedes D-013's dashboard chart-grid placement, retaining its theme and source separation.

## D-015 — Focused provider expansion (2026-09-28)

Use verified official CMC public global/sentiment/altseason endpoints with an optional server-only key path, lazy whole-snapshot CoinPaprika global fallback and visible source attribution. Keep existing CoinPaprika discovery/valuation IDs intact; never subtract its asset caps from CMC totals. Add Cointelegraph and ECB RSS independently; keep full articles and syndication grouping outside this slice. Reuse the allowlisted FRED history adapter for inflation/jobs/real yields/Brent/US spot gas. Show exact-month MoM/YoY inflation, base-index charts and reference dates; fetch only the selected macro detail group. No account signup, paid plan, notifications, commit or deployment.


## D-016 — CMC ranked Discovery and reference metadata (2026-09-28)

The user requested another focused data addition within remaining usage. Choose CMC listings and token metadata because official keyless endpoints responded and support the central market/research workflow. Keep top-100 scope visible, source-specific fallback and matching global/rank calculations. Metadata appears as a separate reference view rather than migrating saved records or inferring identities from symbols. Existing CoinPaprika watchlists and portfolio valuation continue unchanged. Calendar provider setup remains separate: Coindar requires an access token, and CoinMarketCal has tier-specific scope/usage rights. No registration or purchase is part of this slice.


## D-017 — Market columns and range filters (2026-09-29)

User screenshot adds rank/name/price, 1h/24h/7d returns, cap/volume, token sentiment/mindshare, seven-day mini-chart, BTC-relative returns and YTD; user additionally requests 4h/12h windows. Implement browser-persisted column selection and compound numeric ranges for the supported metrics. Name search remains separate. BTC-relative return is ((1 + token USD return)/(1 + BTC USD return) - 1) × 100, using exact provider BTC identity and observations aligned within five minutes. Never subtract percentage returns or join symbols across sources.

Historical 4h/12h adapter is optional and key-gated; no request runs without a configured CMC key. Official keyless catalog omits /v3/cryptocurrency/quotes/historical and a public probe returned HTTP 403 (API key required). Standard documentation lists Basic historical access, but no configured key exists and an authenticated live round-trip is unverified. Sample-data tests cover decoding/calculation/access. Do not call 4h/12h live until an entitled key successfully returns history. No signup/subscription was performed. Sentiment/mindshare, seven-day sparkline and YTD remain visibly unavailable until distinct source access/baselines exist.


## D-018 — Cross-provider Discovery feeds (2026-09-29)

Deliver source and mode controls in the existing dashboard and Markets page without treating unlike attention lists as one metric. Reuse CoinGecko search trending and connect two verified free additions feeds: regular CMC listings sorted by date_added (limit 50) and CoinPaprika directory is_new (five days, cap 100). CMC's live response selected recent records but ordered their dates ascending, so sort the returned snapshot explicitly; do not claim dedicated new-listing endpoint equivalence. CoinPaprika includes a few unusual historical directory IDs: unrelated old entries may remain directory strings, but every selected addition must pass path-safe exact-ID validation. Duplicate IDs are rejected.

Use existing provider caches/status and independent failures. Unavailable paid/unverified combinations make no ranking request. Preserve trend order, rank, source definition and retrieval/cache state. Unknown quotes remain unknown; provider additions are not token launches or DEX pool creation. No symbol matching, new storage schema or paid setup. Numeric CMC sentiment/mindshare and canonical source overlap remain separate work.


## D-019 — Named Atlas watchlists with explicit provider identities (2026-09-29)

The user authorized the next build after cross-provider Discovery. Add named lists, independent notes/status, exact provider assets, configurable market metrics/ranges, paste-preview mapping and a dashboard list selector. Preserve the existing Watching-project view as Research watchlist and do not change positions. Same symbols across sources require a choice, not a merge.

Keep this slice browser-local and account-scoped with a separate validated version 1 backup, reversible archives and optimistic edit-conflict checks. Do not imply cloud persistence or CMC account access. Reuse existing bounded snapshots rather than fetching every asset/history. Missing coverage stays blank. Canonical identity/evidence, cloud list sync, direct CMC import and saved chart plans remain future slices.


## D-020 — Small saved Discovery views before another integration (2026-09-29)

User approved a small useful slice within remaining usage. Add three explicitly defined quick research filters and named browser-local starting views to Discovery on Dashboard and Markets. Save source and settings together; keep existing source attribution/fallback boundaries and missing-value exclusions. Reuse current snapshot data. Keep defaults free of historical windows, leave saved research/watchlists unchanged, and do not label reported volume as order-book/pool liquidity. Views are UI preferences, not cloud records or watchlist backup content. No new provider or automatic trading signal.

## D-021 — Save research clippings before the token-page refinement (2026-09-30)

The user prioritized keeping screenshots, X/news/article links and notes by project and in a general investing/crypto hub. Add one browser-local scrapbook with project references, topic/tags, source URL, search, editing and a separate screenshot-inclusive backup. IndexedDB holds image blobs so screenshots do not inflate project JSONB or localStorage quotas. Account IDs partition the local library, but sign-in does not imply cloud sync. No Supabase bucket/table/policy or paid article/social ingestion is activated; a private cloud attachment model needs its own access and recovery design. This moves the first ATLAS-014 slice ahead of the planned token-page/chart-plan work without replacing that work.

## D-022 — Token page joins provider facts to explicit research identity (2026-09-30)

CMC listing and watchlist navigation now opens one token page keyed by the numeric CMC ID. The user explicitly creates or links a project; the mapping is saved as `cmcId` with a compatible empty default in prior backups. CMC metadata remains a provider reference and does not overwrite manual research. Market venue and DEX data remain behind separately confirmed source IDs and contracts. Only explicitly mapped BTC/ETH venue charts display, with no cross-provider ticker inference. This keeps the page usable before broader identity reconciliation or Atlas-owned candles are ready.


## D-023 — Own the editable chart geometry and saved snapshot (2026-10-01)

After the user approved the handoff recommendation, deliver saved project chart plans with a bounded public Binance spot candle adapter and a native SVG renderer, while retaining the external TradingView display. Embed drawings cannot be exported as Atlas geometry. Save the candle dataset as well as time/price coordinates so reopening a thesis preserves its original context; updating market data is an explicit action. Keep this first slice browser-local with separate backups and revision checks, avoiding a research schema/cloud migration. Exact venue symbols identify the dataset; project attachment is an explicit research association, not an inferred ticker mapping. Broader market coverage, pan/zoom, cloud sync and image exports follow user feedback. Library exports now offer a persistent save link because triggering a download does not prove it completed.

## D-024 — Start the calendar with official scheduled events (2026-10-01)

Add selected BEA economic release dates and FOMC meeting dates to the existing project catalyst view using independent official-source adapters. Preserve BEA's published Eastern times and leave FOMC times unknown rather than guessing from custom. Read the current HTML schedules because the available BEA machine-readable export was stale; cache each source and surface source failures separately. Keep BLS as a direct official link while its feed denies requests from this host. Crypto releases/unlocks, consensus and actual values require their own verified sources.

## D-025 — Prepare Coindar without claiming a live feed (2026-10-02)

Prefer a native event adapter over a third-party widget so crypto events can share Atlas's calendar workflow. Calendar defaults to one date-ordered All view with Crypto and Macro filters, like News; source failures stay independent. Coindar documents coin IDs, tags and mixed date precision. Its authenticated token-request page requires one service/site per token and a backlink, and says requests usually take under 12 hours to review; no published quota was found. Atlas links to Coindar from Calendar, keeps the token server-side, and uses it only for Atlas. Keep the bounded adapter disabled until the user's request is approved and a live response can be verified. Preserve month/quarter windows, avoid symbol-based project joins and treat the Coindar event page as a secondary source.

## D-026 — Star calendar events while source access is pending (2026-10-02)

The user wants to mark dates to watch. Give each live calendar event a star and a Starred view across crypto, macro and saved project catalysts. Store a bounded event snapshot by account/browser workspace in local browser storage, without changing project documents or provider data. If a marked event disappears from a feed, show its saved date with an explicit stale-snapshot warning and source link; do not imply it is freshly scheduled. Stars are not cloud-synced or included in project backups. No alerts or notifications are activated.

## D-027 — Use FRED's BLS release-calendar mirror while direct BLS access is blocked (2026-10-02)

The user chose BLS dates as the next calendar integration while Coindar access is pending. The official BLS ICS and CPI pages still return HTTP 403 to Atlas's server. FRED's public release calendars are accessible and identify BLS CPI, Employment Situation, JOLTS and PPI dates with US Central release times; BLS remains the original schedule to check. Read those fixed FRED pages as a bounded secondary source, label every row “BLS via FRED,” preserve source links, and show partial failures instead of silently presenting incomplete coverage. Keep the direct BLS link visible and do not infer actuals, reference periods or consensus. If direct BLS access becomes reliable, reevaluate the transport without changing saved event identities silently.

## D-028 — Turn starred events into a personal watchlist (2026-10-02)

The user approved making starred dates useful for personal investing research while Coindar access and chart-source choices are pending. Keep a short reason-for-watching note and optional project ID on the star itself, so provider observations never overwrite manual research. Reuse the existing browser-scoped version 1 file with compatible defaults, provide a separate portable backup and insert-only restore, and surface upcoming stars on Dashboard. Use live official/project dates when available there; label unmatched dates as saved snapshots. A project link is selected explicitly, never inferred from a symbol. Cloud sync, alerts and project-backup inclusion remain separate work.

## D-029 — Save pre-launch leads as project research (2026-10-02)

The user wants to add upcoming tokens they find promising, including leads that have no confirmed ticker or launch date. Give them an Upcoming Tokens capture/list view backed by the existing project store, with a separate user-marked launch stage, possible date, source and reason. Keep token launch stage distinct from research status and conviction, and do not treat “Announced” as Atlas verification. Retain candidate notes in normal project backups/private cloud research with compatible defaults for old records; no new provider or automatic ticker mapping. Tentative dates stay out of the verified calendar unless the user records a sourced catalyst separately.

## D-030 — Show provider-hosted Bitcoin cycle context (2026-10-03)

BlockHorizon offers chart and signal iframe code in its own Embed controls. Add its Cycle Index signal and selected working chart embeds to Market Structure with provider branding, direct links and a blank-frame fallback link. Treat them as third-party visual context: Atlas does not import signal values, infer a market phase, use BlockHorizon as an API, or mix its metrics with Binance candles. The NUPL embed preview reports unsupported and is omitted. Cross-origin frames appeared blank in the local in-app browser, as existing TradingView frames did, so a regular-browser render check remains before claiming the display is verified. Keep independently sourced Atlas cycle comparisons and editable scenarios as separate planned work.

## D-031 — Add miner and drawdown context without implying miner profit (2026-10-03)

The user chose adjusted SOPR, price drawdown and miner economics as the next Market Structure charts. Reuse BlockHorizon's existing display selector and embed routes for adjusted SOPR, Price Drawdown and Miner Revenue: Total (Daily). Explain spent-output profit separately from miner economics, and describe miner revenue as gross network rewards plus fees. Luxor hashprice is the better per-unit mining-economics measure, but its published widget script is unavailable and its full page did not display when framed locally. Give it a direct live-chart link and definition rather than leaving a blank widget or claiming Atlas computes miner profit. No raw-data integration, synchronized price overlay or saved indicator is part of this slice.

## D-032 — Use Blockchain.com history for network hash rate, retain the hashprice distinction (2026-10-03)

The user proposed Blockchain.com's hash-rate chart as a Luxor replacement and asked whether its API could bring the chart into Atlas. The documented Charts API returned usable hash-rate and BTC-price daily histories without a key during verification. Build an Atlas chart from those two series with separate axes, seven-day averages, source attribution and error fallback. This replaces the large Luxor link card but retains a small Luxor source link because hashprice is a different metric: expected gross revenue per unit of hash rate, whereas Blockchain.com's hash rate measures network computing power. Neither measures net miner profit. Keep this personal/local integration independent of BlockHorizon's embeds and do not save its raw observations as user research. Review provider terms before public/commercial use.

## D-033 — Build independently sourced Bitcoin cycle views (2026-10-04)

The user asked for all eleven nominated Bitbo chart ideas and the three additional cycle/mining candidates. Bitbo's paid API is not available to Atlas, and its chart/data use is not presumed licensed. Build Atlas's own clearly named equivalents from Blockchain.com's key-free BTC price, hash-rate and miner-revenue histories: fitted long-run bands and power law, halving-aligned history, mechanical price scenarios, completed-period returns, hash ribbons and a gross miner-revenue multiple. Keep the existing BlockHorizon realized-price display as the live provider-hosted view. Show short-term holder realized price and ETF flows as source-needed choices until suitable feeds and rights are verified. Link to Bitbo's reference charts for comparison, but do not describe the Atlas calculations as exact copies or forecasts. These charts do not create a cycle-phase classification, trading signal or saved research record.

## D-034 — Keep derivatives separate from market structure (2026-10-04)

The user moved BTC derivatives ahead of comparison work and questioned its placement. Use a dedicated `/derivatives` page reached from the dashboard and sidebar: funding and open interest describe perpetual leverage and positioning, while Market Structure continues to cover cap, dominance and cycle context. Begin with verified key-free Binance BTCUSDT observations so the page works without a new account. Label venue/contract and BTC versus USDT units; do not imply actual liquidations or market-wide coverage. Revisit CryptoQuant or another source when an actual liquidation dataset or wider coverage justifies access.

## D-035 — Show observed liquidations and historical totals separately (2026-10-04)

The user approved using both Coinalyze and Binance for liquidation context while looking for future heatmap APIs. Use the free Binance BTCUSDT stream for a browser-collected map of past forced-order execution prices and visibly mark connected periods. It is sampled and has no backfill; a local browser tab cannot provide complete market history. Use Coinalyze's hourly long/short totals as a separate historical chart after a server-only free API key is configured and its exact market mapping succeeds. These time-bucket totals have no execution-price coordinates, so never pour them into heatmap cells. Keep modeled future liquidation clusters as a separate later source/feature.

## D-036 — Add keyless specialist histories and separate observed from modeled liquidation levels (2026-10-04)

The user asked to integrate usable free APIs and obtain a Coinalyze key. BGeometrics' documented keyless free endpoints return four years of short-term-holder realized price, BTC ETF flow and hashprice history, so add them as explicitly sourced Market Structure views. The free holder and hashprice series lag by about seven days; surface their latest observation date and cache successful calls for 24 hours under the 8/hour, 15/day limits. ETF flow is a signed BTC daily series; do not call it ETF holdings or compare it to new issuance until a matching issuance feed is verified. MarginPad's keyless liquidation API returned an observed 24-hour *price* histogram, individual cross-venue event samples and separately flagged modeled price clusters. Show the observed and modeled panels independently, with their source timestamps and model caveat. Do not combine them with the browser's Binance stream or Coinalyze hourly totals. An existing Coinalyze account key was configured server-side and its authenticated Binance BTCUSDT hourly history validated live; keep the key out of source control.

## D-037 — Make leverage interpretation reviewable and daily research quick to capture (2026-10-04)

The user supplied an OI/funding/heatmap strategy essay and asked how to use it on Derivatives and save daily research, including AI conversations. Add a qualitative four-context reading guide and a route into the existing Research Library. Correct the essay's deterministic claims: OI cannot identify which side opened or closed, positive funding does not prove a healthy baseline, modeled heatmap bands are not exact liquidation orders or price targets, and Atlas lacks an aligned spot-versus-perpetual volume comparison. Do not create trading directives, automatic squeeze labels or hard funding thresholds from this material. Add note templates and focus filters in the existing browser-local Library for daily insights, strategy, mechanics, token research and AI conversation takeaways. Keep original links and the user's interpretation separate from unverified AI claims; reuse the existing schema, project link, tags and backup rather than creating a second store or silently importing private conversations.

## D-038 — Compare matched spot and perpetual traded volume without claiming price leadership (2026-10-04)

The user prioritized the spot-versus-perpetual view next. Use Binance's public BTCUSDT spot and USDⓈ-M perpetual hourly klines, both with quote-asset USDT volume, and join only closed UTC hours present in both feeds. Show matched coverage and 24h/7d/30d totals, grouped volume and spot/perp ratio. Keep missing hours as gaps; do not replace them with zero or shift the comparison window. The ratio describes relative traded activity on one venue, not net demand or which side caused price movement. Do not derive CVD, cross-venue market share, liquidation targets or automatic squeeze labels from these bars. The source is keyless, bounded to 30 days and independently cached from funding/OI and liquidation data.
