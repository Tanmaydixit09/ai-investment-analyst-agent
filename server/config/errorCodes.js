/**
 * Fixed set of error codes returned to API clients in the shape
 * `{ error: true, code: ERROR_CODES.X, message: "..." }`. Centralizing these
 * means the frontend can switch on a known, documented set of codes instead
 * of matching on free-text error messages (which are allowed to change
 * wording without breaking client logic).
 *
 * @type {Readonly<{
 *   COMPANY_NOT_FOUND: string,
 *   DATA_UNAVAILABLE: string,
 *   NEWS_UNAVAILABLE: string,
 *   LLM_TIMEOUT: string,
 *   LLM_VALIDATION_FAILED: string,
 *   SCHEMA_VALIDATION_FAILED: string,
 *   CACHE_ERROR: string,
 *   INVALID_REQUEST: string,
 *   RATE_LIMITED: string,
 *   INTERNAL_SERVER_ERROR: string
 * }>}
 */
export const ERROR_CODES = Object.freeze({
  /** Company name could not be resolved to a ticker via the financial data provider. */
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  /** Financial data (quote/fundamentals) could not be retrieved. */
  DATA_UNAVAILABLE: 'DATA_UNAVAILABLE',
  /** News could not be retrieved from any provider in the fallback chain. */
  NEWS_UNAVAILABLE: 'NEWS_UNAVAILABLE',
  /** The LLM call exceeded its timeout. */
  LLM_TIMEOUT: 'LLM_TIMEOUT',
  /** The LLM's output failed Zod validation even after one retry. */
  LLM_VALIDATION_FAILED: 'LLM_VALIDATION_FAILED',
  /** An incoming request body failed Zod validation. */
  SCHEMA_VALIDATION_FAILED: 'SCHEMA_VALIDATION_FAILED',
  /** The in-memory cache layer threw an unexpected error. */
  CACHE_ERROR: 'CACHE_ERROR',
  /** Generic invalid request (e.g. missing `company` field). */
  INVALID_REQUEST: 'INVALID_REQUEST',
  /** Client exceeded the configured rate limit. */
  RATE_LIMITED: 'RATE_LIMITED',
  /** Unexpected server-side failure not covered by a more specific code. */
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
});
