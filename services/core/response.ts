import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ServiceResult } from './types';
export async function serviceResponse<T>(run: () => Promise<ServiceResult<T>>) {
  try {
    const result = await run();
    const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
    const error = result.ok ? result.warning : result.error;
    if (error?.retryAt) headers['Retry-After'] = String(Math.max(1, Math.ceil((Date.parse(error.retryAt) - Date.now()) / 1000)));
    const status = result.ok ? 200 : error?.code === 'rate_limited' ? 429 : error?.code === 'timeout' ? 504 : ['disabled', 'missing_key'].includes(error?.code ?? '') ? 503 : 502;
    return NextResponse.json(result, { status, headers });
  } catch (error) {
    const invalid = error instanceof ZodError;
    return NextResponse.json({ ok: false, data: null, error: { code: invalid ? 'invalid_input' : 'internal', message: invalid ? 'Invalid query parameters' : 'Data service unavailable' } }, { status: invalid ? 400 : 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
