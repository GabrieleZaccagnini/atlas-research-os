# Atlas service foundation

The existing Bolt UI, routes, mock data, and styling remain unchanged. New GET routes under `/api/data/` provide an opt-in path to live data. Pages still display demo data until a separate UI migration explicitly connects them.

## Boundaries

`UI → API route → domain service → provider adapter → shared runtime → upstream`

- `services/server.ts` is the server-only composition root. It alone reads environment variables and wires adapters into domain contracts. Never import it into a client component.
- `services/{market,exchanges,dex,defi}/index.ts` validate inputs and define provider-independent contracts. Adapters normalize upstream JSON using Zod.
- `services/core/types.ts` contains shared normalized types and result/error envelopes, separate from existing UI types in `lib/types.ts`. Unknown numeric values remain null. Prices explicitly identify units and token side.
- `services/core/runtime.ts` supplies timeout/abort, fixed provider origins, header-only credentials, safe errors, request coalescing, local throttling and 429 cooldown. No retries multiply quota use.
- `services/core/cache.ts` defines an asynchronous replaceable cache interface and a bounded in-memory implementation. Fresh TTLs: quotes 60s, global/listings 120s, pools 30s, TVL 300s. Stale fallback lasts an additional configurable 300s, only after a failed refresh and always labeled with a warning and original timestamps. Disabled providers never return cached data.
- `services/catalog.ts` records the complete candidate source map, separately from implemented capabilities. Planned providers do not report healthy or connected. Provider access tiers must be checked when implementing each endpoint.
- `services/liquidity` handles normalized liquidity calculations. Future scoring/interpretation belongs in a separate intelligence layer. No execution or slippage claims are derived from pool TVL.

## Operations and limitations

Status reflects observed upstream requests in the current process, not synthetic health checks. Cache hits do not make a failed provider healthy. Idle means untested; missing key and disabled are distinct states. Config changes require a process restart. API status never exposes keys, raw upstream errors or request URLs.

Cache, cooldown, request coalescing, and status are process-local. Serverless instances can differ and process restarts clear them. Before a multi-user deployment, add authentication/request budgets and shared caching/rate limiting. These read-only endpoints have bounded inputs but are not a global abuse-prevention system. Keep provider URLs fixed; do not accept arbitrary upstream URLs.

CoinGecko queries use CoinGecko IDs, not ticker symbols. DEX queries use a chain/address tuple, preserving address case. Exchange listings are one explicit page (100 upstream tickers); mayHaveMore is a hint, not proof of complete coverage. Venue type remains unknown until an authoritative mapping exists. Pool prices are for the returned base token. Pools and reported volume may overlap across feeds; do not add CEX and DEX totals blindly.

## Extending safely

Implement a narrow domain contract, add a provider adapter with runtime validation, wire it into the server composition root, and add fixtures for success/missing fields/failure. Use provider-specific IDs with an explicit cross-provider identity map. Fallback providers must return the same normalized contract and preserve provenance; this first slice uses bounded stale cache fallback, not automatic cross-provider fallback. Manual data must be explicitly labeled, never substituted as live data.

Run `npm run typecheck`, `npm run lint`, `node scripts/test-services.cjs`, and `npm run build`. Tests use the existing TypeScript dependency and Node test runner, with no external API calls or new dependencies.
