import { z } from 'zod';
export const slug = z.string().min(1).max(100).regex(/^[a-z0-9][a-z0-9_-]*$/);
export const pageNumber = z.number().int().min(1).max(20);
export const tokenLookup = z.object({ chainId: slug, address: z.string().min(1).max(128).regex(/^[a-zA-Z0-9:_-]+$/) });
export const optionalNumber = z.number().finite().nullish().transform(v => v ?? null);
export const optionalText = z.string().nullish().transform(v => v ?? null);
export const numericString = z.string().regex(/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/).transform(Number).pipe(z.number().finite()).nullish().transform(v => v ?? null);
export const optionalDate = z.string().refine(v => Number.isFinite(Date.parse(v))).nullish().transform(v => v ? new Date(v).toISOString() : null);
export const optionalUrl = z.string().url().refine(v => /^https?:\/\//.test(v)).nullish().transform(v => v ?? null);
