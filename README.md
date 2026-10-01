# Atlas — Crypto Research Operating System

**A personal workspace for researching crypto markets and developing investment theses.**

I’m building Atlas around the investing approach I’ve developed since entering crypto in 2017. It connects project fundamentals, market context and my own analysis, keeping the evidence behind an idea close to the reasoning behind a decision.

The aim is to spend less time piecing together information from scattered sources and more time assessing opportunities, challenging assumptions and knowing what deserves another look.

**Discover → investigate → build a thesis → monitor → record decisions → review.**

> **Status: personal work in progress.** Atlas evolves with my research needs. Working features, design previews and planned additions are distinguished below; data coverage and freshness depend on the source.

## How Atlas Supports Research

Atlas supports the work around a decision, from finding an idea to reviewing the thesis. The current workflow helps me:

- **Establish market context.** Bring market structure, macro observations, sentiment, news and on-chain activity into one overview before investigating individual opportunities.
- **Find and organize ideas.** Explore market tables and provider-specific discovery feeds, filter the available data, and keep candidates in named watchlists with research statuses and notes.
- **Investigate a project.** Build a dossier covering the team, fundamentals, funding, tokenomics, risks and catalysts. Combine selected provider reference data with manual research, and keep supporting links, notes and screenshots in the Research Library.
- **Turn research into a thesis.** Record the investment case, conviction and invalidation criteria. Use charts to examine price structure and, for supported markets, save project-linked chart plans with levels, annotations and scenario notes.
- **Keep track of what deserves attention.** Record next actions and review dates, follow saved project catalysts alongside selected official economic schedules, and revisit candidates through the Research Desk.
- **Review the reasoning.** Keep dated reviews and journal entries so earlier conclusions can be reconsidered as evidence changes. Manually entered position snapshots provide portfolio context without connecting an exchange account.

Atlas organizes evidence and research; evaluating sources, comparing scenarios and making decisions remain the researcher's responsibility. The philosophy below guides the work, while the implementation table distinguishes available tools from future ideas.

## Research Philosophy

- **Probabilities, not predictions.** Markets offer no certain future. Research improves the odds by comparing scenarios with incomplete information. As in poker, a sound decision can still lose through variance; outcomes alone do not establish decision quality.

- **Four pillars, one process.** Fundamental Analysis, Technical Analysis, Market Sentiment and Self Analysis inform each other. Investing and trading require judgment beyond blindly following indicators. Day traders, swing traders and long-term investors need different information, shaped by their objectives, time horizons and risk tolerance.

- **Zoom out before zooming in.** Daily, weekly and monthly context—and especially the broader market cycle—matter more than lower-timeframe noise. Liquidity, macro conditions and narratives help frame capital flows. Reactions to news can reveal regime: bearish news may have little lasting impact in strong bull markets, while good news may fail to sustain bear-market rallies. Historical cycles offer context, not laws; history can rhyme without repeating.

- **“Chart is truth,” within its limits.** Price action expresses collective psychology and supply and demand: fear, greed, euphoria and pain. Charts belong alongside fundamentals, not in isolation. Technical analysis stays simple: horizontal support/resistance, emotionally significant price areas, trendline breaks, 7/30/200 moving averages, volume and higher timeframes.

- **Price is not value.** A high-conviction opportunity can emerge when fundamental value appears misaligned with market price and technical structure supports the thesis. A good project is not automatically a good investment: valuation, timing, liquidity, tokenomics, unlocks, market structure and cycle context all matter. Belief in a project or narrative can remain strong while its current price offers poor risk/reward.

- **Investigate before committing.** The research path runs roughly from market data and a project page → official website/docs → team, investors and backers → social/community activity → seed/private/public sale prices → supply, tokenomics, unlocks, fully diluted valuation (FDV) and liquidity → exchange access → comparable projects and market-cap context → technical structure → thesis, risks, catalysts and invalidation. Technology, utility and adoption potential are assessed throughout, alongside sentiment and cycle context. Risk flags are weighed together; one flag does not automatically reject a project.

- **Conviction requires discipline.** Research builds conviction, but never replaces risk management. Every thesis needs evidence, a competing explanation and explicit invalidation criteria. Actively challenge assumptions, revisit conclusions as evidence changes and distinguish a deteriorating thesis from an uncomfortable price move.

- **Self Analysis is part of the work.** Monitor fear, greed, FOMO, overconfidence, attachment and confirmation bias. Emotion is a cue to pause and reassess the evidence and risk framework, not a standalone buy or sell rule.

- **“Trade less, profit more” is a reminder to be patient, not a promise.** Often the best action is doing nothing. Research creates comfort in waiting; let the market come to the thesis rather than forcing a desired outcome. Favor a few well-researched, strong-conviction opportunities over spreading attention and capital too thin, while respecting concentration risk and opportunity cost.

- **Plan participation without assuming precision.** Scaling into and out of positions leaves room for uncertainty and for trends to continue, rather than assuming exact tops or bottoms. Momentum setups can be valid when supported by structure, volume, conviction and risk management; social-media or headline excitement after a large move is not enough.

- **Allow price discovery.** Buying immediately at launch is not the default. Hype, pump-and-dump dynamics, early-investor selling and liquidity pressure warrant patience unless a researched thesis strongly justifies participating earlier.

- **Explore long-term theses without treating them as certainties.** One example is the possible convergence of AI agents, machines and robots with tokenization and on-chain infrastructure, including needs around identity, payments, data, coordination, compute, storage, energy and privacy. It remains a thesis to test against adoption, economics, valuation and competing approaches.

- **Survive first, then thrive.** Atlas is intended to separate signal from noise and help users form their own thesis and risk framework. The aim is informed, revisable judgment and the ability to keep participating through uncertainty—not prescribed trades or guaranteed outcomes.

## Current implementation and planned work

The table describes the current local implementation. Available features may still have limited market coverage or require provider configuration; planned work is not a commitment to a release date. Saved Atlas chart plans, Binance candle snapshots and BEA/FOMC calendar feeds currently exist in local development and are not yet included in the published code.

| Module | Current implementation | Planned expansion |
| --- | --- | --- |
| Daily Dashboard | Market, macro, news, sentiment, chain and personal summaries; independently loaded panels | Broader coverage and more connected research context |
| Projects & Narrative Watchlists | Project directory, manual narrative tags, named asset lists and Buy List filter | Cloud list sync, deeper narrative grouping and comparisons |
| Project Research | Structured dossiers, evidence, reviews, catalysts and selected provider reference data | Richer enrichment, canonical relationships and side-by-side comparison |
| Market Structure & Capital Rotation | Dominance, market-cap estimates, ETH/BTC context, BTC-relative returns and index chart displays | Historical rotation analysis and explainable regime classifications |
| Global Markets | Selected FRED equity, dollar, volatility and commodity observations | Wider international markets and permitted price-history feeds |
| Narrative Intelligence | **Design preview** with example narratives | Evidence-backed narrative tracking, comparisons and scoring |
| Attention Intelligence | CoinGecko trending searches, source-specific discovery and saved links | Developer/social/search metrics and explainable mindshare; no live X intelligence today |
| Technical/Setup Intelligence | TradingView displays and browser-local chart plans with candle snapshots, levels, trends, annotations and thesis/invalidation notes | Broader chart coverage, persistent price history, reproducible signals and strategy testing |
| Funding/VC & Tokenomics | Manual funding/investor/allocation research; reference supply/FDV and external research links | Provider-enriched funding rounds, investor relationships, vesting and unlock feeds |
| News | Selected publisher and central-bank RSS headlines with source links | Project/narrative tagging, clustering and cited summaries |
| Calendar | Saved project catalysts, selected official BEA release dates and FOMC meeting schedules; BLS calendar link | Broader economic coverage, crypto listing/unlock feeds, consensus/actuals and alerts |
| Market Cycle | Sentiment, altseason and market-structure context | Evidence-backed cycle frameworks and scenarios |
| Liquidity/Exchange Intelligence | CoinGecko venue listings, DexScreener pools and selected DefiLlama aggregates | CCXT order books, spread/depth comparisons and size-specific estimates |
| Macro/Geopolitical Context | Selected FRED observations and policy RSS | Wider rates/liquidity coverage and sourced geopolitical/regulatory events |
| Research/Conviction | Saved thesis/risk fields, dated reviews, journal and evidence library; standalone Convictions page is a **design preview** | Structured thesis history, deeper decision/outcome analysis and cited research assistance |
| Portfolio | Manual quantities and average costs with covered quotes and unrealized P&L | Broader portfolio analysis; no exchange account import or transaction ledger today |
| Research Library | Browser-local links, notes and screenshots, optionally attached to projects | Cloud attachment storage and deeper connections to research workflows |

Atlas chart plans currently cover seven Binance spot USDT pairs on 1h/4h/1d/1w timeframes, showing the latest 120 candles from a bounded snapshot. They support SMA 50/200, EMA 50 and RSI 14; the 7/30/200 moving averages in the philosophy describe the preferred research approach, not the current built-in indicator set. Plans refresh explicitly and do not yet support pan/zoom. TradingView drawings are temporary and separate from saved Atlas plans.

`/narratives` and `/convictions` use example data from `lib/mock-data.ts` and display a design-preview notice. Their figures and stories are not current research, portfolio results or verified investment performance. Some preview controls are illustrative.

## Data architecture

The intended flow is **sources → normalized data → interpretation → research interface**. Provider adapters in `services/` validate and normalize responses; helpers in `lib/` handle research records, calculations and storage; pages and components present the results.

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

Provider responses retain source and freshness details. Explicit provider IDs avoid matching unrelated assets by ticker, and missing values stay distinct from zero. Runtime caches, throttles and status are process-local; persistent ingestion, shared caching and deployment-wide request budgets remain future work. Planned top-level `data/` and `intelligence/` layers are described in [Architecture](docs/ARCHITECTURE.md).

### Storage boundaries

Project research and manual position snapshots can stay in browser storage or use a configured Supabase account. Named watchlists, the Research Library and chart plans remain browser-local even when signed in; the library uses IndexedDB. Discovery preferences are also local to the browser origin. Project research, watchlists, library clippings and chart plans have separate backups. Export each relevant dataset before clearing browser data or changing devices; there is no universal cloud sync. Provider references are applied explicitly and do not silently replace manual conclusions. Hosted sign-in and access isolation require deployment-specific verification; see [Supabase Setup](docs/SUPABASE-SETUP.md).

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
| TradingView | Market-structure and token chart displays | External embeds; drawings here are temporary |
| Binance public market data | Candle snapshots for Atlas chart plans | Seven explicit spot USDT pairs; 1h/4h/1d/1w; no exchange account connection |
| BEA / Federal Reserve | Economic release and policy schedules | Selected GDP, PCE/income and trade release dates plus FOMC meeting dates; no consensus or actual values |
| Alternative.me | Bitcoin Fear & Greed history | Implemented |
| RSS / cryptocurrency.cv | News and policy context | Selected CoinDesk, Cointelegraph, Federal Reserve and ECB RSS adapters implemented; cryptocurrency.cv remains planned |

Planned sources include RootData and Mobula for project enrichment, altFINS for technical inputs, Twelve Data for global markets, GDELT for news context, GitHub/Reddit/Google Trends for development and attention, and CCXT for read-only exchange data. Specialist on-chain, derivatives and social providers remain future options. Access, coverage and research value must be verified before integration.

See [Data Sources](docs/DATA-SOURCES.md) for detailed coverage and [Provider Research](docs/PROVIDER-RESEARCH.md) for access notes. Provider metadata or portfolio tags are not independent proof of funding, partnership or endorsement.

## Tech stack

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Radix/shadcn-style components, Lucide icons, Recharts, Zod and a server-side provider runtime. Optional Supabase supports authentication and private project documents. Tests use Node's test runner and the installed TypeScript compiler.

The dependency baseline was refreshed on 2026-10-01 and the locked dependency tree passed `npm audit` with zero known vulnerabilities at that time. Recheck advisories before deployment; passing dependency and local checks does not establish production hardening. See [Dependency Maintenance](docs/DEPENDENCY-MAINTENANCE.md).

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

## Development direction

Development follows research needs. The main areas for further work are:

1. Strengthen storage recovery, deployment verification and identity/evidence conventions.
2. Refine project research, token pages, saved chart plans and daily review workflows.
3. Extend selected macro, catalyst, chain-capital and liquidity slices based on research needs.
4. Add evidence-backed funding, narrative, attention and technical intelligence incrementally.
5. Develop decision review, reproducible strategy testing and cited assistance after the data foundations support them.
6. Add premium data only where verified access and a clear research benefit justify it.

For a quick product tour, start with the [Dashboard Guide](docs/DASHBOARD.md). For implementation and direction, see [Architecture](docs/ARCHITECTURE.md), [Research Workspace](docs/RESEARCH-WORKSPACE.md), [API](docs/API.md), [Roadmap](docs/ROADMAP.md), [Backlog](docs/BACKLOG.md) and [Master Plan](docs/MASTER-PLAN.md). [Planning](docs/PLANNING.md) and [Decisions](docs/DECISIONS.md) explain how scope evolves.

## Disclaimer

Atlas is a research and decision-support tool, not financial advice or a trade-execution system. Validate data, sources and assumptions independently before making decisions.
