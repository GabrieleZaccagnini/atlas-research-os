import test from 'node:test';
import assert from 'node:assert/strict';
import { addWatchAssets, assetKey, emptyWatchlists, makeWatchlist, mergeWatchlistBackup, parseWatchlists, restoreWatchlist, pasteTokens, previewWatchImport, updateWatchlists, watchAssetSchema, watchCatalog, watchlistFileSchema, watchlistStorageKey, watchRows, type WatchAsset, type WatchlistFile } from '../lib/watchlists';
import { filterMarketRows } from '../lib/market-dashboard';
import type { MarketQuote } from '../services/core/types';
const now = '2026-09-29T08:00:00.000Z'; const later = '2026-09-29T09:00:00.000Z';
const listId = '12345678-1234-4123-8123-123456789012'; const secondId = '12345678-1234-4123-8123-123456789013';
const cmc: WatchAsset = { provider:'coinmarketcap',id:'1',name:'Bitcoin',symbol:'BTC' };
const paprika: WatchAsset = { provider:'coinpaprika',id:'btc-bitcoin',name:'Bitcoin',symbol:'BTC' };
const coin = (asset: MarketQuote['asset'], price: number | null, change = 10): MarketQuote => ({ asset,name:'Bitcoin',symbol:'BTC',currency:'USD',price,marketCap:1,fdv:null,volume24h:0,rank:1,change24hPercent:change,change1hPercent:change,change7dPercent:null,circulatingSupply:null,totalSupply:null,maxSupply:null,sourceUpdatedAt:now });
const saved = (): WatchlistFile => ({ ...emptyWatchlists(),selectedId:listId,lists:[addWatchAssets(makeWatchlist('Core',listId,now),[cmc],now)] });
test('watchlist backups enforce exact provider identities, uniqueness, bounds and active selection', () => {
  const file = saved(); assert.deepEqual(parseWatchlists(JSON.stringify(file)),file); assert.deepEqual(parseWatchlists(null),emptyWatchlists());
  for (const id of ['../x','0','01','1?x','javascript:']) assert.equal(watchAssetSchema.safeParse({...cmc,id}).success,false);
  assert.equal(watchAssetSchema.safeParse({...paprika,id:'../x'}).success,false);
  assert.equal(watchlistFileSchema.safeParse({...file,lists:[...file.lists,file.lists[0]]}).success,false);
  assert.equal(watchlistFileSchema.safeParse({...file,lists:[file.lists[0],{...file.lists[0],id:secondId,name:' core '}]}).success,false);
  assert.equal(watchlistFileSchema.safeParse({...file,selectedId:secondId}).success,false);
  assert.equal(watchlistFileSchema.safeParse({...file,lists:[{...file.lists[0],entries:[...file.lists[0].entries,file.lists[0].entries[0]]}]}).success,false);
  assert.equal(watchlistFileSchema.safeParse({...file,lists:[{...file.lists[0],entries:[{...file.lists[0].entries[0],notes:'x'.repeat(20001)}]}]}).success,false);
  assert.equal(watchlistStorageKey('browser') === watchlistStorageKey('account-one'),false);
  assert.notEqual(watchlistStorageKey('account-one'),watchlistStorageKey('account-two'));
});
test('repeated watch additions preserve notes/status and archived assets restore without merging tickers', () => {
  const list = saved().lists[0]; list.entries[0].notes = 'Thesis 👀'; list.entries[0].status = 'Buy List'; list.entries[0].archived = true;
  const result = addWatchAssets(list,[cmc,cmc,paprika],later);
  assert.equal(result.entries.length,2); assert.equal(result.entries[0].archived,false); assert.equal(result.entries[0].notes,'Thesis 👀'); assert.equal(result.entries[0].status,'Buy List'); assert.equal(result.entries[0].addedAt,now);
  assert.equal(list.entries[0].archived,true); assert.throws(() => addWatchAssets({...list,archived:true},[cmc],later));
});
test('watchlist writes reject stale tabs and malformed saved data without a replacement result', () => {
  const current = saved(); const updated = updateWatchlists(JSON.stringify(current),0,f => ({...f,lists:f.lists.map(l => ({...l,name:'Renamed'}))}));
  assert.equal(updated.revision,1); assert.equal(updated.lists[0].name,'Renamed');
  assert.throws(() => updateWatchlists(JSON.stringify(updated),0,() => current),/another tab/);
  assert.throws(() => updateWatchlists('{invalid',0,() => current));
  assert.throws(() => updateWatchlists(JSON.stringify(current),0,f => ({...f,selectedId:secondId})));
});
test('backup restore is insert-only, retains selection/research notes and resolves colliding list names', () => {
  const current = saved(); current.lists[0].entries[0].notes = 'Keep original';
  const incoming = {...saved(),selectedId:secondId,lists:[{...saved().lists[0],name:'Different content'},{...saved().lists[0],id:secondId}]};
  const result = mergeWatchlistBackup(current,JSON.stringify(incoming));
  assert.equal(result.lists.length,2); assert.equal(result.lists[0].entries[0].notes,'Keep original'); assert.equal(result.lists[0].name,'Core'); assert.equal(result.lists[1].name,'Core (import 2)'); assert.equal(result.selectedId,listId);
  assert.deepEqual(mergeWatchlistBackup(result,JSON.stringify(incoming)),result);
  assert.throws(() => mergeWatchlistBackup(current,JSON.stringify({...incoming,version:4})));
});
test('paste preview exposes ambiguous symbols, exact provider IDs, unknown rows and input limits', () => {
  const catalog = [cmc,paprika,{provider:'coingecko',id:'bitcoin',name:'Bitcoin',symbol:'BTC'}] as WatchAsset[];
  const result = previewWatchImport('BTC\nbtc,cmc:1\ncoinpaprika:btc-bitcoin\nDOESNOTEXIST',catalog);
  assert.equal(result.length,4); assert.equal(result[0].matches.length,3); assert.deepEqual(result[1].matches,[cmc]); assert.deepEqual(result[2].matches,[paprika]); assert.equal(result[3].matches.length,0);
  assert.equal(previewWatchImport('cmc:01',catalog)[0].matches.length,0); assert.throws(() => pasteTokens('')); assert.throws(() => pasteTokens(Array.from({length:101},(_,i) => `T${i}`).join('\n'))); assert.throws(() => pasteTokens('x'.repeat(20001)));
});
test('watchlist quotes require exact same-provider IDs and retain missing/zero fields and complete benchmarks', () => {
  const other: WatchAsset = {provider:'coinmarketcap',id:'2',name:'Other BTC',symbol:'BTC'};
  const list = addWatchAssets(makeWatchlist('Mix',listId,now),[cmc,paprika,other],now);
  const rows = watchRows(list.entries,[coin({coinmarketcapId:1},0,0),coin({coinmarketcapId:2},10,20)],[coin({coinpaprikaId:'btc-bitcoin'},100,10)],null);
  assert.deepEqual(rows.map(r => r.price),[0,100,10]); assert.ok(Math.abs(rows[2].change24hBtcPercent! - 20) < 1e-10); assert.equal(rows[1].change24hBtcPercent,0);
  const missing = watchRows(list.entries,[],[coin({coinpaprikaId:'different-id'},999)],null);
  assert.deepEqual(missing.map(r => r.price),[null,null,null]);
  assert.deepEqual(filterMarketRows(rows,0,0,'price',true).map(r => r.price),[100,10,0]); assert.equal(filterMarketRows(missing,0,0,'price',false,[{metric:'price',min:'1',max:''}]).length,0);
  const archived = {...list.entries[0],archived:true}; assert.equal(watchRows([archived],[],[],null).length,0); assert.equal(watchRows([archived],[],[],null,true).length,1);
  const catalog = watchCatalog([coin({coinmarketcapId:1},0),coin({coinmarketcapId:1},0)],[coin({coinpaprikaId:'btc-bitcoin'},1)],null);
  assert.deepEqual(catalog.map(assetKey),['coinmarketcap:1','coinpaprika:btc-bitcoin']);
});

test('restoring an archived list keeps its entries and resolves an active name collision', () => {
  const current = saved(); const archived = {...current.lists[0],id:secondId,archived:true};
  const result = restoreWatchlist({...current,lists:[...current.lists,archived]},secondId,later);
  assert.equal(result.lists[1].name,'Core (restored 2)'); assert.equal(result.lists[1].archived,false);
  assert.deepEqual(result.lists[1].entries,archived.entries); assert.equal(result.selectedId,listId);
  assert.equal(archived.archived,true);
});
