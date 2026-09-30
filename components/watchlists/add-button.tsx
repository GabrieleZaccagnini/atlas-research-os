'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { buttonClass, inputClass } from '@/components/projects/fields';
import { addWatchAssets, assetKey, makeWatchlist, watchProviderNames, type WatchAsset } from '@/lib/watchlists';
import { useWatchlists } from './store';
export function WatchButton({ asset, compact = false }: { asset: WatchAsset; compact?: boolean }) {
  const store = useWatchlists(); const [open, setOpen] = useState(false); const [listId, setListId] = useState(''); const [name, setName] = useState(''); const [notice, setNotice] = useState('');
  const lists = store.file.lists.filter(l => !l.archived); const watched = lists.some(l => l.entries.some(e => !e.archived && assetKey(e.asset) === assetKey(asset)));
  function start() { setListId(store.file.selectedId ?? lists[0]?.id ?? 'new'); setName(''); setNotice(''); setOpen(true); }
  function add(e: React.FormEvent) {
    e.preventDefault(); const now = new Date().toISOString(); const id = listId === 'new' ? crypto.randomUUID() : listId;
    const ok = store.commit(f => {
      const list = listId === 'new' ? makeWatchlist(name, id, now) : f.lists.find(l => l.id === id);
      if (!list) throw Error('Choose a list.'); const next = addWatchAssets(list, [asset], now);
      return { ...f, selectedId: f.selectedId ?? id, lists: listId === 'new' ? [...f.lists, next] : f.lists.map(l => l.id === id ? next : l) };
    });
    if (ok) { setListId(id); setNotice(`Saved ${asset.name}. Existing notes and status were kept.`); }
  }
  return <><button type="button" disabled={!store.ready} title="Add to a named watchlist" aria-label={`Add ${asset.name} to a watchlist`} onClick={start} className="inline-flex shrink-0 items-center gap-1 rounded-md p-1 text-xs text-primary disabled:opacity-40"><Star size={13} fill={watched ? 'currentColor' : 'none'} />{!compact && 'Watch'}</button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85dvh] overflow-auto sm:max-w-md"><DialogTitle>Add to watchlist</DialogTitle><DialogDescription>{asset.name} ({asset.symbol}) · {watchProviderNames[asset.provider]} · {asset.id}</DialogDescription><form className="space-y-4" onSubmit={add}><label className="block text-xs">Watchlist<select className={`${inputClass} mt-1.5`} value={listId} onChange={e => { setListId(e.target.value); setNotice(''); }}>{lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}<option value="new">Create a new list</option></select></label>{listId === 'new' && <label className="block text-xs">List name<input required maxLength={60} className={`${inputClass} mt-1.5`} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. RWA" /></label>}<p className="text-[10px] text-muted-foreground">Named lists are saved in this browser. Adding an asset does not create a position or change research.</p>{(store.error || notice) && <p role="status" className="text-xs text-warning">{store.error || notice}</p>}<div className="flex flex-wrap gap-3"><button type="submit" className={buttonClass} disabled={!store.ready || (listId === 'new' && !name.trim())}>Save to list</button><Link className="text-xs text-primary" href="/watchlists" onClick={() => setOpen(false)}>Manage watchlists →</Link></div>{store.error && <button type="button" className={buttonClass} onClick={store.reload}>Reload lists</button>}</form></DialogContent></Dialog></>;
}
