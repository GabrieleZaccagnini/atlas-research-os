# Atlas data API

All routes are GET, server-side, dynamic, read-only, with `Cache-Control: no-store` for browser responses. Provider caching is handled inside the service layer. The Projects Markets & Liquidity panel calls these routes on demand, and Data Sources reads status. Legacy preview pages still use example data.

| Route | Input | Result |
|---|---|---|
| `/api/data/market?ids=bitcoin,ethereum` | 1–25 CoinGecko IDs; default BTC/ETH | USD quotes, performance, supply |
| `/api/data/global?provider=auto` | auto, coinmarketcap, coinpaprika or coingecko; legacy default coingecko retained | Global cap/volume/changes/dominance, optional derivatives volume; auto prefers CMC then CoinPaprika |
| `/api/data/exchanges?id=bitcoin&page=1` | required ID, page 1–20 | 100 or fewer venue tickers; explicit pagination |
| `/api/data/dex?chain=ethereum&address=0x...` | required chain/address | returned pools, base price, reserves, liquidity, transactions |
| `/api/data/defi?limit=50` | integer 1–100 | protocols ranked by reported TVL |
| `/api/data/status` | none | process-local status for implemented providers |

Success: `{ ok: true, data, meta: { provider, fetchedAt, expiresAt, cache } }`.
Stale success includes `warning` and keeps the original fetch time. `sourceUpdatedAt`, where available, is the provider's time, not Atlas's fetch time. Successful empty arrays mean no returned results; they are not provider failures.
Failure: `{ ok: false, data: null, provider, error: { code, message, retryAt? } }`.
Input/internal errors may omit provider. HTTP codes: 400 invalid input, 429 cooldown, 502 upstream/network/schema error, 503 disabled/missing key, 504 timeout, 500 local/configuration error. Stale fallback is HTTP 200 with explicit warning. Retry-After accompanies cooldown responses.

Copy `.env.example` to `.env.local` if needed. Set `COINGECKO_DEMO_API_KEY` to enable its requests. Never expose it via `NEXT_PUBLIC_`. DexScreener/DefiLlama need no keys for this slice. Disable providers individually with the documented flags. Restart the server after config changes.

Example local checks:

```sh
curl 'http://localhost:3000/api/data/status'
curl 'http://localhost:3000/api/data/defi?limit=5'
curl 'http://localhost:3000/api/data/dex?chain=ethereum&address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
curl 'http://localhost:3000/api/data/market?ids=bitcoin,ethereum'
```

Future UI work must surface source attribution, loading/error states and stale timestamps. Attribution references: [CoinGecko](https://www.coingecko.com/en/api), [DexScreener](https://dexscreener.com), [DefiLlama](https://defillama.com).

## News, macro and CMC indices — 2026-09-28

`GET /api/data/intelligence?feed=news&source=coindesk|cointelegraph|federalreserve|ecb` returns safe title/link/source/publication-time/category records. Feed fetches are separate; no caller-supplied URLs or full articles.

`GET /api/data/intelligence?feed=cmcSentiment` returns CMC Crypto Fear & Greed (`value`, `label`, `observedAt`). `feed=altseason` returns CMC Altcoin Season (`value`, `observedAt`, nullable `yearlyHigh`/`yearlyLow`). These are different from Alternative.me (`feed=sentiment`).

`feed=macro&series=ID` supports the allowlisted histories in services/intelligence/types.ts, including PCEPI, PCEPILFE, CPIAUCSL, UNRATE, DFII10, DCOILBRENTEU and DHHNGSP. Original reference dates/units are retained; no consensus or release-calendar data is inferred.

CMC defaults to official `/public-api` requests with no key. Optional `CMC_API_KEY` selects authenticated paths and a server-only header. `ATLAS_CMC_ENABLED=false` disables CMC; `provider=auto` then lazily falls back to a complete CoinPaprika snapshot with a visible warning. Responses never combine global fields from different sources. CMC global cache is ten minutes; indices fifteen minutes. RSS crypto caches five minutes; Fed/ECB thirty minutes. FRED caches one hour. No paid plan is enabled.


## CMC discovery and reference metadata — D-016

`GET /api/data/assets?provider=coinmarketcap` returns up to 100 CMC-ranked USD MarketQuote records from /v3/cryptocurrency/listings/latest (start=1, limit=100, sort=market_cap); five-minute cache. Default `provider=coinpaprika` keeps the existing wider dataset and personal quote contract. Optional 1h/30d price changes are retained alongside supply/FDV and quote timestamps. Provider-specific IDs are kept separate. Movers are local subsets of the fetched universe, not a market-wide screener.

`GET /api/data/cmc-profile?id=1027` returns CmcProfile from /v2/cryptocurrency/info by one positive numeric ID, with a 24-hour cache. Invalid IDs/provider query values return 400 before upstream requests. A mismatching returned ID fails validation. Description, approved HTTP(S) credential-free links, classification tags, and CMC listing date are reference fields; the listing date is not launch date and tags are not verified investors. Metadata fetches occur only when the CMC detail card is opened. No research is saved or migrated.


## Optional CMC short-window history — D-017

GET /api/data/cmc-performance accepts no arbitrary asset/time parameters. Without a server-only CMC_API_KEY it returns missing_key (503) before making any upstream request. With a key, it uses the fixed top-100 listings and one /v3/cryptocurrency/quotes/historical call, USD, interval=4h, count=4 and a shared five-minute anchor/cache. At most 400 historical points per request; configured account quotas still apply. Rows preserve actual historical timestamps; absent assets/windows, zero baselines, ambiguous currency, wrong IDs and timing gaps do not become valid returns. Baselines must align within five minutes of each 4h/12h target, and historical end/listing timestamps must align before the table displays a value. Keyless historical access returned 403 during verification. Authenticated access is tested with fixtures only until a user-configured key succeeds.


### Discovery feeds — D-018

GET /api/data/discovery?source=coingecko|coinmarketcap|coinpaprika&kind=trending|most-visited|new. Defaults: coingecko/trending. Invalid enums return 400. Available combinations: coingecko/trending, coinmarketcap/new, coinpaprika/new. Other combinations return 503 with typed disabled/access reason and no external request. Successful ServiceResult data contains items and total; rows retain exact source IDs, safe links, optional rank/price/24h change/addedAt/active. Unknown fields are null. Fixed bounded requests use 15-minute runtime caching/coalescing/status. CoinGecko reuses the same cache as existing trending. No user-supplied URLs, arbitrary pagination or symbol joins.
