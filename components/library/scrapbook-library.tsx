'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookmarkPlus, Download, ExternalLink, ImagePlus, Search, Upload } from 'lucide-react';
import { useAuth } from '@/components/auth/provider';
import { useProjects } from '@/components/projects/store';
import { buttonClass, inputClass } from '@/components/projects/fields';
import { Card, PageHeader } from '@/components/shared';
import {
  announceScrapbookChange, deleteScrapbookItem, exportScrapbook, importScrapbook,
  listScrapbook, maxScreenshotBytes, parseTags, saveScrapbookItem, scrapbookItemSchema,
  scrapbookKinds, scrapbookTopics, validateScreenshot,
  type ScrapbookItem, type StoredScrapbookItem,
} from '@/lib/scrapbook';

type Kind = ScrapbookItem['kind'];
type Topic = ScrapbookItem['topic'];
const captureTemplates = {
  daily: { label: 'Daily insight', topic: 'Investing', tag: 'daily', prompt: 'What I noticed:\n\nWhy it matters:\n\nWhat I will check next:\n' },
  strategy: { label: 'Strategy idea', topic: 'Investing', tag: 'strategy', prompt: 'Setup or idea:\n\nEvidence for it:\n\nWhat could invalidate it:\n\nNext check:\n' },
  mechanics: { label: 'How it works', topic: 'Crypto', tag: 'mechanics', prompt: 'Concept in my own words:\n\nExample:\n\nWhat I still need to verify:\n' },
  token: { label: 'Token research', topic: 'Crypto', tag: 'token-research', prompt: 'What caught my attention:\n\nEvidence and source:\n\nRisks or open questions:\n\nNext check:\n' },
  ai: { label: 'AI conversation', topic: 'Investing', tag: 'ai-conversation', prompt: 'Useful takeaway from the conversation:\n\nClaims to verify from original sources:\n\nMy own view:\n\nNext check:\n' },
} as const;
type CaptureTemplate = keyof typeof captureTemplates;
function Screenshot({ item }: { item: StoredScrapbookItem }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!item.image) return;
    const objectUrl = URL.createObjectURL(item.image);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.image]);
  if (!url) return <div className="flex h-40 items-center justify-center rounded-lg bg-secondary/30 text-xs text-muted-foreground">Loading screenshot…</div>;
  // Object URLs for private IndexedDB screenshots cannot be optimized by Next's remote image loader.
  // eslint-disable-next-line @next/next/no-img-element
  return <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open screenshot: ${item.title}`}><img src={url} alt={item.title} className="max-h-72 w-full rounded-lg border border-border/50 bg-background object-contain" /></a>;
}
export function ScrapbookLibrary({ projectId }: { projectId?: string }) {
  const auth = useAuth();
  const projects = useProjects();
  const scope = auth.session?.user.id ?? 'browser';
  const [items, setItems] = useState<StoredScrapbookItem[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [backupUrl, setBackupUrl] = useState<string | null>(null);
  useEffect(() => () => { if (backupUrl) URL.revokeObjectURL(backupUrl); }, [backupUrl]);
  useEffect(() => { setBackupUrl(null); }, [scope]);
  const [kind, setKind] = useState<Kind>('link');
  const [topic, setTopic] = useState<Topic>('Crypto');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [targetProject, setTargetProject] = useState(projectId ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<StoredScrapbookItem | null>(null);
  const [query, setQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState<'all' | CaptureTemplate>('all');
  const [kindFilter, setKindFilter] = useState<'all' | Kind>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'general' | 'projects'>('all');
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('capture');
    if (!requested || !(requested in captureTemplates)) return;
    const template = captureTemplates[requested as CaptureTemplate];
    setKind('note'); setTopic(template.topic); setTags(template.tag); setNote(template.prompt);
    formRef.current?.scrollIntoView({ block: 'start' });
  }, []);
  const load = useCallback(async () => {
    try { setItems(await listScrapbook(scope)); setError(''); setReady(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Library could not be loaded.'); setReady(false); }
  }, [scope]);
  useEffect(() => {
    void load();
    const changed = (event: Event) => { if ((event as CustomEvent<string>).detail === scope) void load(); };
    const storage = (event: StorageEvent) => { if (event.key === `atlas.scrapbook.changed:${scope}`) void load(); };
    window.addEventListener('atlas:scrapbook-changed', changed);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('atlas:scrapbook-changed', changed); window.removeEventListener('storage', storage); };
  }, [load, scope]);
  function resetForm() {
    setKind('link'); setTopic('Crypto'); setTitle(''); setUrl(''); setNote(''); setTags('');
    setTargetProject(projectId ?? ''); setFile(null); setEditing(null);
    if (fileRef.current) fileRef.current.value = '';
  }
  function applyTemplate(key: CaptureTemplate) {
    const untouchedTemplate = Object.values(captureTemplates).some(template => template.prompt === note && template.tag === tags);
    if (editing || title.trim() || url.trim() || file || ((note.trim() || tags.trim()) && !untouchedTemplate)) {
      setNotice('Your draft is still here. Save it or clear it before starting another note.');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const template = captureTemplates[key];
    setNotice(''); setError('');
    setEditing(null); setKind('note'); setTopic(template.topic); setTitle(''); setUrl(''); setFile(null);
    setTargetProject(projectId ?? ''); setTags(template.tag); setNote(template.prompt);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function edit(item: StoredScrapbookItem) {
    setEditing(item); setKind(item.kind); setTopic(item.topic); setTitle(item.title); setUrl(item.url);
    setNote(item.note); setTags(item.tags.join(', ')); setTargetProject(item.projectId ?? ''); setFile(null);
    setError(''); setNotice('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const image = kind === 'screenshot' ? file ?? editing?.image ?? null : null;
      if (kind === 'screenshot') {
        const imageError = validateScreenshot(image);
        if (imageError) throw new Error(imageError);
      }
      const now = new Date().toISOString();
      const entry = scrapbookItemSchema.parse({
        id: editing?.id ?? crypto.randomUUID(), projectId: projectId ?? (targetProject || null),
        kind, topic, title: title.trim(), url: url.trim(), note: note.trim(), tags: parseTags(tags),
        imageName: kind === 'screenshot' ? file?.name.slice(0, 180) ?? editing?.imageName ?? 'Screenshot' : null,
        createdAt: editing?.createdAt ?? now, updatedAt: now,
      });
      await saveScrapbookItem(scope, entry, image, editing?.updatedAt);
      resetForm(); setNotice(editing ? 'Clipping updated.' : 'Clipping saved.');
      announceScrapbookChange(scope);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Clipping could not be saved.'); }
    finally { setBusy(false); }
  }
  async function remove(item: StoredScrapbookItem) {
    if (!window.confirm(`Delete “${item.title}” from this browser library?`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await deleteScrapbookItem(scope, item.id); if (editing?.id === item.id) resetForm(); setNotice('Clipping deleted.'); announceScrapbookChange(scope); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Clipping could not be deleted.'); }
    finally { setBusy(false); }
  }
  async function exportLibrary() {
    setBusy(true); setError(''); setNotice('');
    try { setBackupUrl(URL.createObjectURL(new Blob([await exportScrapbook(scope)], { type: 'application/json' }))); setNotice('Backup ready, including screenshots. Select Save backup file to download it.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Library backup failed.'); }
    finally { setBusy(false); }
  }
  async function restore(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('Backup is too large to import.');
      const count = await importScrapbook(scope, await file.text());
      setNotice(`${count} new clipping${count === 1 ? '' : 's'} restored. Existing items were kept.`);
      announceScrapbookChange(scope);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Library import failed. Existing items were kept.'); }
    finally { setBusy(false); if (importRef.current) importRef.current.value = ''; }
  }
  const visible = items.filter(item => {
    if (projectId && item.projectId !== projectId) return false;
    if (!projectId && scopeFilter === 'general' && item.projectId) return false;
    if (!projectId && scopeFilter === 'projects' && !item.projectId) return false;
    if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
    if (focusFilter !== 'all' && !item.tags.some(tag => tag.toLowerCase() === captureTemplates[focusFilter].tag)) return false;
    const search = query.trim().toLowerCase();
    return !search || [item.title, item.url, item.note, item.topic, ...item.tags, projects.projects.find(project => project.id === item.projectId)?.name ?? ''].join(' ').toLowerCase().includes(search);
  });
  return <div className="space-y-5">
    {projectId ? <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Project library</h2><p className="text-sm text-muted-foreground">Save posts, articles, notes and screenshots about this project.</p></div><Link href="/library" className="text-sm text-primary hover:underline">Open full library →</Link></div> : <PageHeader title="Research Library" description="Keep useful crypto, macro and investing research in one place." />}
    <Card className="space-y-3 p-4 text-xs text-muted-foreground">
      <p>This library is saved in this browser{auth.session ? ' for your signed-in account' : ''}. It does not sync across devices. Its screenshots are included in <strong className="text-foreground">Backup library</strong>, separately from project backups.</p>
      <div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} disabled={!ready || busy} onClick={() => void exportLibrary()}><Download className="mr-1 inline h-3.5 w-3.5" />Backup library</button><label className={`${buttonClass} cursor-pointer`}><Upload className="mr-1 inline h-3.5 w-3.5" />Restore backup<input ref={importRef} type="file" accept="application/json,.json" className="sr-only" disabled={busy} onChange={event => void restore(event.target.files?.[0])} /></label></div>
      {backupUrl && <a href={backupUrl} download={`atlas-library-${new Date().toISOString().slice(0, 10)}.json`} className="inline-block text-sm text-primary underline">Save backup file</a>}
    </Card>
    <Card className="space-y-3 p-4" id="quick-capture"><div><h2 className="text-sm font-semibold">Quick research capture</h2><p className="mt-1 text-xs text-muted-foreground">Choose a starting point, write your own takeaway, and add a source link or project when relevant. AI conversations are saved as notes to verify, not as established facts.</p></div><div className="flex flex-wrap gap-2">{Object.entries(captureTemplates).map(([key, template]) => <button key={key} type="button" className={`${buttonClass} text-xs`} onClick={() => applyTemplate(key as CaptureTemplate)}>{template.label}</button>)}</div></Card>
    <Card className="p-5"><form ref={formRef} className="space-y-4" onSubmit={event => void save(event)} onPaste={event => {
      if (kind !== 'screenshot') return;
      const pasted = Array.from(event.clipboardData.files).find(candidate => candidate.type.startsWith('image/'));
      if (pasted) { setFile(new File([pasted], `pasted-screenshot-${Date.now()}.${pasted.type === 'image/jpeg' ? 'jpg' : pasted.type.split('/')[1]}`, { type: pasted.type })); event.preventDefault(); }
    }}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{editing ? 'Edit clipping' : 'Add to library'}</h3><button type="button" className="text-xs text-muted-foreground hover:underline" onClick={resetForm}>{editing ? 'Cancel edit' : 'Clear draft'}</button></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-muted-foreground">Type<select className={inputClass} value={kind} onChange={event => { setKind(event.target.value as Kind); setFile(null); }}>{scrapbookKinds.map(value => <option key={value} value={value}>{value === 'screenshot' ? 'Screenshot' : value === 'link' ? 'Post or article link' : 'Note'}</option>)}</select></label>
        <label className="space-y-1 text-xs text-muted-foreground">Topic<select className={inputClass} value={topic} onChange={event => setTopic(event.target.value as Topic)}>{scrapbookTopics.map(value => <option key={value}>{value}</option>)}</select></label>
        {!projectId && <label className="space-y-1 text-xs text-muted-foreground">Save under<select className={inputClass} value={targetProject} onChange={event => setTargetProject(event.target.value)}><option value="">General library</option>{projects.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
      </div>
      <label className="block space-y-1 text-xs text-muted-foreground">Title<input className={inputClass} required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Why you’ll want to find this again" /></label>
      {(kind === 'link' || kind === 'screenshot' || kind === 'note') && <label className="block space-y-1 text-xs text-muted-foreground">{kind === 'link' ? 'X post or article URL' : 'Source URL (optional)'}<input className={inputClass} type="url" required={kind === 'link'} maxLength={2000} value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" /></label>}
      {kind === 'screenshot' && <label className="block space-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><ImagePlus className="h-3.5 w-3.5" />Screenshot · PNG, JPEG, WebP or GIF · up to {maxScreenshotBytes / 1024 / 1024} MB</span><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-foreground`} onChange={event => setFile(event.target.files?.[0] ?? null)} />{editing?.image && !file && <span>Keeping existing screenshot: {editing.imageName}</span>}<span>You can also paste a screenshot into this form.</span></label>}
      <label className="block space-y-1 text-xs text-muted-foreground">Your note<textarea className={`${inputClass} min-h-32 resize-y`} maxLength={10000} value={note} onChange={event => setNote(event.target.value)} placeholder="What matters here? What should you check later?" /></label>
      <label className="block space-y-1 text-xs text-muted-foreground">Tags · separate with commas<input className={inputClass} maxLength={600} value={tags} onChange={event => setTags(event.target.value)} placeholder="tokenomics, policy, thesis…" /></label>
      <button className={`${buttonClass} bg-primary text-primary-foreground`} type="submit" disabled={!ready || busy}><BookmarkPlus className="mr-1 inline h-4 w-4" />{busy ? 'Saving…' : editing ? 'Save changes' : 'Save clipping'}</button>
    </form></Card>
    {(error || notice) && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-destructive/40 text-destructive' : 'border-primary/30 text-primary'}`}>{error || notice}</p>}
    <div className="flex flex-wrap items-center gap-2"><label className="relative min-w-[180px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={`${inputClass} pl-9`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search saved research" aria-label="Search saved research" /></label><select className={`${inputClass} w-auto`} aria-label="Filter research focus" value={focusFilter} onChange={event => setFocusFilter(event.target.value as typeof focusFilter)}><option value="all">All focuses</option>{Object.entries(captureTemplates).map(([key, template]) => <option key={key} value={key}>{template.label}</option>)}</select><select className={`${inputClass} w-auto`} aria-label="Filter clipping type" value={kindFilter} onChange={event => setKindFilter(event.target.value as 'all' | Kind)}><option value="all">All types</option><option value="link">Links</option><option value="note">Notes</option><option value="screenshot">Screenshots</option></select>{!projectId && <select className={`${inputClass} w-auto`} aria-label="Filter library scope" value={scopeFilter} onChange={event => setScopeFilter(event.target.value as typeof scopeFilter)}><option value="all">All research</option><option value="general">General</option><option value="projects">Projects</option></select>}<span className="text-xs text-muted-foreground">{visible.length} of {items.length}</span></div>
    {!ready ? <Card className="p-6 text-sm text-muted-foreground">{error || 'Opening library…'}</Card> : !visible.length ? <Card className="p-6 text-sm text-muted-foreground">{items.length ? 'No clippings match these filters.' : 'Your library is empty. Save an article, post, note or screenshot above.'}</Card> : <div className="grid gap-4 lg:grid-cols-2">{visible.map(item => <Card key={item.id} className="min-w-0 space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.kind} · {item.topic} · {new Date(item.createdAt).toLocaleDateString()}</p><h3 className="mt-1 break-words font-semibold">{item.title}</h3>{!projectId && <p className="mt-0.5 text-xs text-muted-foreground">{item.projectId ? projects.projects.find(project => project.id === item.projectId)?.name ?? 'Former project' : 'General library'}</p>}</div><div className="flex shrink-0 gap-2 text-xs"><button type="button" className="text-primary hover:underline" onClick={() => edit(item)}>Edit</button><button type="button" className="text-muted-foreground hover:text-destructive hover:underline" disabled={busy} onClick={() => void remove(item)}>Delete</button></div></div>{item.kind === 'screenshot' && <Screenshot item={item} />}{item.note && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.note}</p>}{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{item.url}</a>}{item.tags.length > 0 && <div className="flex flex-wrap gap-1">{item.tags.map(tag => <span key={tag} className="rounded bg-secondary px-2 py-1 text-[10px] text-muted-foreground">#{tag}</span>)}</div>}</Card>)}</div>}
  </div>;
}
