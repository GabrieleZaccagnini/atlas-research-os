import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeCandles, createCandleService } from '../services/candles';
import { parseUtcMinute, chartPlanSchema, parseChartPlans, saveChartPlan, mergeChartPlans, indicators, type ChartPlan } from '../lib/chart-plans';
import { ProviderRuntime } from '../services/core/runtime';
import { readConfig } from '../services/core/config';
const hour=3600000,base=Date.UTC(2026,8,1);
const rows=Array.from({length:220},(_,i)=>[base+i*hour,String(100+i),String(102+i),String(99+i),String(101+i),'10',base+(i+1)*hour-1]);
const dataset=decodeCandles(rows,'BTCUSDT','1h',base+221*hour);
const plan:ChartPlan={id:'106f0809-40dc-484e-8d93-25ef9e5797b7',projectId:'bitcoin-research',name:'Scenario',market:'BTCUSDT',interval:'1h',style:'candles',indicators:{sma50:true,sma200:true,ema50:true,rsi14:true,volume:true},drawings:[{id:'206f0809-40dc-484e-8d93-25ef9e5797b7',kind:'trend',label:'Support',a:{time:base,price:100},b:{time:base+hour,price:101}}],thesis:'My scenario',invalidation:'Close below support',dataset,fetchedAt:'2026-09-30T10:00:00.000Z',createdAt:'2026-09-30T10:00:00.000Z',updatedAt:'2026-09-30T10:00:00.000Z'};
test('candles discard the open bar and reject gaps, duplicates, nonfinite values and invalid OHLC',()=>{
 assert.equal(decodeCandles(rows,'BTCUSDT','1h',base+219*hour).candles.length,219);
 assert.throws(()=>decodeCandles([rows[0],rows[2]],'BTCUSDT','1h',base+300*hour));
 assert.throws(()=>decodeCandles([rows[0],rows[0]],'BTCUSDT','1h',base+300*hour));
 assert.throws(()=>decodeCandles([[...rows[0].slice(0,2),'1',...rows[0].slice(3)]],'BTCUSDT','1h',base+300*hour));
 assert.throws(()=>decodeCandles([[base,'Infinity','2','1','1','0',base+hour-1]],'BTCUSDT','1h',base+hour));
 assert.throws(()=>decodeCandles(rows,'BTCUSDT','4h',base+300*hour));
});
test('indicators use full warmup and Wilder RSI handles rising and flat histories',()=>{
 const sma=indicators(dataset.candles,50,'sma'),ema=indicators(dataset.candles,50,'ema'),rsi=indicators(dataset.candles,14,'rsi');
 assert.equal(sma[48],null);assert.equal(sma[49],125.5);assert.equal(sma[50],126.5);assert.equal(ema[49],125.5);assert.equal(ema[50],126.5);
 assert.equal(rsi[13],null);assert.equal(rsi[14],100);
 assert.equal(indicators(dataset.candles.map(c=>({...c,close:100})),14,'rsi')[14],50);
 assert.equal(indicators(dataset.candles,0,'sma')[0],null);
});
test('chart backup preserves snapshot, drawing geometry and notes, rejects identity mismatch and duplicates',()=>{
 const raw=JSON.stringify({version:1,plans:[plan]});assert.deepEqual(parseChartPlans(raw).plans[0],plan);
 assert.equal(chartPlanSchema.safeParse({...plan,market:'ETHUSDT'}).success,false);
 assert.equal(chartPlanSchema.safeParse({...plan,drawings:[plan.drawings[0],plan.drawings[0]]}).success,false);
 assert.equal(chartPlanSchema.safeParse({...plan,drawings:[{...plan.drawings[0],b:plan.drawings[0].a}]}).success,false);
 assert.throws(()=>parseChartPlans(JSON.stringify({version:2,plans:[plan]})));
});
test('plan save detects stale tabs and corrupt storage; restore is insert-only',()=>{
 const raw=JSON.stringify({version:1,plans:[plan]});
 assert.throws(()=>saveChartPlan(raw,null,plan),/another tab/);
 assert.throws(()=>saveChartPlan('bad','bad',plan));
 assert.equal(saveChartPlan(raw,raw,{...plan,name:'Edited'}).plans[0].name,'Edited');
 const incoming=JSON.stringify({version:1,plans:[{...plan,name:'Do not overwrite'},{...plan,id:'306f0809-40dc-484e-8d93-25ef9e5797b7',name:'New'}]});
 const merged=mergeChartPlans(raw,incoming);assert.equal(merged.plans.length,2);assert.equal(merged.plans[0].name,'Scenario');
});
test('candle requests validate before fetch, bound history, cache and report disabled status',async()=>{
 let calls=0;const runtime=new ProviderRuntime(readConfig({}),async input=>{calls++;const url=new URL(String(input));assert.equal(url.origin,'https://data-api.binance.vision');assert.equal(url.pathname,'/api/v3/klines');assert.equal(url.searchParams.get('limit'),'500');return new Response(JSON.stringify(rows));});
 const service=createCandleService(runtime);assert.throws(()=>service.get('../ETHUSDT','1h'));assert.throws(()=>service.get('BTCUSDT','1s'));assert.equal(calls,0);
 assert.equal((await service.get('BTCUSDT','1h')).ok,true);assert.equal((await service.get('BTCUSDT','1h')).ok,true);assert.equal(calls,1);
 const disabled=createCandleService(new ProviderRuntime(readConfig({ATLAS_BINANCE_ENABLED:'false'}),async()=>{throw Error('No fetch');}));assert.equal((await disabled.get('BTCUSDT','1d')).ok,false);
});

test('drawing times reject blanks and impossible dates; reloading the list cannot bypass plan conflicts',()=>{
 assert.throws(()=>parseUtcMinute(''));assert.throws(()=>parseUtcMinute('2026-02-30 00:00'));
 assert.equal(parseUtcMinute('2026-09-20 14:30'),Date.UTC(2026,8,20,14,30));
 const raw=JSON.stringify({version:1,plans:[{...plan,updatedAt:'2026-10-01T00:00:00.000Z'}]});
 assert.throws(()=>saveChartPlan(raw,raw,plan,plan.updatedAt),/plan changed/);
});
