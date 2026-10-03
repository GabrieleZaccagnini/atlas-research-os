# Atlas service foundation

The service foundation exposes GET routes under `/api/data/`. The Projects workspace now calls market, exchange and DEX services on demand; Data Sources reads provider status. Daily Dashboard, Calendar and Journal now use real snapshots or saved research. Other unfinished pages remain marked as design previews. See [Research workspace](RESEARCH-WORKSPACE.md) for browser storage, navigation and migration details.

## Boundaries

`UI → API route → domain service → provider adapter → shared runtime → upstream`

- `services/server.ts` is the server-only composition root. It alone reads environment variables and wires adapters into domain contracts. Never import it into a client component.
- `services/{market,exchanges,dex,defi}/index.ts` validate inputs and define provider-independent contracts. Adapters normalize upstream JSON using Zod.
- `services/core/types.ts` contains shared normalized types and result/error envelopes, separate from existing UI types in `lib/types.ts`. Unknown numeric values remain null. Prices explicitly identify units and token side.
- `services/core/runtime.ts` supplies timeout/abort, fixed provider origins, header-only credentials, safe errors, request coalescing, local throttling and 429 cooldown. No retries multiply quota use.
- `services/core/cache.ts` defines an asynchronous replaceable cache interface and a bounded in-memory implementation. Fresh TTLs: quotes 60s, global/listings 120s, pools 30s, TVL 300s; CoinPaprika asset/global snapshots 300s and profiles 86400s. Stale fallback lasts an additional configurable 300s, only after a failed refresh and always labeled with a warning and original timestamps. Disabled providers never return cached data.
- `services/catalog.ts` records the complete candidate source map, separately from implemented capabilities. Planned providers do not report healthy or connected. Provider access tiers must be checked when implementing each endpoint.
- `services/liquidity` handles normalized liquidity calculations. Future scoring/interpretation belongs in a separate intelligence layer. No execution or slippage claims are derived from pool TVL.

## Operations and limitations

Status reflects observed upstream requests in the current process, not synthetic health checks. Cache hits do not make a failed provider healthy. Idle means untested; missing key and disabled are distinct states. Config changes require a process restart. API status never exposes keys, raw upstream errors or request URLs.

Cache, cooldown, request coalescing, and status are process-local. Serverless instances can differ and process restarts clear them. Before a multi-user deployment, add authentication/request budgets and shared caching/rate limiting. These read-only endpoints have bounded inputs but are not a global abuse-prevention system. Keep provider URLs fixed; do not accept arbitrary upstream URLs.

CoinGecko queries use CoinGecko IDs, not ticker symbols. DEX queries use a chain/address tuple, preserving address case. Exchange listings are one explicit page (100 upstream tickers); mayHaveMore is a hint, not proof of complete coverage. Venue type remains unknown until an authoritative mapping exists. Pool prices are for the returned base token. Pools and reported volume may overlap across feeds; do not add CEX and DEX totals blindly.

## Extending safely

Implement a narrow domain contract, add a provider adapter with runtime validation, wire it into the server composition root, and add fixtures for success/missing fields/failure. Use provider-specific IDs with an explicit cross-provider identity map. Fallback providers must return the same normalized contract and preserve provenance; this first slice uses bounded stale cache fallback, not automatic cross-provider fallback. Manual data must be explicitly labeled, never substituted as live data.

Run `npm run typecheck`, `npm run lint`, `node scripts/test-services.cjs`, and `npm run build`. Tests use the existing TypeScript dependency and Node test runner, with no external API calls or new dependencies.

## Daily research slice

`/api/data/assets` returns a single normalized CoinPaprika snapshot for discovery and dashboard prices. `/api/data/project?id=...` supplies a bounded profile. `/api/data/market` and `/api/data/global` accept explicit `provider=coinpaprika`; omitting it preserves the previous CoinGecko contract. No cross-provider symbol joins or silent provider switching.

Project JSON adds explicit `coinpaprikaId`, a separate provider profile, dated review history and calendar-day catalyst records. Export format 3 accepts formats 1/2 with defaults; existing storage key and cloud JSONB persistence remain unchanged. No database migration was needed. Local unfinished review/event input is lifted to the project editor, survives section switching and participates in leave-page warnings. Save/log and add-event actions remain explicit.

Workspace choice is presentation/storage selection: an authenticated session always uses its cloud workspace; a signed-out user may explicitly opt into browser-only storage. RLS and cloud authentication remain unchanged; browser transfer is always explicit and remains user-deferred. Browser preferences and research are local to each origin.

Upcoming-token leads are ordinary project documents with an additive `tokenLaunch` object: user-marked stage, optional tentative date, discovery/announcement source URL and reason. Quick-capture Website, X, Documentation, Discord, Telegram and GitHub URLs use the existing `details.links` records, so they remain editable in project Official links and travel with project backups/private cloud documents. Older project documents receive empty defaults on read; format 4 backups and the existing private cloud JSONB document carry the fields without a separate store. `/upcoming` filters Potential/Announced projects and orders dated leads before undated ones. It does not infer provider IDs or publish a calendar event from a tentative date.

## Anytime dashboard expansion — 2026-09-28

`components/dashboard/market-dashboard.tsx` composes reusable panels from `panels.tsx`; `/markets`, `/macro`, `/news`, `/chains`, `/portfolio` and `/market-cycle` use the same source contracts. `/research` retains the prior research desk. Preview-only routes remain labeled in navigation. The new read-only `/api/data/intelligence` validates a fixed feed/series allowlist and calls `services/intelligence/adapters.ts` through the shared runtime. No upstream secrets or arbitrary URLs enter the client.

FRED CSV and source RSS extend runtime decoding with bounded text. Original JSON adapters are unchanged. `use-feed.ts` loads independently, spaces same-provider endpoints, cancels on unmount, pauses polling while hidden and refreshes every five minutes while visible. Source timestamps and cached/failure status remain available; no all-or-nothing dashboard fetch.

Project documents gain nullable `position` snapshots (decimal-string quantity, optional average USD cost and recordedAt). Backup version 4 accepts old versions 1–3 and defaults absent positions to null. No Supabase schema/RLS/auth change: the existing private JSONB document and revision-checked save path carry the new field. No transfer is performed. Unrealized P&L is current quantity × (current price − entered average cost), not a tax ledger; unknown quotes/costs stay null. Closed zero-quantity positions are omitted from the positions view but editable from its selector.


## Dashboard display boundaries — 2026-09-28

Reusable market-structure UI uses fixed TradingView symbols and the official script/iframe display. Lazy viewport mounting limits startup work; cleanup removes observers/timers/widgets on range/theme changes and unmount. Load/error/timeout handling concerns embed transport, not upstream market API status. External widgets own refresh, data notices and interactions; direct links remain available. They are not registered as healthy server adapters and cannot feed technical calculations, backtests or saved drawing geometry. Those require a separate history contract and owned chart state.

D-030/031 use fixed BlockHorizon iframe URLs in `components/dashboard/blockhorizon-cycle.tsx` for a provider-hosted signal and selected cycle, spending, drawdown and miner-revenue charts. Switching charts changes only the iframe source. Attribution and direct source links are part of the UI; nothing is requested through Atlas's provider runtime or written to research storage. In-app browser cross-origin rendering remains unverified, so fallback links are always visible. D-032 adds `app/api/data/bitcoin-mining/route.ts`, which fetches fixed Blockchain.com Charts API hash-rate and BTC-price histories with a six-hour server cache, validates positive finite points, aligns common UTC dates and returns chart-ready data. `components/dashboard/bitcoin-mining-chart.tsx` renders this separately from the BlockHorizon embeds. It does not store research or calculate miner profit; Luxor hashprice is a direct source link only.

D-033 adds `app/api/data/bitcoin-cycle/route.ts` and pure calculations in `lib/bitcoin-cycle.ts`. The route requests unsampled Blockchain.com history for BTC price and, only for the selected mining view, hash rate or miner revenue. It caches upstream responses for six hours, aligns by UTC date, and returns calculated rows. `components/dashboard/bitcoin-cycle-lab.tsx` renders one selected chart/table, keeps scenario inputs in component state, and labels derived models and missing provider coverage. It does not persist raw history, forecasts or user input. BlockHorizon remains a separate third-party display.

D-034 adds `/derivatives` and a Dashboard summary. The fixed, key-free Binance USDⓈ-M BTCUSDT requests in `app/api/data/btc-derivatives/route.ts` fetch current open interest, 30 daily open-interest observations and 90 settled funding observations. `lib/btc-derivatives.ts` validates contract identity, numeric units and timestamps. Each endpoint fails independently; the route errors only if all three fail. A five-minute upstream cache bounds repeat calls, while the UI refreshes when visible and labels partial data. No cross-venue aggregation or liquidation estimates are calculated.

D-035 adds `components/dashboard/liquidations.tsx` and `lib/liquidations.ts`. A browser WebSocket subscribes to Binance's fixed BTCUSDT forced-order stream only while `/derivatives` is mounted. Positive reported filled quantity and average execution price are required before an event enters the observed map. A versioned, account-scoped browser-local record keeps up to 5,000 events and 500 connection windows over seven days; writes merge existing records to avoid clobbering another open tab. The map bins captured events by time and execution price and draws connection coverage separately, without estimating missing events or future levels. `app/api/data/coinalyze-liquidations/route.ts` uses a server-only key, validates the exact Binance BTCUSDT perpetual market listing, and requests up to 30 days of hourly USD-converted long/short totals. The route returns missing-key until configured. No Coinalyze sample has been verified live; there is no data substitution between the two sources or research/cloud storage mutation.

The shared next-themes provider applies CSS theme tokens and a browser-only UI preference; it does not alter saved project schemas. Existing manual positions/research/export compatibility remain unchanged. Onchain dashboard tabs mount only their selected summary pair; existing server caches and detail views are reused.


Dashboard refinement (D-014): the homepage no longer mounts chart embeds. It reuses global/assets for timestamp-aligned structure estimates and reported total cap/volume changes. Market Structure retains fixed index embeds; Charts reuses the same widget lifecycle for an allowlisted Binance pair selector with full toolbar and volume. MarketTable's shared filters/sorts are pure client operations over the cached snapshot and never change research records. No new storage schema or ingestion job is added.

### D-015 provider expansion

ProviderRuntime now supports CMC, Cointelegraph and ECB fixed origins. CMC public mode prefixes /public-api; an optional CMC_API_KEY selects authenticated headers and original paths. Secrets never enter client/status/cache keys. CMC adapters validate API-level error envelopes as well as HTTP status; global/sentiment/altseason have separate cached results. /global?provider=auto lazily falls back to a complete CoinPaprika snapshot and emits an explicit warning; no field-level blending. RSS adds fixed source allowlists and URL canonicalization. FRED’s seven new series reuse existing bounded decoding and caches. All remain process-local; no persistent ingestion, shared deployment quota or saved-research schema change.


### CMC discovery/reference details — D-016

CMC listings reuse the provider runtime and normalized MarketQuote contract with optional 1h/30d returns. Two bounded routes expose fixed top-100 listings and a single validated metadata ID. Metadata remains a CmcProfile reference object, separate from ProviderProfile saved-record schema and user research. The dashboard/market table can select CMC or CoinPaprika, and the CMC detail card mounts only on explicit asset navigation. Record matching uses explicit provider IDs; CMC rows never enter the CoinPaprika Watch save path. The saved format/version and portfolio price provider are unchanged.


### D-017 market metrics

Table-only derived MarketRow fields do not migrate MarketQuote or research storage. Columns use a validated browser preference key (atlas.discovery.columns.v1); filters remain session state. Historical requests are optional, lazy and gated by a server-only CMC key; malformed/ambiguous/out-of-window observations are rejected or left unknown. Under keyless use, the history endpoint returns a typed missing_key result without consuming upstream quota. A configured key still requires verified historical entitlement; fixture success is not live provider validation.


### D-018 Discovery service

lib/discovery.ts defines the source/mode catalog, coverage and normalized feed shape. services/discovery mounts alongside the existing CoinPaprika discovery service, using the shared runtime. CoinGecko trending reuses its adapter/cache; CMC and CoinPaprika additions use validated decoders and bounded fixed paths. The client mounts one selected feed, remounting it on source/mode changes to avoid relabeling previous-source rows. Unavailable combinations do not fetch. Dashboard summaries show five rows; Markets supports local search and increments of 20. Runtime quotas/cache/status remain process-local. No research schema, identity migration or durable ingestion is introduced.


### D-019 named watchlists

`lib/watchlists.ts` owns validated version 1 list/entry/backup contracts, provider-specific keys, insert-only restore, bounded paste preview and exact quote joins. `components/watchlists/store.tsx` wraps the existing account-scoped shell with a browser-local store; account changes remount it. Reads never overwrite malformed data. Writes validate current revision and the full next document; note saves additionally compare entry timestamps. This is optimistic conflict protection, not an atomic multi-tab database transaction.

Lists reference assets, not project records or positions. Market rows reuse complete CMC/Paprika snapshots so BTC-relative calculations use their provider's aligned benchmark; CoinGecko trending supplies only its covered fields. No per-entry quote fan-out or new upstream adapter is introduced. The dashboard reuses its loaded market feeds; CoinGecko watchlist data is lazy. UI preferences use `atlas.watchlist.columns.v1`, separate from Discovery. Research backup v4 and cloud schema/auth are unchanged. Limits: 50 lists, 1,000 entries per list, 5,000 total entries; 20k note characters. See RESEARCH-WORKSPACE.md for the browser/cloud and backup boundaries.


### D-020 Discovery saved views

`lib/discovery-views.ts` validates version 1 browser preferences under `atlas.discovery.views.v1` (20 unique names/IDs; allowed sources/modes/columns/sorts; bounded valid ranges). `SavedDiscoveryViews` reads without replacing malformed raw data and checks the stored raw value before adding a record. `DiscoveryTable` owns explicit applied settings so a saved selection changes source and then restores MarketTable settings after its source remount. Manual source switches reset applied settings. Preferences are local to the origin, separate from account-scoped research/watchlists and their backups. No last-active view, cloud sync, new feed or provider schema is introduced. Existing historical requests remain conditional on manually selected historical columns/ranges; quick views do not require them.

### D-021 browser research library

`lib/scrapbook.ts` stores personal link, note and screenshot clippings in IndexedDB `atlas.scrapbook.v1`, keyed by the current account ID or browser workspace. Project-specific clippings reference an existing project ID; the general hub can move/edit them without modifying project JSONB documents. Image blobs are limited to 5 MB and accepted only for PNG/JPEG/WebP/GIF after type and file-signature checks. Only HTTP(S) source URLs without credentials are accepted. React renders user text as text and opens external sources in a new tab. Each library has its own version 1 JSON export including base64 screenshot bytes and insert-only restore. This storage is browser-local even for signed-in users; project backup v4 and Supabase RLS/storage remain unchanged. IndexedDB quota and browser-data deletion still apply. Cloud attachment sync needs a separate private storage/access design.

### Token research composition — D-022

`/tokens/cmc/[id]` validates a numeric CMC ID and composes the existing cached top-100 quote and on-demand CMC metadata with project research. The token page shares one metadata feed between the identity card and project connection control. `ResearchProject.cmcId` is an optional exact mapping, defaulting to empty in older backup documents; one CMC ID may connect to at most one project in validated browser backups. No CMC description/links are copied into editable research. Market venues continue to require a confirmed CoinGecko ID, and DEX pools need a confirmed chain and contract. The BTC/ETH chart map is intentionally limited to explicit CMC IDs and Binance spot pairs; other chart mappings are unavailable until verified. The page reuses the project Library scoped to the linked project.


## Editable chart plans — D-023

`/api/data/candles?market=BTCUSDT&interval=1d` uses `services/candles` through the shared runtime. The fixed public data origin is `https://data-api.binance.vision/`; no key or trading route. Seven allowlisted USDT spot pairs and four intervals bound query cardinality. Requests retrieve at most 500 bars, cache for 60 seconds, discard open candles and reject invalid OHLC or gaps. Status and stale fallback follow the existing process-local runtime. `ATLAS_BINANCE_ENABLED=false` disables requests.

`lib/chart-plans.ts` defines dataset/plan/backup validation and deterministic indicators; `components/charts` owns rendering and editing. Records under `atlas.chart-plans.v1:<scope>` contain the full closed-candle snapshot, original fetch time and drawing coordinates, with a 20-plan cap and 4 MB import limit. Restore inserts missing IDs. Both whole-file changes and the loaded plan's update revision guard stale writes. A separate backup preserves geometry; project documents are unchanged. The project Library links to `/charts?project=<id>`. External TradingView displays remain available in their separate tab.

## Official calendar — D-024

`services/calendar` independently decodes the live official BEA and Federal Reserve FOMC schedule pages through fixed-origin shared-provider runtime requests. BEA Eastern release times become exact UTC starts; FOMC meeting dates remain date-only. The API exposes one source per request so failures remain distinct, and the Calendar/dashboard combine successful official events with separately persisted manual project catalysts. HTML changes fail visibly rather than silently manufacturing events. BLS is currently an external official link. The Calendar page defaults to one chronological All view; Crypto and Macro filters change presentation only and retain separate source status. The Coindar feed remains disabled until a token and access rights are verified.

Calendar stars use `atlas.calendar-stars.v1:<scope>` in browser localStorage, scoped to the account ID or the browser workspace. A star saves a bounded title/date/source snapshot, optional personal context and an explicit project ID. Legacy version 1 records gain empty context on read. The Dashboard joins available official/project records by exact event ID for current dates; unmatched dates are labeled saved snapshots to recheck. The Calendar exports this watchlist separately as JSON and restores missing event IDs without overwriting existing notes. Star storage does not modify projects, cloud data or research backups and has no notification service.

D-027 adds a separate FRED-calendar provider for selected BLS dates. Atlas's server receives HTTP 403 from the direct BLS calendar and ICS; FRED's public release-calendar pages are reachable and republish the CPI, Employment Situation, JOLTS and PPI schedules. The adapter fetches only fixed release IDs for the current and next year, validates the page identity and calendar rows, converts published US Central times to UTC, and caches each page for 24 hours. The combined result warns when one page fails; a year with no published dates is valid. The UI labels all such rows “BLS via FRED,” links their FRED page, and provides a separate direct BLS verification link. It does not infer reference periods, release values or consensus.
