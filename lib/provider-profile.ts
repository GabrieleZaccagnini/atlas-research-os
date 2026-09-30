import { z } from 'zod';
import { webUrl } from './project-details';
export const providerProfileSchema = z.object({
  provider: z.literal('coinpaprika'), providerId: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  name: z.string().max(200), symbol: z.string().max(30), description: z.string().max(20000),
  sourceUrl: webUrl.refine(Boolean), fetchedAt: z.string().datetime(),
  links: z.array(z.object({ label: z.string().max(100), url: webUrl.refine(Boolean) })).max(30),
  team: z.array(z.object({ name: z.string().max(200), role: z.string().max(200) })).max(50),
  tags: z.array(z.string().max(100)).max(30),
});
export type ProviderProfile = z.infer<typeof providerProfileSchema>;
