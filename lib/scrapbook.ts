import { z } from 'zod';

export const scrapbookKinds = ['link', 'note', 'screenshot'] as const;
export const scrapbookTopics = ['Crypto', 'Investing', 'Macro', 'Other'] as const;
export const maxScreenshotBytes = 5 * 1024 * 1024;
export const maxScrapbookItems = 500;
const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const dbName = 'atlas.scrapbook.v1';
const storeName = 'items';

export function safeResearchUrl(value: string) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !!url.hostname;
  } catch { return false; }
}

export const scrapbookItemSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().regex(/^[a-z0-9_-]{1,100}$/).nullable(),
  kind: z.enum(scrapbookKinds),
  topic: z.enum(scrapbookTopics),
  title: z.string().trim().min(1).max(160),
  url: z.string().max(2000).refine(value => !value || safeResearchUrl(value), 'Use an HTTP(S) link without sign-in details.'),
  note: z.string().max(10000),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  imageName: z.string().max(180).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).superRefine((item, ctx) => {
  if (item.kind === 'link' && !item.url) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['url'], message: 'A link is required.' });
  if (item.kind !== 'screenshot' && item.imageName) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['imageName'], message: 'Only screenshots can have an image.' });
  if (new Set(item.tags.map(tag => tag.toLowerCase())).size !== item.tags.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tags'], message: 'Duplicate tags.' });
});
export type ScrapbookItem = z.infer<typeof scrapbookItemSchema>;
export type StoredScrapbookItem = ScrapbookItem & { key: string; scope: string; image: Blob | null };
const backupEntrySchema = scrapbookItemSchema.and(z.object({ imageDataUrl: z.string().max(7_100_000).nullable() }));
export const scrapbookBackupSchema = z.object({ version: z.literal(1), items: z.array(backupEntrySchema).max(maxScrapbookItems) }).superRefine((backup, ctx) => {
  if (new Set(backup.items.map(item => item.id)).size !== backup.items.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Duplicate item IDs.' });
  backup.items.forEach((item, index) => {
    if (item.kind === 'screenshot' && !item.imageDataUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'imageDataUrl'], message: 'Screenshot data is missing.' });
    if (item.kind !== 'screenshot' && item.imageDataUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'imageDataUrl'], message: 'Unexpected image data.' });
    if (item.imageDataUrl && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(item.imageDataUrl)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'imageDataUrl'], message: 'Unsupported image data.' });
  });
});

export function parseTags(value: string): string[] {
  return Array.from(new Set(value.split(',').map(tag => tag.trim()).filter(Boolean))).slice(0, 12);
}
export function validateScreenshot(file: Blob | null): string | null {
  if (!file) return 'Choose a screenshot.';
  if (!imageTypes.includes(file.type)) return 'Use a PNG, JPEG, WebP or GIF image.';
  if (file.size > maxScreenshotBytes) return 'Screenshots must be 5 MB or smaller.';
  if (file.size === 0) return 'The screenshot is empty.';
  return null;
}
export async function validateImageSignature(file: Blob): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (file.type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (file.type === 'image/gif') return String.fromCharCode(...Array.from(bytes.slice(0, 6))) === 'GIF87a' || String.fromCharCode(...Array.from(bytes.slice(0, 6))) === 'GIF89a';
  if (file.type === 'image/webp') return String.fromCharCode(...Array.from(bytes.slice(0, 4))) === 'RIFF' && String.fromCharCode(...Array.from(bytes.slice(8, 12))) === 'WEBP';
  return false;
}
function validateStored(item: StoredScrapbookItem, scope: string): StoredScrapbookItem {
  const parsed = scrapbookItemSchema.parse(item);
  if (item.scope !== scope || item.key !== `${scope}:${parsed.id}`) throw new Error('A library record has an invalid owner.');
  if (parsed.kind === 'screenshot' && validateScreenshot(item.image)) throw new Error('A saved screenshot is missing or invalid.');
  if (parsed.kind !== 'screenshot' && item.image) throw new Error('A library record has an unexpected image.');
  return { ...parsed, key: item.key, scope, image: item.image ?? null };
}
function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('This browser does not support screenshot storage.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(storeName, { keyPath: 'key' });
      store.createIndex('scope', 'scope', { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Library storage could not be opened.'));
    request.onblocked = () => reject(new Error('Close other Atlas tabs and retry opening the library.'));
  });
}
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Library storage request failed.'));
  });
}
function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Library save failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('Library save was cancelled.'));
  });
}
export async function listScrapbook(scope: string): Promise<StoredScrapbookItem[]> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(storeName, 'readonly');
    const rows = await requestResult<StoredScrapbookItem[]>(tx.objectStore(storeName).index('scope').getAll(scope));
    return rows.map(row => validateStored(row, scope)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } finally { db.close(); }
}
export async function saveScrapbookItem(scope: string, input: ScrapbookItem, image: Blob | null, expectedUpdatedAt?: string): Promise<void> {
  const item = scrapbookItemSchema.parse(input);
  if (item.kind === 'screenshot') {
    const imageError = validateScreenshot(image);
    if (imageError) throw new Error(imageError);
    if (!await validateImageSignature(image!)) throw new Error('The selected file does not match its image type.');
  } else if (image) throw new Error('Only screenshots can include an image.');
  const db = await openDatabase();
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const done = transactionDone(tx);
    const store = tx.objectStore(storeName);
    let conflict = '';
    const count = store.index('scope').count(scope);
    count.onsuccess = () => {
      const existingRequest = store.get(`${scope}:${item.id}`);
      existingRequest.onsuccess = () => {
        const existing = existingRequest.result as StoredScrapbookItem | undefined;
        if (existing) {
          try { validateStored(existing, scope); }
          catch { conflict = 'A saved clipping is invalid. Export a backup before changing this library.'; tx.abort(); return; }
        }
        if (count.result >= maxScrapbookItems && !existing) conflict = 'This library is full. Export a backup before removing older items.';
        else if (expectedUpdatedAt !== undefined && existing?.updatedAt !== expectedUpdatedAt) conflict = 'This clipping changed in another tab. Reload before saving.';
        else if (expectedUpdatedAt === undefined && existing) conflict = 'This clipping already exists. Reload before saving.';
        if (conflict) tx.abort();
        else store.put({ ...item, key: `${scope}:${item.id}`, scope, image });
      };
    };
    try { await done; } catch (cause) { throw new Error(conflict || (cause instanceof Error ? cause.message : 'Library save failed.')); }
  } finally { db.close(); }
}
export async function deleteScrapbookItem(scope: string, id: string): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore(storeName).delete(`${scope}:${id}`);
    await done;
  } finally { db.close(); }
}
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Screenshot backup failed.'));
    reader.onerror = () => reject(reader.error ?? new Error('Screenshot backup failed.'));
    reader.readAsDataURL(blob);
  });
}
function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) throw new Error('Unsupported screenshot in backup.');
  const binary = atob(match[2]);
  if (binary.length > maxScreenshotBytes) throw new Error('A screenshot in the backup exceeds 5 MB.');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: match[1] });
}
export async function exportScrapbook(scope: string): Promise<string> {
  const rows = await listScrapbook(scope);
  const items = await Promise.all(rows.map(async ({ key: _key, scope: _scope, image, ...item }) => ({ ...item, imageDataUrl: image ? await blobToDataUrl(image) : null })));
  return JSON.stringify({ version: 1, items }, null, 2);
}
export async function importScrapbook(scope: string, raw: string): Promise<number> {
  const backup = scrapbookBackupSchema.parse(JSON.parse(raw));
  const restored = backup.items.map(({ imageDataUrl, ...item }) => {
    const image = imageDataUrl ? dataUrlToBlob(imageDataUrl) : null;
    if (item.kind === 'screenshot' && validateScreenshot(image)) throw new Error('Invalid screenshot in backup.');
    return { ...item, key: `${scope}:${item.id}`, scope, image };
  });
  for (const item of restored) if (item.image && !await validateImageSignature(item.image)) throw new Error('A screenshot in the backup does not match its image type.');
  const current = await listScrapbook(scope);
  const existing = new Set(current.map(item => item.id));
  const additions = restored.filter(item => !existing.has(item.id));
  if (current.length + additions.length > maxScrapbookItems) throw new Error('Import would exceed the 500-item library limit.');
  const db = await openDatabase();
  try {
    const tx = db.transaction(storeName, 'readwrite');
    const done = transactionDone(tx);
    additions.forEach(item => tx.objectStore(storeName).add(item));
    await done;
    return additions.length;
  } finally { db.close(); }
}
export function announceScrapbookChange(scope: string) {
  window.dispatchEvent(new CustomEvent('atlas:scrapbook-changed', { detail: scope }));
  try { localStorage.setItem(`atlas.scrapbook.changed:${scope}`, String(Date.now())); } catch { /* Library still updates in this tab. */ }
}
