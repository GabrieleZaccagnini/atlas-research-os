import { z } from 'zod';
import { getServices } from '@/services/server';
import { serviceResponse } from '@/services/core/response';
import { macroSeries, type MacroId } from '@/services/intelligence/types';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return serviceResponse<unknown>(async () => {
    const q = new URL(request.url).searchParams;
    const feed = z.enum(['trending', 'chains', 'revenue', 'dexActivity', 'stablecoins', 'sentiment', 'news', 'macro', 'cmcSentiment', 'altseason']).parse(q.get('feed'));
    if (feed === 'cmcSentiment') return getServices().cmc.sentiment();
    if (feed === 'altseason') return getServices().cmc.altseason();
    const service = getServices().intelligence;
    if (feed === 'macro') {
      const id = z.string().refine(v => Object.prototype.hasOwnProperty.call(macroSeries, v)).parse(q.get('series')) as MacroId;
      return service.macro(id);
    }
    if (feed === 'news') return service.news(z.enum(['coindesk', 'federalreserve', 'cointelegraph', 'ecb']).parse(q.get('source') ?? 'coindesk'));
    return service[feed]();
  });
}
