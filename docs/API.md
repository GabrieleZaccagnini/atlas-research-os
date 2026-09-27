# Atlas data API

All routes are GET, server-side, dynamic, read-only, with `Cache-Control: no-store` for browser responses. Provider caching is handled inside the service layer. The Projects Markets & Liquidity panel calls these routes on demand, and Data Sources reads status. Legacy preview pages still use example data.

| Route | Input | Result |
|---|---|---|
| `/api/data/market?ids=bitcoin,ethereum` | 1–25 CoinGecko IDs; default BTC/ETH | USD quotes, performance, supply |
| `/api/data/global` | none | USD cap/volume, BTC/ETH dominance |
| `/api/data/exchanges?id=bitcoin&page=1` | required ID, page 1–20 | 100 or fewer venue tickers; explicit pagination |
| `/api/data/dex?chain=ethereum&address=0x...` | required chain/address | returned pools, base price, reserves, liquidity, transactions |
| `/api/data/defi?limit=50` | integer 1–100 | protocols ranked by reported TVL |
| `/api/data/status` | none | process-local status for the three implemented providers |

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
