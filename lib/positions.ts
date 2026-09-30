import { z } from 'zod';
// Manual snapshots, not a transaction ledger. Strings preserve entered decimal precision.
const decimal = z.string().trim().max(45).regex(/^(?:0|[1-9]\d{0,14})(?:\.\d{1,18})?$/).refine(v => Number.isFinite(Number(v)));
export const positionSchema = z.object({ quantity: decimal, averageCostUsd: decimal.nullable(), recordedAt: z.string().datetime() });
