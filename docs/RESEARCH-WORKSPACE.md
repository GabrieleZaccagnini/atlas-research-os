# Research workspace — first usable slice

## Available

- `/projects`: create a project; search by name, ticker or narrative; filter by status and narrative.
- `/projects/[id]`: edit identity, narrative tags, status, conviction, thesis, fundamentals, risks, invalidation, notes, capital structure and catalysts. Save explicitly.
- `/watchlists` and `/buy-list`: filtered views over the same project records. `/research` remains a directory alias.
- Markets & Liquidity: load CoinGecko quotes/listings and DexScreener pools through the existing normalized services. No auto-polling. Requires a saved provider ID or chain/address mapping.
- `/data-sources`: observed provider status and the complete candidate data-source map.
- Grouped navigation, working project search, mobile navigation, and explicit preview banners on remaining mock-data pages.

## Persistence

Projects are validated, versioned JSON in localStorage under `atlas.research.projects.v1`. The directory starts empty. No mock holdings, conviction or market figures are copied into personal records. Exports are JSON backups; imports merge new IDs and retain existing records. Storage errors are surfaced, not silently discarded. Input/schema validation rejects incompatible backups before writing. Backups are unencrypted, so keep them private.

This is personal browser storage, not a database, account or multi-device sync. Clearing browser data removes local records. Export regularly. Individual notes can contain source links but are plain text, never executed or rendered as HTML. Concurrent edits to the same project are not collaboratively merged; conflicting edits should be resolved before saving. Drafts are not persisted until Save research is selected.

## Next slices

1. Durable authenticated storage and migration/import from browser backups.
2. Live dashboard and narrative rollups based on this shared project universe.
3. Charts, structured funding/unlocks, news/event feeds, and CEX depth.
4. Replace remaining preview pages one at a time; keep unsupported data unavailable rather than fabricated.

No dependency or provider credentials added in this slice.
