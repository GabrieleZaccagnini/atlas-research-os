import { z } from 'zod';
import { marketColumns, validMarketColumns } from './market-columns';
import { invalidRange, type MarketRange, type MarketSort, type MarketView } from './market-dashboard';
export const discoveryViewsKey = 'atlas.discovery.views.v1';
export interface DiscoverySettings {
  provider: 'coinmarketcap' | 'coinpaprika'; view: MarketView; query: string;
  minCap: number; minVolume: number; sort: MarketSort | null; descending: boolean;
  ranges: MarketRange[]; columns: Exclude<MarketSort, 'name'>[];
}
const metric = z.custom<MarketRange['metric']>(v => marketColumns.some(c => c.key === v));
export const discoverySettingsSchema = z.object({
  provider:z.enum(['coinmarketcap','coinpaprika']), view:z.enum(['leaders','gainers','losers','volume']), query:z.string().max(200),
  minCap:z.number().refine(v => [0,1e6,1e7,1e8,1e9].includes(v)), minVolume:z.number().refine(v => [0,1e6,1e7,1e8,1e9].includes(v)),
  sort:z.custom<MarketSort>(v => v === 'name' || marketColumns.some(c => c.key === v)).nullable(), descending:z.boolean(),
  ranges:z.array(z.object({metric,min:z.string().max(40),max:z.string().max(40)}).refine(r => !invalidRange(r))).max(8),
  columns:z.custom<DiscoverySettings['columns']>(v => !!validMarketColumns(v)),
});
const savedViewSchema = z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(60),settings:discoverySettingsSchema});
const fileSchema = z.object({version:z.literal(1),views:z.array(savedViewSchema).max(20)}).refine(f => new Set(f.views.map(v => v.id)).size === f.views.length && new Set(f.views.map(v => v.name.toLowerCase())).size === f.views.length);
export type SavedDiscoveryView = z.infer<typeof savedViewSchema>;
export type DiscoveryViewsFile = z.infer<typeof fileSchema>;
export function parseDiscoveryViews(raw: string | null): DiscoveryViewsFile {
  if (raw === null) return {version:1,views:[]};
  if (raw.length > 100000) throw Error('Saved views are too large.');
  return fileSchema.parse(JSON.parse(raw));
}
export function appendDiscoveryView(raw: string | null, expected: string | null, view: SavedDiscoveryView): DiscoveryViewsFile {
  if (raw !== expected) throw Error('Saved views changed in another tab. Reload views before saving.');
  const current = parseDiscoveryViews(raw);
  return fileSchema.parse({...current,views:[...current.views,view]});
}
export const discoveryPresets = [
  {id:'btc',name:'BTC outperformers',description:'24h gain against BTC ≥ 0.1%; reported 24h volume ≥ $10M.',ranges:[{metric:'change24hBtcPercent',min:'0.1',max:''}],sort:'change24hBtcPercent'},
  {id:'pullbacks',name:'Weekly-leader pullbacks',description:'7d gain ≥ 0.1%; 24h change ≤ −0.1%; reported 24h volume ≥ $10M.',ranges:[{metric:'change7dPercent',min:'0.1',max:''},{metric:'change24hPercent',min:'',max:'-0.1'}],sort:'change7dPercent'},
  {id:'gainers',name:'High-volume gainers',description:'24h gain ≥ 5%; reported 24h volume ≥ $10M. Volume is not market depth.',ranges:[{metric:'change24hPercent',min:'5',max:''}],sort:'change24hPercent'},
] as const;
export function discoveryPreset(id: string, provider: DiscoverySettings['provider']): DiscoverySettings | null {
  const preset = discoveryPresets.find(p => p.id === id); if (!preset) return null;
  return discoverySettingsSchema.parse({provider,view:'leaders',query:'',minCap:0,minVolume:1e7,sort:preset.sort,descending:true,ranges:preset.ranges,
    columns:['rank','price','change24hPercent','change7dPercent',...(id === 'btc' ? ['change24hBtcPercent'] : []),'marketCap','volume24h']});
}
