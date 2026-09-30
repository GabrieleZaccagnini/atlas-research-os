import test from 'node:test';
import assert from 'node:assert/strict';
import { appendDiscoveryView, discoveryPreset, parseDiscoveryViews, discoverySettingsSchema } from '../lib/discovery-views';
import { filterMarketRows, type MarketRow } from '../lib/market-dashboard';
const id='12345678-1234-4123-8123-123456789012';
test('saved Discovery views round-trip provider/columns/signed ranges and reject unsafe or conflicting settings',()=>{
  const settings=discoveryPreset('pullbacks','coinpaprika')!;
  const next=appendDiscoveryView(null,null,{id,name:'My pullbacks',settings});
  assert.deepEqual(parseDiscoveryViews(JSON.stringify(next)),next);
  assert.equal(next.views[0].settings.provider,'coinpaprika');
  assert.throws(()=>appendDiscoveryView(JSON.stringify(next),null,{id,name:'Other',settings}),/another tab/);
  assert.throws(()=>appendDiscoveryView(JSON.stringify(next),JSON.stringify(next),{id,name:'Other',settings}));
  assert.throws(()=>parseDiscoveryViews('{bad')); assert.throws(()=>parseDiscoveryViews(JSON.stringify({...next,version:2})));
  for(const patch of [{provider:'other'},{sort:'sentiment'},{columns:['price','price']},{ranges:[{metric:'price',min:'5',max:'1'}]},{ranges:[{metric:'mindshare',min:'1',max:''}]},{minVolume:-1},{query:'x'.repeat(201)}]) assert.equal(discoverySettingsSchema.safeParse({...settings,...patch}).success,false);
});
test('Discovery presets select only their stated ranges/volume and exclude missing data',()=>{
  const row=(name:string,volume:number|null,day:number,week:number|null,btc:number|null)=>({name,volume24h:volume,marketCap:1e9,change24hPercent:day,change7dPercent:week,change24hBtcPercent:btc} as MarketRow);
  const rows=[row('Weekly pullback',2e7,-2,10,2),row('Gainer',3e7,8,5,4),row('Thin gainer',9e6,9,5,5),row('Unknown volume',null,9,5,5),row('Unknown BTC',2e7,8,null,null)];
  const run=(id:string)=>{const p=discoveryPreset(id,'coinmarketcap')!;return filterMarketRows(rows,p.minCap,p.minVolume,p.sort,p.descending,p.ranges).map(r=>r.name);};
  assert.deepEqual(run('pullbacks'),['Weekly pullback']);
  assert.deepEqual(run('btc'),['Gainer','Weekly pullback']);
  assert.deepEqual(run('gainers'),['Gainer','Unknown BTC']);
  assert.equal(discoveryPreset('missing','coinpaprika'),null);
  for(const preset of ['btc','pullbacks','gainers']) assert.equal(discoveryPreset(preset,'coinmarketcap')!.columns.some(c=>c==='change4hPercent'||c==='change12hPercent'),false);
});
