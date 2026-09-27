import type { ErrorCode, ServiceError } from './types';
export class ProviderError extends Error {
  constructor(public code: ErrorCode, message: string, public retryAt?: string) { super(message); }
  toJSON(): ServiceError { return { code: this.code, message: this.message, ...(this.retryAt ? { retryAt: this.retryAt } : {}) }; }
}
export function safeError(error: unknown): ServiceError {
  return error instanceof ProviderError ? error.toJSON() : { code: 'invalid_response', message: 'Provider returned an invalid response' };
}
