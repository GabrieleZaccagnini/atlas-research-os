# Atlas — Crypto Research Operating System

**A personal toolkit I’m building to support my day-to-day crypto research.**

Atlas brings market context, project fundamentals, narratives, catalysts and personal research into one workflow:

**Discover → investigate → build a thesis → monitor → record decisions → review.**

I’m building Atlas to make my research more efficient: organize sources, track projects and catalysts, compare market context and keep a clear record of my reasoning. It reflects the workflow I would bring to a crypto research role, where the priority is producing timely, well-supported insights for the team.

Development follows practical research needs. The aim is to spend less time collecting scattered information and more time investigating opportunities, testing a thesis and communicating what matters.

> **Status: personal work in progress.** This repository shows my research approach and the tools I’m developing to support it. Some workflows are implemented; others are previews or future ideas. Provider coverage, access and freshness vary; a catalog entry is not a live integration.

## Why Atlas exists

Crypto research spans token economics, product adoption, market structure, capital flows, attention, liquidity and macro conditions. A price chart alone cannot explain a project, and a compelling narrative alone cannot validate an investment thesis.

Atlas aims to connect those perspectives without collapsing facts, interpretations and conviction into a single opaque score. The goal is a repeatable research process: identify opportunities, gather sources, challenge assumptions, track catalysts and revisit decisions as evidence changes.

## Research philosophy

- **Evidence before conviction.** Keep sources, dates, counterarguments, risks and invalidation alongside the thesis.
- **Identity before aggregation.** Map provider IDs explicitly; identical tickers do not establish that assets are the same.
- **Unknown is not zero.** Preserve missing values, partial coverage, stale snapshots and provider failures.
- **Attention is not adoption.** Search interest, social activity, price momentum and fundamental traction answer different questions.
- **Context before signals.** Consider market structure, liquidity, token supply and macro conditions together.
- **Research remains yours.** Provider reference data must not silently overwrite manual research. Save, review and export are explicit actions.

## What works today

The current local implementation includes:

- An anytime market dashboard, searchable/filterable market tables, provider-specific discovery and saved Discovery views.
- Project dossiers with manual research, evidence, team/funding/tokenomics fields, risks, review notes, dated catalysts and explicit provider mappings.
- Named browser-local watchlists, a Buy List project filter, a review-focused Research Desk, a journal and a calendar built from saved research.
- CMC token reference pages, CoinPaprika profiles, optional CoinGecko market/venue data and DexScreener pool lookups.
- Selected macro observations, source-attributed RSS headlines, sentiment, chain TVL, stablecoin supply, revenue and venue-volume panels.
- TradingView chart displays and manually entered position snapshots with covered quotes and unrealized P&L; no exchange account import or transaction ledger.
- A browser-local Research Library for links, notes and screenshots, including project-specific clippings.
- Versioned research exports/imports and optional Supabase-backed project storage. Hosted authentication and row-isolation checks remain deployment-specific verification work.

### Modules and delivery boundaries

“Partial” means a useful slice exists, not that the whole module is complete.

| Module | Current implementation | Planned expansion |
| --- | --- | --- |
| Daily Dashboard | Market, macro, news, sentiment, chain and personal summaries; independently loaded panels | Broader coverage and more connected research context |
| Projects & Narrative Watchlists | Project directory, manual narrative tags, named asset lists and Buy List filter | Cloud list sync, deeper narrative grouping and comparisons |
| Project Research | Structured dossiers, evidence, reviews, catalysts and selected provider reference data | Richer enrichment, canonical relationships and side-by-side comparison |
| Market Structure & Capital Rotation | Dominance, market-cap estimates, ETH/BTC context, BTC-relative returns and index chart displays | Historical rotation analysis and explainable regime classifications |
| Global Markets | Selected FRED equity, dollar, volatility and commodity observations | Wider international markets and permitted price-history feeds |
| Narrative Intelligence | **Design preview** with example narratives | Evidence-backed narrative tracking, comparisons and scoring |
| Attention Intelligence | CoinGecko trending searches, source-specific discovery and saved links | Developer/social/search metrics and explainable mindshare; no live X intelligence today |
| Technical/Setup Intelligence | TradingView display integration and manual research fields | Saved chart plans, owned history, reproducible technical signals and strategy testing |
| Funding/VC & Tokenomics | Manual funding/investor/allocation research; reference supply/FDV and external research links | Structured rounds, investor relationships, vesting and unlock feeds |
| News | Selected publisher and central-bank RSS headlines with source links | Project/narrative tagging, clustering and cited summaries |
| Calendar | Manually recorded project catalysts and external economic-calendar links | Verified economic, listing and unlock feeds |
| Market Cycle | Sentiment, altseason and market-structure context | Evidence-backed cycle frameworks and scenarios |
| Liquidity/Exchange Intelligence | CoinGecko venue listings, DexScreener pools and selected DefiLlama aggregates | CCXT order books, spread/depth comparisons and size-specific estimates |
| Macro/Geopolitical Context | Selected FRED observations and policy RSS | Wider rates/liquidity coverage and sourced geopolitical/regulatory events |
| Research/Conviction | Saved thesis/risk fields, dated reviews, journal and evidence library; standalone Convictions page is a **design preview** | Thesis history, decision/outcome review and cited research assistance |

`/narratives` and `/convictions` use example data from `lib/mock-data.ts` and display a design-preview notice. Their figures and stories are not current research, portfolio results or verified investment performance. Some preview controls are illustrative.

## Data architecture

The intended separation is **sources → normalized data → interpretation → research interface**. The current repository implements these boundaries without pretending every planned directory already exists.

| Layer | Responsibility | Current location/status |
| --- | --- | --- |
| `services/` | Provider adapters, validation, domain contracts, caching, cooldowns and safe API responses | Implemented; `services/server.ts` wires server-only configuration |
| `data/` | Intended shared normalized records, persistent observations and ingestion/storage boundary | **Planned top-level directory.** Today, contracts live in `services/core/types.ts`; schemas/storage helpers live in `lib/`, browser storage and optional Supabase |
| `intelligence/` | Intended explainable narrative, attention, rotation and setup analysis | **Planned top-level directory.** Current feed adapters live in `services/intelligence/`; selected calculations live in `lib/`. This is not a completed inference engine |
| `app/` | Next.js pages and read-only `/api/data/` routes | Implemented; reusable interface and workspace components live in `components/` |

```text
app/                 Pages and API routes
components/          Dashboard, projects, watchlists, library and shared UI
services/            Provider adapters and service runtime
lib/                 Schemas, calculations, identity and storage helpers
supabase/migrations/ Optional private research storage schema and policies
public/brand/        Atlas visual assets
tests/               Fixture-based service and research tests
docs/                Architecture, source coverage, roadmap and requirements
```

Provider responses retain provenance and freshness. Runtime caches, throttles and status are process-local; persistent ingestion, shared caching and deployment-wide request budgets are future work. Missing or unavailable coverage is not replaced with invented live values.

### Storage boundaries

Projects can stay in browser storage or use a configured Supabase account. Named watchlists and the Research Library remain browser-local even when signed in; the library uses IndexedDB. Discovery preferences are local to the browser origin. Research, watchlists and library clippings have separate backup formats. Export each relevant dataset before clearing browser data or changing devices; there is no automatic universal cloud sync.

## Data providers: implemented and planned

Atlas prioritizes public or accessible entry-tier sources. This is an implementation map, not a guarantee of free access, redistribution rights or endpoint entitlement. Verify each provider's current terms and coverage before enabling or deploying an integration.

| Provider | Intended role | Repository status |
| --- | --- | --- |
| CoinMarketCap | Discovery, quotes, token reference details, global metrics, sentiment and altseason | Adapters implemented with a keyless path and optional server key. 4h/12h history is wired but requires appropriate access and live validation |
| CoinPaprika | Wider discovery universe, profiles and personal market quotes | Implemented public-feed adapters |
| CoinGecko | Quotes, global metrics, exchange tickers and trending searches | Demo-key adapters plus a public trending adapter; broader coverage depends on configuration |
| DexScreener | Token pools and reported DEX liquidity/activity | Implemented for explicit chain/contract lookups |
| DefiLlama | Protocol/chain TVL, stablecoins, revenue and covered venue activity | Selected adapters implemented; full flow analysis remains planned |
| FRED | Rates, yields, inflation, employment and selected global-market context | Selected CSV observation series implemented |
| TradingView | Market-structure and token chart displays | External display embeds implemented; not a raw OHLCV API or Atlas-owned drawing store |
| Alternative.me | Bitcoin Fear & Greed history | Implemented |
| RSS / cryptocurrency.cv | News and policy context | Selected CoinDesk, Cointelegraph, Federal Reserve and ECB RSS adapters implemented; cryptocurrency.cv remains planned |
| RootData | Project, team, funding and investor enrichment | Planned; access and endpoint coverage to verify |
| Mobula | Token, on-chain, history and tokenomics coverage | Planned; access and endpoint coverage to verify |
| altFINS | Technical/setup research inputs | Planned; API access to verify |
| Twelve Data | Wider global-market prices and history | Planned; entry-tier suitability to verify |
| GDELT | Geopolitical/news context | Planned |
| GitHub | Repository mappings and development activity | Planned research integration |
| Reddit / Google Trends | Community and search attention where available | Planned; permission, availability and methodology dependent |
| CCXT | Read-only exchange market data and order books | Planned; no exchange credentials or trade execution integration |
| Premium/specialist providers | Deeper on-chain, derivatives, institutional and social data | **Future only:** candidates include Glassnode, Nansen, Messari, Santiment, LunarCrush, CoinGlass and paid provider tiers; no claim of active premium access |

See [Data Sources](docs/DATA-SOURCES.md) for detailed coverage and [Provider Research](docs/PROVIDER-RESEARCH.md) for access notes. Provider metadata or portfolio tags are not independent proof of funding, partnership or endorsement.

## Tech stack

Next.js 13 App Router, React 18, TypeScript, Tailwind CSS, Radix/shadcn-style components, Lucide icons, Recharts, Zod and a server-side provider runtime. Optional Supabase supports authentication and private project documents. Tests use Node's test runner and the installed TypeScript compiler.

The dependency baseline still needs security upgrades before an internet-facing deployment. Existing functionality and successful local checks do not establish production hardening.

## Run locally

Use Node.js with npm. There is currently no pinned Node engine or `.nvmrc`; validate your runtime against the lockfile and installed dependencies.

```sh
npm ci
cp .env.example .env.local
npm run dev -- --hostname 127.0.0.1
```

Open [localhost:3000](http://localhost:3000). For a browser-only workspace, leave both Supabase settings blank. Start with Projects to create a dossier, Markets to explore the available feeds, and Research Desk to review saved work. Empty research states are intentional.

For a local production build:

```sh
npm run build
npm run start -- --hostname 127.0.0.1
```

The build currently downloads Inter and JetBrains Mono through `next/font/google`, so it needs access to Google Fonts. Live provider panels also need network access and can show unavailable, rate-limited or stale states.

### Environment variables

`.env.example` contains names and defaults, with empty credential values. Keep actual values in ignored `.env.local` or your deployment's environment settings. Never commit private research exports, passwords, database credentials or provider keys.

| Variable | Purpose |
| --- | --- |
| `COINGECKO_DEMO_API_KEY` | Optional server-only Demo credential; required for the keyed CoinGecko adapters |
| `CMC_API_KEY` | Optional server-only credential; a key does not by itself grant historical endpoint access |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional browser-visible project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional browser-visible **publishable** key; never a secret/service-role key |
| `ATLAS_*_ENABLED` | Individual source flags listed in `.env.example`; use `true` or `false` |
| `ATLAS_API_TIMEOUT_MS` | Upstream timeout, default 8,000 ms |
| `ATLAS_STALE_TTL_MS` | Additional stale fallback window, default 300,000 ms |
| `ATLAS_CACHE_MAX_ENTRIES` | Process-local cache bound, default 250 |

Never prefix provider secrets with `NEXT_PUBLIC_`: those values are bundled for the browser. Restart after server configuration changes; rebuild when public Supabase settings change. Set both Supabase values or neither. Optional cloud setup, migrations, redirects and live ownership-policy checks are documented in [Supabase Setup](docs/SUPABASE-SETUP.md).

### Validation

```sh
npm run typecheck
npm run lint
node scripts/test-services.cjs
npm run build
```

Automated tests cover normalization, failures, caching, identity, calculations and research/backup contracts using fixtures. They do not certify live provider availability, hosted email delivery or deployed database policies. Lint must run separately because the current Next.js configuration skips it during builds.

## Project status and roadmap

The roadmap records possible improvements as research needs arise, rather than a separate product-launch schedule. The focus is on useful research workflows, preserving saved records and honest data coverage:

1. Validate the storage/recovery foundation and complete identity/evidence conventions.
2. Refine project research, token pages, saved chart plans and daily review workflows.
3. Extend selected macro, catalyst, chain-capital and liquidity slices based on research needs.
4. Add evidence-backed funding, narrative, attention and technical intelligence incrementally.
5. Develop decision review, reproducible strategy testing and cited assistance after the data foundations support them.
6. Add premium data only where verified access and a clear research benefit justify it.

For a quick product tour, start with the [Dashboard Guide](docs/DASHBOARD.md). For implementation and direction, see [Architecture](docs/ARCHITECTURE.md), [Research Workspace](docs/RESEARCH-WORKSPACE.md), [API](docs/API.md), [Roadmap](docs/ROADMAP.md), [Backlog](docs/BACKLOG.md) and [Master Plan](docs/MASTER-PLAN.md). [Planning](docs/PLANNING.md) and [Decisions](docs/DECISIONS.md) explain how scope evolves.

## Disclaimer

Atlas is a research and decision-support tool, not financial advice or a trade-execution system. Validate data, sources and assumptions independently before making decisions.
