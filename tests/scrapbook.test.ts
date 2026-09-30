import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrapbookItemSchema, scrapbookBackupSchema, validateScreenshot, validateImageSignature, safeResearchUrl } from '../lib/scrapbook';
const item = {
  id: '106f0809-40dc-484e-8d93-25ef9e5797b7', projectId: null, kind: 'link' as const,
  topic: 'Crypto' as const, title: 'Research post', url: 'https://x.com/example/status/123',
  note: 'Read again', tags: ['macro'], imageName: null,
  createdAt: '2026-09-30T12:00:00.000Z', updatedAt: '2026-09-30T12:00:00.000Z',
};
test('research links require safe HTTP(S) URLs and exact project IDs', () => {
  assert.equal(scrapbookItemSchema.safeParse(item).success, true);
  assert.equal(safeResearchUrl('javascript:alert(1)'), false);
  assert.equal(scrapbookItemSchema.safeParse({ ...item, url: 'https://user:pass@example.com' }).success, false);
  assert.equal(scrapbookItemSchema.safeParse({ ...item, projectId: '../another-account' }).success, false);
  assert.equal(scrapbookItemSchema.safeParse({ ...item, url: '' }).success, false);
});
test('backup rejects duplicate IDs, unsupported images and missing screenshot content', () => {
  const entry = { ...item, imageDataUrl: null };
  assert.equal(scrapbookBackupSchema.safeParse({ version: 1, items: [entry] }).success, true);
  assert.equal(scrapbookBackupSchema.safeParse({ version: 1, items: [entry, entry] }).success, false);
  assert.equal(scrapbookBackupSchema.safeParse({ version: 1, items: [{ ...entry, kind: 'screenshot', imageName: 'capture.png' }] }).success, false);
  assert.equal(scrapbookBackupSchema.safeParse({ version: 1, items: [{ ...entry, imageDataUrl: 'data:text/html;base64,PHNjcmlwdD4=' }] }).success, false);
});
test('screenshot validation rejects oversized and mislabeled content', async () => {
  assert.equal(validateScreenshot(new Blob(['x'], { type: 'text/html' })), 'Use a PNG, JPEG, WebP or GIF image.');
  assert.equal(validateScreenshot(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' })), 'Screenshots must be 5 MB or smaller.');
  assert.equal(await validateImageSignature(new Blob(['<script>'], { type: 'image/png' })), false);
  assert.equal(await validateImageSignature(new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], { type: 'image/png' })), true);
});
