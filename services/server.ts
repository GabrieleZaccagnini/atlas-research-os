import 'server-only';
import { readConfig } from './core/config';
import { ProviderRuntime } from './core/runtime';
import { createMarketService } from './market';
import { coinGeckoMarket } from './market/coingecko';
import { createExchangeService } from './exchanges';
import { coinGeckoExchanges } from './exchanges/coingecko';
import { createDexService } from './dex';
import { dexScreener } from './dex/dexscreener';
import { createDefiService } from './defi';
import { defiLlama } from './defi/defillama';
function createServices() {
  const runtime = new ProviderRuntime(readConfig(process.env));
  return { market: createMarketService(coinGeckoMarket(runtime)), exchanges: createExchangeService(coinGeckoExchanges(runtime)),
    dex: createDexService(dexScreener(runtime)), defi: createDefiService(defiLlama(runtime)), status: () => runtime.status() };
}
// Process-local only; separate instances/serverless workers have separate caches and status.
const state = globalThis as typeof globalThis & { atlasServices?: ReturnType<typeof createServices> };
export function getServices() { return state.atlasServices ??= createServices(); }
