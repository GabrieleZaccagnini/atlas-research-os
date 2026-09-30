# Research workspace — first usable slice

## Available

- `/projects`: create a project; search by name, ticker or narrative; filter by status and narrative.
- `/projects/[id]`: edit identity, narrative tags, status, conviction, thesis, fundamentals, risks, invalidation, notes, capital structure and catalysts. Save explicitly.
- `/watchlists`: named browser-local asset lists plus the existing Watching research-project view. `/buy-list` remains a filtered project view; `/research` is the Research Desk.
- Markets & Liquidity: load CoinGecko quotes/listings and DexScreener pools through the existing normalized services. No auto-polling. Requires a saved provider ID or chain/address mapping.
- `/data-sources`: observed provider status and the complete candidate data-source map.
- Grouped navigation, working project search, mobile navigation, and explicit preview banners on remaining mock-data pages.

## Persistence

Projects are validated, versioned JSON in localStorage under `atlas.research.projects.v1`. The directory starts empty. No mock holdings, conviction or market figures are copied into personal records. Exports are JSON backups; imports merge new IDs and retain existing records. Storage errors are surfaced, not silently discarded. Input/schema validation rejects incompatible backups before writing. Backups are unencrypted, so keep them private.

Browser mode is local to the device/browser/origin and does not sync. Signed-in cloud mode is described below. Clearing browser data removes local records. Export regularly. Individual notes can contain source links but are plain text, never executed or rendered as HTML. Concurrent edits to the same project are not collaboratively merged; conflicting edits should be resolved before saving. Drafts are not persisted until Save research is selected.

## Daily-desk additions — 2026-09-28

- `/`: real CoinPaprika global/asset snapshots, discovery, watch actions, research focus and upcoming manual catalysts. See MORNING-RESEARCH.md.
- Projects: select an exact market asset, load/apply/save its provider profile separately from your manual notes; record a next action/date and dated review. Latest 100 reviews retained per project.
- `/journal`: saved review history/search/export. `/calendar`: saved project catalysts with source links and calendar-day dates. These are not automated news feeds.
- Version 3 adds profiles/reviews/events without losing legacy fields. Review/event drafts survive section switching but must be explicitly saved before closing/reloading.
- With cloud configured, signed-out users may explicitly choose Continue in this browser. Signing in opens a separate cloud workspace; no automatic transfer occurs.

## Structured research foundation

Overview now includes official links. Research includes team and leadership records. Capital & Tokenomics includes repeatable funding/sale records and dated tokenomics observations. Existing freeform notes remain intact.

Every entry carries a source URL, review date, manual review status and uncertainty notes. Verified requires a source and date; this is the user's review, not automated validation by Atlas. URL fields accept HTTP(S) only, without embedded credentials. Amounts and sale prices use nonnegative decimal strings so blank/unknown and zero remain distinct without floating-point rounding. A funding record's currency applies to both its amount raised and per-token price. Tokenomics observations are descriptive research, not live provider metrics or inputs to automatic valuation.

Backups now write version 3 and accept versions 1 and 2. The browser storage key remains `atlas.research.projects.v1` so existing records are found. Reading a legacy record adds empty structured collections in memory; storage is only updated by an explicit save or import. Raw stored data is retained on read failure and remains exportable. Future unsupported backup versions are rejected. Cloud persistence and on-demand CoinPaprika profile references now exist; broader enrichment remains planned.

## Optional cloud mode

Supabase sign-in and cloud persistence are implemented behind explicit public configuration. Without it, browser mode remains available. Account & Storage offers sign-in, reload, exports and an insert-only browser migration. Hosted setup and live database checks are complete; signed-in browser verification remains outstanding; see [SUPABASE-SETUP.md](SUPABASE-SETUP.md).

## Dashboard and positions update

The homepage is now the anytime market overview; the former research workflow is available at `/research`. In `/portfolio`, select a saved mapped project, enter quantity and optional average cost in USD, then save. Position snapshots use the existing storage mode and conflict checks. They are included in version 4 exports; versions 1–3 remain importable and do not fabricate quantities. Quantities are manual and no CMC/exchange account is connected. A value subtotal clearly identifies incomplete price coverage. Signed-in browser verification remains outstanding; no new database/auth migration was required.


## Named watchlists — D-019

Create and rename lists at `/watchlists`, add exact assets from market tables, Discovery feeds or CMC reference details, or paste names/tickers/provider IDs (one per line or comma-separated). Preview resolves ambiguity explicitly; an unknown entry is skipped. Coverage is the current CMC top-100, CoinPaprika snapshot and CoinGecko trending catalog. The same ticker across providers is not automatically merged.

Each entry has an independent research status and note. Archive/restore assets or lists; there is no permanent-delete action. Choose a list for the dashboard. Sort, search, status filters, numeric ranges and a separate persisted column picker operate on the available provider snapshot. Quotes outside that coverage remain blank. Watchlists do not load 4h/12h history or numeric sentiment/mindshare.

Named lists are stored under `atlas.watchlists.v1:<workspace scope>` on this browser origin. Signed-in account IDs separate local scopes but do not enable cloud sync. Existing project documents, manual positions and version 4 research backups are unchanged. Named lists have their own version 1 JSON backup/restore. Restore inserts new list IDs, retains existing lists and notes, and renames colliding active names. A corrupt stored file is retained and can be exported; writes stay disabled. Revision checks and entry timestamps reject stale edits while retaining the note draft. Use Backup lists regularly; switching browsers/origins does not carry these records.

Pasting a CMC watchlist's token names is a manual mapping workflow, not access to a CMC account or portfolio. Direct account sync, curated CMC watchlists, saved filter presets, automatic cross-provider mapping and chart libraries remain separate work.

## Research Library — D-021

Use `/library` for general crypto, macro and investing posts, articles, notes and screenshots, or the Library tab within any project to attach a clipping to that project. Each item has a title, optional source link (required for link items), personal note, topic and tags. Upload or paste an image (PNG/JPEG/WebP/GIF, at most 5 MB); search and filter saved items, edit or delete them, and open source links or full-size screenshots. No social/article text is automatically imported or treated as verified evidence.

The library uses browser IndexedDB, separated by signed-in account ID or browser workspace. It does not sync across devices or form part of the existing project/cloud backup. Use **Backup library** to download a JSON file that includes screenshots, and **Restore backup** to insert new IDs without replacing existing clippings. Backups contain private research and unencrypted image data. Browser storage limits or clearing site data can remove local copies, so export regularly. Secure cloud attachment storage and project chart-plan integration remain future work.
