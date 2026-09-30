# Atlas feature backlog and idea inbox

Updated 2026-09-29. This document owns implementation status. IDs stay stable even when ordering changes. [ROADMAP.md](ROADMAP.md) owns delivery order, [MASTER-PLAN.md](MASTER-PLAN.md) owns detailed requirements, and [PLANNING.md](PLANNING.md) defines statuses and the update process.

This is a baseline of existing implementation plus planned work, not a claim that all capabilities are built. Existing automated/database checks are reported in the master plan's dated snapshot; they do not substitute for outstanding browser checks. The 2026-09-28 daily-desk slice below supersedes the planning-only baseline.

## Current focus

**Current slice:** D-022 adds a CMC token page joining provider market facts, explicit project identity, research, venue-mapping entry points and the project Library. **Next:** editable saved chart plans or one verified calendar slice. Wider identity/evidence, cloud sync and CMC account access remain open.

**User-deferred:** ATLAS-048 browser-to-cloud transfer. This does not block other work.

## Foundation and project research — Next

| ID | Capability | Status | Existing boundary / next acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-001 | Account and private research persistence | Partial | Cloud persistence/isolation/revision tests pass, including new review/event records. Browser-only create/profile/save/reload/journal/calendar verified. Signed-in browser end-to-end remains outstanding; explicit browser workspace stays separate. | Existing account setup |
| ATLAS-002 | Portable research and schema evolution | Partial | Version 4 backups include positions, provider profiles, dated reviews and catalysts; versions 1–3 migrate with compatible defaults. Round-trip/duplicate/unsafe-input tests pass. Same local storage key preserved. | ATLAS-003/004 for new shapes |
| ATLAS-003 | Canonical identity | Partial | Named watchlists validate exact provider IDs and require explicit ambiguous-import choices; no ticker merging. D-022 saves an exact numeric CMC ID on a project and routes CMC rows and named-list entries to its token page; duplicate project mappings are rejected. Other cross-source/project/network mappings remain to do. | Existing project model; acceptance card below |
| ATLAS-004 | Evidence, provenance and data quality | Partial | Provider profiles stay separate from manual research; market observations/retrieval/cache age and errors visible. Common evidence conventions across all domains remain to do. | ATLAS-003; ATLAS-002 compatibility |
| ATLAS-005 | Durable ingestion and operating budgets | Planned | Add persisted snapshots, scheduled refresh, shared caching/quotas, bounded retries and observed health when scheduled/multi-instance use needs them; prevent duplicate job/request amplification. | ATLAS-004/047; specific feed requirements |
| ATLAS-006 | Reusable project overview | Partial | Overview now has sourced profile/links, research coverage, next action and dated reviews. Manual summary survives enrichment. D-022 gives a token-centered read view and a link to the editable dossier. Refine reading density and full source drill-down with usage feedback. | ATLAS-003/004; ATLAS-007 for enrichment |
| ATLAS-007 | Automatic project metadata | Partial | CMC /v2/cryptocurrency/info reference view on asset selection; CoinPaprika /coins/{id} profile on demand, 24-hour cache, explicit apply/save. CMC metadata stays an unsaved reference; only its exact ID can be explicitly linked to a project (D-022). Description, links, tags and reported team normalized. Roles/links are not independently verified. Other dossier feeds remain planned. | ATLAS-003/004/047; provider access check |
| ATLAS-008 | Team, funding, sales and tokenomics records | Partial | Structured manual forms and external ICO Analytics/ICO Drops links in project funding and CMC token details exist; no API feed or automatic import. Improve dossier coverage for roles, rounds, disclosed sale prices, allocations/vesting and value capture without implying all records are verified or provider-populated. | ATLAS-004; ATLAS-028 for automated history |
| ATLAS-009 | Organization and institutional connections | Planned | Add typed relationships for companies, VCs, banks, institutes, universities and public bodies, with exact entity, stage, evidence and token relevance. First project table/filter; reverse organization pages later. | ATLAS-003/004/008 |
| ATLAS-010 | Thesis, conviction and research gaps | Partial | Meaningful research gaps, next action/date and dated review history implemented. Broader counterevidence and thesis versioning remain planned. | ATLAS-004; ATLAS-037 for decision history |
| ATLAS-011 | Project comparison and saved research views | Partial | Market table search, supported-column sorting, compound numeric ranges and browser-persisted column selection implemented (D-017). CMC 4h/12h adapter is wired but requires a key/live verification. Column reordering, named saved views and project comparison remain planned. Agree final extra metrics with the user when building the table. Never rank by counts of logos or uncalibrated confidence. | ATLAS-006/008/009 |
| ATLAS-047 | Provider service foundation | Partial | Fixed-origin adapters now include FRED CSV, bounded/validated RSS, sentiment, trending searches and chain metrics. Process-local cache/coalescing/throttles/status; visible-page refreshes. Shared/persistent ingestion remains planned. | Existing code; ATLAS-005 for shared operations |
| ATLAS-048 | Browser-to-cloud research transfer | Deferred | Insert-only transfer exists; user postponed using it. Revisit when the user resumes transfer; verify duplicates/recovery without overwriting cloud work. | ATLAS-001/002; user resumes deferred workflow |

## Daily research desk — Soon, M2

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-012 | Anytime market dashboard | Partial | Homepage groups compact market status/sentiment and structure cap/share estimates, a central CMC top-100 or wider CoinPaprika searchable/filterable/sortable Discovery table, US macro including WTI, personal views, news/calendar, switchable onchain summaries and source/mode-selectable Discovery feeds (D-018) with drill-downs; research workflow moved to /research. Wider derivatives, X, global macro/calendar and RWA coverage remain planned. | ATLAS-006/010/013/015; available market contracts |
| ATLAS-013 | Watchlists, Buy List and research queue | Partial | Market discovery adds mapped assets to Watching; existing projects reopen rather than duplicate. D-019 adds named browser-local lists, notes/status, sorting/ranges, archive/restore and a dashboard selector. D-020 adds saved Discovery presets; watchlist-specific saved presets, cloud list sync and historical monitoring remain planned. | ATLAS-001/003; ATLAS-005 for scheduled snapshots |
| ATLAS-014 | Saved evidence and scrapbook | Partial | Browser-local Research Library and per-project Library tab save X/news/article links, notes and bounded PNG/JPEG/WebP/GIF screenshots with topic/tags, source URL, search, edit/delete and separate screenshot-inclusive backup/insert-only restore (D-021). Account cloud sync, project-backup inclusion, editable chart plans, AI extraction and richer provenance remain planned. | ATLAS-001/004; attachment storage/access design |
| ATLAS-015 | Unified calendar and catalysts | Partial | Manually sourced project catalysts with calendar-day dates persist and appear in calendar/dashboard. Automated feeds, exact event times and macro/policy lifecycles remain planned. | ATLAS-003/004; ATLAS-021 for agreement lifecycle |

## Macro and policy — Soon, M3

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-016 | Global policy rates, yields and expectations | Partial | US 2Y/10Y nominal yields, 10Y real yield and monthly effective fed funds via FRED. Global policy instruments/meetings and CME/Kalshi expectations remain planned; access and contract definitions must be checked. | ATLAS-004/005/015; verified official series access |
| ATLAS-017 | Inflation, growth, labor, credit and fiscal context | Partial | Headline/core PCE, headline CPI and unemployment via FRED, with exact-month MoM/YoY inflation and source units/dates. Consensus/calendar access remains planned. Retain wider inflation, growth/jobs, credit/fiscal scope; observations, forecasts and revisions distinct. | ATLAS-004/005/016 |
| ATLAS-018 | Global broad money and liquidity context | Partial | US M2 history via FRED is available; it is not global money supply. Multi-country common-month/FX composite, native growth and central-bank balance sheets remain planned. | ATLAS-004/005; official money and FX histories |
| ATLAS-019 | VIX, dollar and cross-asset stress | Partial | FRED daily observations/history for VIX, broad trade-weighted USD, S&P 500, WTI/Brent, Henry Hub US spot gas and real yields. Expand to other regional gas, gold/silver/copper and electricity/energy context via verified sources. Renewable capacity/generation/cost and deeper minerals/agriculture are planned; no automatic risk regime. | ATLAS-004/005; historical series and calculation definitions |
| ATLAS-020 | Bitcoin cycles and editable scenarios | Planned | Historical anchors, drawdown/elapsed-time comparisons and user scenario windows with evidence/invalidation. Keep calendar hypotheses independent of observed regime; no forced bottom forecast. | ATLAS-016/018/019/034 as needed for each view |
| ATLAS-021 | Tariffs, trade deals and political developments | Planned | Country/agreement timeline and calendar with proposal→announcement→signature→effective/expired/disputed states, separate verification, original texts and affected sectors. Meeting headlines do not prove implementation. | ATLAS-004/015; primary source collection |

## Chain capital and trading access — Soon, M4

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-022 | Chain explorer and TVL history | Partial | Current DefiLlama chain TVL rankings/search and detail workspace. Chain history, composition and capital-flow attribution remain planned. | ATLAS-003/004/005/047; chain/history endpoint checks |
| ATLAS-023 | Stablecoins and covered capital flows | Partial | DefiLlama USD-valued aggregate stablecoin supply/history and exact seven-day change. Chain/issuer splits, bridged/native distinctions and flows remain planned. | ATLAS-003/004/005/022 |
| ATLAS-024 | RWA assets, issuers and access | Planned | Separate distributed/represented value and asset classes; issuer/network drill-down with sourced KYC, eligibility, minimums, trading and redemption terms. Unknown access is not unrestricted access. | ATLAS-003/004/009/022; specialist access verification |
| ATLAS-025 | CEX/DEX listing and pool directory | Partial | CG paginated listings and DexScreener token pools exist. Extend verified venue typing, pair/quote identity, coverage, price/volume/spread/pool age and market links; avoid duplicate totals. | ATLAS-003/004/047 |
| ATLAS-026 | Executable liquidity and lending access | Planned | Selected venue order books with depth bands and size-specific fill estimates; separately sourced DEX quotes and lending availability/utilization. Show timestamps, fees, price impact, partial books/routes and access constraints. | ATLAS-025; permitted venue access; quote/FX normalization |

## Connected research intelligence — Later, M5

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-027 | Chain/project revenue and token value capture | Partial | DefiLlama signed daily revenue rankings with chain/app filtering. Revenue is not net profit or holder income; history, costs, incentives and holder capture remain planned. | ATLAS-003/004/008/022; endpoint/definition checks |
| ATLAS-028 | Funding, unlocks and foundation treasuries | Planned | Enrich manual rounds/sales with dated schedules, dilution, investor/sector history, treasury composition and explicit runway assumptions. Disclosed sale multiples are not known investor returns. | ATLAS-008/009/015; verified sources |
| ATLAS-029 | Developers, builders and adoption themes | Planned | Canonical repositories, meaningful contributor/release trends, grants/hackathons and production-use evidence; six overlapping adoption themes. Academic affiliations and pilots are typed precisely. | ATLAS-003/004/009/027 |
| ATLAS-030 | News, media, social and search attention | Partial | Dated CoinDesk/Cointelegraph and Federal Reserve/ECB RSS headlines plus CoinGecko trending searches, CMC recent additions and CoinPaprika five-day additions (D-018). Other attention rankings remain paid/unverified. Publisher filtering and URL deduplication are implemented. Aggregator feeds, permitted X/Telegram ingestion, CMC numeric mindshare (access unverified), tagging and cross-source story grouping remain planned; see PROVIDER-RESEARCH.md. | ATLAS-003/004/005/015; access/attribution checks |
| ATLAS-031 | Narratives, rotation and relative strength | Planned | Add benchmark/basket beta, correlation, ecosystem leader/laggard and historical-run comparisons with dated evidence and adequate aligned history. Current ETH/BTC spot ratio is not a rotation model. See ATLAS-049. | ATLAS-003/027/030/034; ATLAS-023 for liquidity context |
| ATLAS-032 | Security, regulation and research ratings | Planned | Sourced audit/exploit/regulatory findings and third-party ratings with scope/date/jurisdiction; separate findings from a user's risk assessment. Missing coverage never implies safety. | ATLAS-003/004/015/021; coverage checks |
| ATLAS-033 | On-chain holders, wallets and concentration | Planned | Sourced holder/entity labels and covered flows with custody/wrapper ambiguity; distinguish movement from trading intent. | ATLAS-003/004/005; suitable chain/provider data |

## Decisions and strategy — Later, M6

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-034 | Raw candles, charts and historical datasets | Partial | Official external TradingView displays on Market Structure; dedicated Charts workspace under Research with explicit Binance spot pairs, candles/volume/indicator/drawing controls and range/theme support. Drawings are temporary. Atlas-owned candles, simple MA/RSI/volume, drawing tools and saved project chart library remain planned. Display frames do not provide reusable OHLCV or history for signals. | ATLAS-003/004/005/025; history access |
| ATLAS-035 | Technical signal deck | Planned | Begin with one parameterized signal; then MA crosses, volume breaks, retests/continuations, ATH/support bounces and ATR/Bollinger/Keltner compression. Explain trigger and invalidation. | ATLAS-034; validated signal definitions |
| ATLAS-036 | Backtests, paper-forward tests and skipped signals | Planned | Reproducible config/dataset, costs/slippage, out-of-sample checks and recorded-at-the-time taken/skipped decisions. Signal quality is not a claimed success probability. | ATLAS-034/035/037; execution assumptions |
| ATLAS-037 | Decision journal and thesis history | Partial | Dated project reviews with next-action/date snapshot, journal search and exports implemented. Latest 100 reviews per project; export regularly. Trades, sizing, outcomes and full thesis history remain planned. | ATLAS-001/004/010; first slice can move into M2 |
| ATLAS-038 | Holdings, transactions and portfolio | Partial | Manual quantity/optional average-cost snapshots stored with projects; explicit-ID valuation, incomplete-price subtotal and unrealized P&L. Transaction ledger, realized P&L, fees/import and reconciled cost-basis accounting remain planned. | ATLAS-001/003/004; accounting definitions |
| ATLAS-039 | CMC personal watchlist/portfolio import | Planned | D-019 supports manually pasted token names/tickers/provider IDs with validated ambiguous-match preview and deduplication. Supported account access/exports and portfolio import remain under investigation. No assumption an API key exposes personal account records. | ATLAS-002/003/013/038; access investigation |

## Assistance, specialist tools and continuous improvement — Later, M7/M8

| ID | Capability | Status | First useful acceptance boundary | Dependencies |
| --- | --- | --- | --- | --- |
| ATLAS-040 | AI research and structured strategy assistance | Planned | Cited summaries, comparisons and thesis challenges over retrieved records; later scrapbook/chart extraction and validated strategy configurations. Reviewable suggestions, bounded cost, no arbitrary generated execution. | ATLAS-004/014; ATLAS-035/036 for strategy tools |
| ATLAS-041 | Personal alerts and monitoring | Planned | User-selected material change triggers, saved rules, deduplication and delivery controls; expose why triggered and suppress stale/missing-data artifacts. No monitoring currently enabled by this plan. | ATLAS-005/010/015 and implemented signal domains |
| ATLAS-042 | Derivatives and liquidation context | Planned | Selected funding/OI/actual liquidation feeds, with contract definitions; modeled heatmaps separately labeled and only with adequate inputs. | ATLAS-003/004/005/034; specialist data access |
| ATLAS-043 | Yield and spread opportunities | Planned | Yield components/duration/risk and venue spread estimates after gas, fees, depth, access and transfer assumptions; no guaranteed arbitrage claim. | ATLAS-026/027/034; access to current quotes |
| ATLAS-044 | Corporate treasury and related equities | Planned | Dated corporate holdings/liabilities/share structure and defined NAV scenarios; link organizations and relevant equities without equating exposure with token endorsement. | ATLAS-009/019/028; official filings/market data |
| ATLAS-045 | Atlas identity and usable interface | Partial | Reference-inspired compact shell/cards, refined typography/controls, and a persistent 224px-to-72px icon sidebar implemented. Keyboard labels, reload persistence and mobile drawer verified. Grouped dashboard and persistent light/dark theme added; table customization and token-page density refinements remain planned. | Cross-cutting; no Bolt layout lock |
| ATLAS-046 | In-app idea and feedback inbox | Planned | Private idea capture with page context and source/attachment references; manual triage to this backlog first. No duplicate status system without explicit ownership rules. | ATLAS-001/014; useful product workflow first |

## Next-slice acceptance cards

### ATLAS-003 — Canonical identity first slice

- Problem: provider facts, organization links and future multi-chain assets must refer to the correct entity.
- Slice: typed project/network/token references and explicit external-ID/chain-contract mappings that preserve current project IDs.
- Checks: two assets with the same ticker remain separate; one project can reference multiple deployed tokens; unresolved matches are shown for review; existing projects and versioned exports still load; duplicate provider/contract mappings cannot silently attach facts to the wrong token.
- Not included: an exhaustive asset registry or fully automatic entity resolution.

### ATLAS-004/006 — Evidence-aware overview first slice

- Problem: the user needs a readable overview whose facts can be trusted and corrected.
- Slice: standardize the evidence fields used by the overview and existing structured records; show sourced/manual facts, product summary, official links, available market values, thesis, invalidation and missing research.
- Checks: unknown is not zero; stale/unavailable is visible; source and dates are inspectable; a provider refresh preserves personal edits and notes; malicious link schemes are rejected; old saved projects still work; the mobile page remains readable.
- Not included: filling every field automatically, investor scores or generating a buy/sell conclusion.

### ATLAS-007 — First metadata adapter selection

- First implementation: CoinPaprika profile endpoint, checked 2026-09-28. Follow the same access/field checks for future enrichment.
- Select the least additional provider work that supplies the overview's required fields; consult DATA-SOURCES candidates and current adapters.
- Record the exact endpoint, available fields, credential requirement, quota, attribution and expected refresh frequency. Validate a successful response plus missing-field and provider-failure fixtures.
- If an endpoint cannot be used within the intended budget, record the gap and retain manual entry. Do not label a provider planned/disabled as healthy.

## Traceability: all 31 blueprint sections

| Original section | Backlog coverage |
| --- | --- |
| 1 — Identity/bento UI | ATLAS-045/006/012 |
| 2 — Efficient data | ATLAS-003/004/005/047 |
| 3 — Signal deck | ATLAS-034/035 |
| 4 — Backtesting/thesis vault | ATLAS-010/036/037 |
| 5 — AI parser and research | ATLAS-040 |
| 6 — Macro clock | ATLAS-020 |
| 7 — Correlation/valuation | ATLAS-019/031/034 |
| 8 — Attention convergence | ATLAS-030/031 |
| 9 — Media dissemination | ATLAS-030 |
| 10 — Search interest | ATLAS-030 |
| 11 — Taken/skipped | ATLAS-036/037 |
| 12 — Compression | ATLAS-035 |
| 13 — Stablecoin flows | ATLAS-023 |
| 14 — Derivatives | ATLAS-042 |
| 15 — Protocol economics | ATLAS-027 |
| 16 — Regulation | ATLAS-032/021 |
| 17 — Central banks | ATLAS-016/017/018/019 |
| 18 — VC momentum | ATLAS-008/009/028 |
| 19 — Sale price/unlocks | ATLAS-008/028 |
| 20 — Calendar | ATLAS-015/021 |
| 21 — Corporate treasury/equities | ATLAS-044 |
| 22 — Concentration/whales | ATLAS-033 |
| 23 — Early discovery | ATLAS-025/029/030/031 |
| 24 — Yields/spreads | ATLAS-043 |
| 25 — Relative strength | ATLAS-031/034 |
| 26 — Journal/plans | ATLAS-037/038 |
| 27 — Builders/alliances | ATLAS-009/029 |
| 28 — Foundation treasury/tokenomics | ATLAS-008/028 |
| 29 — Scrapbook | ATLAS-014/040 |
| 30 — Token value capture | ATLAS-027 |
| 31 — Narratives | ATLAS-031 |

Screenshot additions: stress → ATLAS-019; crypto rotation → ATLAS-031; adoption themes → ATLAS-029/031; companies/institutes/universities → ATLAS-009; chain TVL/RWA/access → ATLAS-022/023/024/026; money supply → ATLAS-018; tariffs/meetings/deals → ATLAS-021; global rates and macro trends → ATLAS-016/017/019. Original full dossiers, venues and CMC account import are retained in ATLAS-006–011, ATLAS-025/026 and ATLAS-039.

## Idea inbox

The additions supplied so far have been linked to the capabilities above. This does not mean their data claims have been verified. Add future ideas here before choosing implementation scope; extend an existing ID when the need matches.

| ID | Idea / user problem | Source / date | Related capability | Status / next action |
| --- | --- | --- | --- | --- |
| ATLAS-049 | Evidence-backed token/chain ecosystem relationship board, linked to beta/drawdown/rebound comparisons | User / VirtualBacon screenshots, 2026-09-28 | ATLAS-009/031/034/035 | Planned; define graph identities and aligned-history methodology before implementation |
| ATLAS-050 | Attributable analyst/media/investor price targets with bull/bear scenarios, horizons and revision history | User, 2026-09-28 | ATLAS-014/020/030 | Planned; first manually sourced forecast records, then permitted enrichment |

Next new ID: ATLAS-051. CME/Kalshi, PCE and 50 MA extend ATLAS-016/017/035 rather than creating duplicate features.

## Delivery notes

- 2026-09-28: clarified ATLAS-027 for chain-level and app-level revenue, known costs and token-holder capture; first chain economics slice scheduled with M4, deeper economics retained in M5. Planning only; the revenue feed and display are not implemented.

- 2026-09-28: created this status baseline and mapped all 31 blueprint sections plus screenshot additions. Documentation reviewed for coverage and consistency; no new provider, feature, alert, commit or deployment was delivered by this planning change.
- Earlier implementation checks: see the dated implementation snapshot in MASTER-PLAN §8. Re-run applicable checks when code changes; do not imply planning edits reran them.

- 2026-09-28 daily desk: 38 automated checks, typecheck, lint and production build pass. Live provider requests and browser-only research flow verified; cloud transactional review/event round-trip, stale revision rejection and account isolation verified with rolled-back test data. Signed-in browser save remains a separate outstanding check. No browser transfer, paid plan, commit, push or deployment performed.

- 2026-09-28 UI refresh (ATLAS-045): applied reference design structure, rounded panels, denser spacing and icon-only navigation with local preference persistence. Typecheck, lint and build pass; browser checks cover expanded/collapsed navigation, persisted preference, keyboard tooltips and mobile drawer/overflow. Dashboard datasets and research storage unchanged.

- 2026-09-28 anytime dashboard (D-011): 46 automated checks, typecheck, lint and production build pass. Sixteen new live feed/series requests pass through the local API after correcting a CoinDesk redirect and accepting signed revenue observations. Browser checks cover gainers/losers, chain-only revenue filtering, responsive width (390px, no page overflow), sidebar collapse and isolated browser position save/reload/close plus stale-tab conflict rejection. No browser errors observed on the dashboard. Existing workspace records were not edited by the position test. Signed-in browser verification remains outstanding. Existing dependency/build warnings remain; no paid subscription, reset credit, commit, push or deployment performed.
- 2026-09-28 livestream additions (D-012): CME/Kalshi, PCE, ISO/Quant narrative, ecosystem/token connections, 50 MA, sourced targets and beta/high-low comparison captured in MASTER-PLAN §18 and RELATIVE-STRENGTH-BOARD.md. ATLAS-049/050 assigned; implementations remain planned.

- 2026-09-28 grouped dashboard/theme/structure (D-013): existing 46 automated checks pass; typecheck, lint and production build pass. Browser checks verify cap-index displays (TOTAL/TOTAL2/TOTAL3/OTHERS), dominance/ETHBTC view, 1Y range, expanded dialog, light-mode reload persistence, sidebar collapse and onchain tab switching. At 390px, document/main widths show no horizontal overflow and navigation/expanded dialog work. These checks do not verify upstream freshness, blocked-network timeout behavior, drawing persistence or signed-in research saves. Existing Recharts deprecation and dependency/build warnings remain. No new paid API, personal-data transfer, commit, push or deployment.

- 2026-09-28 compact dashboard/Discovery/chart workspace (D-014): 49 automated checks, typecheck, lint and production build pass; git diff whitespace check passes. Browser checks verify no dashboard chart iframes, compact cap/share/reported-change values, combined search/min-cap filtering, ascending/descending cap sorting and resets, structure-link navigation with four cap charts, and Research Charts with Binance BTC/ETH candles, volume, drawing/indicator controls and 1Y range. Dashboard and Charts fit a 390px document width; the table scrolls within its container. No saved project or position was edited in this batch. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. Basket percentage history, editable/saved project chart plans, column customization and cycle phase classification remain planned. No commit, push or deployment performed.


### Provider expansion validation — 2026-09-28 (D-015)

All 56 automated checks pass, including CMC public/keyed transport, secret isolation, decoding, lazy whole-snapshot fallback, exact inflation baselines and independent RSS failures. Typecheck, lint and production build pass. Twelve live local API requests succeed: CMC global/Fear & Greed/Altcoin Season, Cointelegraph/ECB and all seven added FRED series. Runtime status reports CMC, both new publishers and FRED healthy. Browser checks verify CMC dashboard values, inflation YoY/MoM with dated index histories, energy spot units, grouped macro tabs and combined policy/ECB/headline filtering. Macro and News fit 390px without document overflow; no browser error logs were observed. Existing saved project/position records were not edited. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. CMC ranked listings, matching outside-top-ten cap, mindshare, personal-account import, broader trade/political news and automated event calendars remain separate work. No paid plan, commit, push or deployment was performed.


### CMC reference enrichment validation — 2026-09-29 (D-016)

All 60 automated checks pass, including exact CMC IDs, explicit USD quotes, safe metadata links, bounded cached requests and aligned top-ten estimates. Typecheck, lint and production build pass. Live requests return 100 ranked assets and token metadata; malformed IDs/providers return 400. A temporary upstream 429 exercised the visible CoinPaprika fallback and cooldown, followed by successful CMC recovery. Browser checks cover combined search/min-cap filters, both sort directions, provider switching, token links, distinct quote/metadata timestamps, refresh and Bitcoin/Ethereum navigation. Mobile classifications fit a 390px document width without overflow. A duplicate sibling-key rendering bug found during QA was fixed and the single-card behavior reverified. The dashboard shows CMC Discovery and a matching-source outside-top-ten cap/share estimate. No browser error logs were observed. Saved research/position records were not edited. Existing build warnings (dependency expression, Browserslist and metadataBase) remain. CMC-to-project persistence, broader rankings, mindshare, verified funding/team/unlocks, column customization and automated calendars remain separate work. No paid plan, commit, push or deployment was performed.


### Market columns validation — 2026-09-29 (D-017)

65 automated checks, TypeScript, lint, production build and whitespace checks pass. Browser checks verify the live CMC 1h and computed BTC-relative columns, combined 24h >= 5% and volume >= $10M filters, signed/inverted range validation, search combined with ranges, BTC-relative sorting both directions, column reload persistence and provider switching with watchlist controls intact. At 390px, picker/ranges fit the document and the table scrolls internally. No browser errors were observed. The local performance route returns missing_key (503) with zero external history requests; runtime CMC status stays healthy. Keyed history decoding/batching/caching is verified with fixtures only; no configured key exists for an authenticated live check. Sentiment/mindshare/YTD/7d mini-chart remain disabled. Existing build warnings remain. No saved research or positions were edited; only the new UI column preference was saved. No registration, subscription, commit, push or deployment.


### ATLAS-012/030 — Cross-provider discovery, requested 2026-09-29

Delivered D-018: provider controls for CMC / CoinPaprika / CoinGecko with Trending, Most visited and Newly added modes. Connected CoinGecko search trending, regular CMC listings sorted by date_added (up to 50 recent additions), and CoinPaprika /coins is_new (added within five days, up to 100). Exact provider IDs remain separate and absent quotes remain unknown. Paid/unverified combinations show a source link and make no ranking request. Dedicated CMC feeds and CoinGecko newly added are still unconnected. Source overlap and persistent project mappings remain planned. This is a partial ATLAS-012/030 delivery, not completion of all attention coverage.


### Cross-provider Discovery validation — 2026-09-29 (D-018)

70 automated checks, TypeScript, lint, production build and whitespace checks pass. Three live local API feeds succeed without new credentials: CoinGecko trending (15 rows), CMC recent additions (50 rows) and CoinPaprika five-day additions (60 rows at verification). Paid CMC most-visited returns typed disabled/503; fixture checks verify all six unavailable combinations make zero external ranking requests, even with keys configured. Decoders preserve exact identities, zero/null values, independent errors, bounds/cache behavior and provider trend order. CoinPaprika validation accepts unrelated historical Unicode directory entries but rejects unsafe selected addition IDs.

Browser checks cover provider/mode switches, Paprika Show more (20 to 40 of 60), feed search, search reset on source change, CMC descending listing dates and asset metadata navigation outside the top 100. The existing reference page explicitly has no quote outside its top-100 snapshot; the additions feed's quote is not silently reused there. Dashboard shows five trend rows. At 390px the controls and long-name/price rows fit, with document width/scroll width both 390. No browser error logs were observed; temporary viewport override was reset. Existing saved research and positions were not edited. Build retains existing Supabase dependency, Browserslist and metadataBase warnings. No paid signup, subscription, commit, push or deployment. Named watchlists, canonical source overlap and numeric CMC sentiment/mindshare remain separate work.


### D-019 validation — 2026-09-29

77 automated checks, TypeScript, lint, production build and whitespace checks pass. Browser checks cover list creation, ambiguous paste preview (CMC/Paprika/Gecko candidates), exact-ID choice, unknown skips, saved notes/status after reload, column persistence, price sorting both directions, combined signed ranges, asset archive/restore, list archive/restore, duplicate and new CMC Discovery additions, dashboard selection and reload, and conflicting two-tab notes retaining the unsaved draft. At 390px document/scroll widths are both 390; the table scrolls internally. Final browser error logs were empty. The test list was archived and dashboard returned to Research watchlist; existing research/positions were not changed.

Backup schema round trips, insert-only import, malformed data, identity/name collisions and stale revisions are covered by automated tests. The in-app browser did not return a download event for Backup lists, so an actual downloaded-file restore was not verified in that browser. Build retains existing Supabase dependency, Browserslist and metadataBase warnings. No paid signup, new API key, subscription, commit, push or deployment.


### D-020 — Saved Discovery starting views (ATLAS-012/013)

Delivered three quick views: BTC outperformers (24h BTC-relative ≥ 0.1%), weekly-leader pullbacks (7d ≥ 0.1%, 24h ≤ −0.1%) and high-volume gainers (24h ≥ 5%); all require $10M reported 24h volume. They operate over the selected provider's current snapshot using Overview, without the separate Top gainers/losers top-200 restriction. Reported volume is not execution liquidity and these are research filters, not trade signals.

Save up to 20 named browser-local views. Records retain CMC/Paprika source, columns, search, mode, cap/volume minimums, up to eight valid signed ranges, sort and direction. Selection restores source and settings together; manual edits stay independent until selection/save. Quick views omit 4h/12h, need no new endpoints and reuse existing benchmark alignment. Remove saved view affects only its preference record; research and watchlists are unchanged. Corrupt stored preferences are retained with saving disabled; stale writes are rejected. No last-active filter is automatically reapplied on page load.

Validation: 79 automated checks pass, including preset predicates, missing fields, provider/column/range round trips, unsafe configuration and stale writes. TypeScript, lint, production build and whitespace checks pass. Browser checks verify all three presets, signed bounds, custom CoinPaprika search/filters/sort saved through reload, restoration from the CMC page switching to Paprika, Clear view, and 390px document/scroll widths of 390. Existing research/positions were not edited. A clearly named QA view remains as the verification example. Build retains existing dependency/Browserslist/metadataBase warnings. No new API, key, subscription, commit, push or deployment.

### D-021 saved research library — 2026-09-30

The user requested a library for important project-specific X posts, articles and screenshots, plus a general investing/crypto hub. `/projects/[id]` now has a Library tab; `/library` has general and project collections with topic/type/search filters. Records and image blobs use account-scoped browser IndexedDB, with source links and personal notes. Links and image types are validated; screenshots are capped at 5 MB and exported in a separate version 1 JSON backup. Restore inserts missing IDs and keeps existing items. No external article scraping, CMC/X access, cloud storage, or project-document change. Typecheck, lint, 82 automated checks and production build pass. In an isolated local browser origin, a general link and a project note were saved; editing, reload persistence, project scoping, hub filtering and backup action were verified. Screenshot file type/size/signature and backup schema checks pass in tests; the in-app browser file picker stalled, so screenshot upload and restore still need a manual browser round trip.

### D-022 — Exact-ID CMC token page (ATLAS-003/006/007/014/025/034) — 2026-09-30

CMC market rows and named-list entries now open `/tokens/cmc/[id]`. The page shows the existing CMC quote/profile with observation dates, a BTC or ETH Binance spot TradingView chart only for those two explicit CMC IDs, and tabs for markets, research and the project Library. Other CMC IDs show an honest chart-mapping gap and source link. A user can create a new project from the CMC asset or explicitly connect an unbound existing project; no ticker match is inferred. The saved project gains an optional CMC ID, while profile text and other provider IDs remain separate. Existing v1–v4 project backups parse with an empty ID by default, and duplicate CMC project mappings are rejected. Venue/pool feeds still require independently confirmed CoinGecko/chain/contract mappings. Token-specific news, numeric sentiment/mindshare and saved editable chart drawings remain open.

Validation: 82 automated checks, TypeScript, lint, production build and whitespace checks pass. A fresh local browser preview loaded the Bitcoin quote/profile, created an exact-ID project, displayed Markets, Research and Library tabs, and retained the project connection after reload. This QA project was created only in the isolated `127.0.0.1:3002` browser origin. The in-app browser file picker stalled again when testing a synthetic screenshot, so screenshot upload and backup restore still lack a completed browser round trip. Existing build warnings remain (Supabase dependency expression, Browserslist and metadataBase). No commit, push or deployment.
