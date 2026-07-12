import { ERROR_CODES } from '../config/index.js';
import { ServiceError } from '../utils/ServiceError.js';

/**
 * Maps each ERROR_CODES value to an HTTP status. Kept local to this file
 * rather than in config/errorCodes.js — errorCodes.js defines WHAT can go
 * wrong (a concern shared by services, providers, and the API layer), while
 * "what HTTP status represents that" is purely an API-layer concern and
 * doesn't belong in a config file services also depend on.
 */
const STATUS_BY_CODE = {
  [ERROR_CODES.COMPANY_NOT_FOUND]: 404,
  [ERROR_CODES.DATA_UNAVAILABLE]: 502,
  [ERROR_CODES.NEWS_UNAVAILABLE]: 502,
  [ERROR_CODES.LLM_TIMEOUT]: 504,
  [ERROR_CODES.LLM_VALIDATION_FAILED]: 502,
  [ERROR_CODES.SCHEMA_VALIDATION_FAILED]: 400,
  [ERROR_CODES.CACHE_ERROR]: 500,
  [ERROR_CODES.INVALID_REQUEST]: 400,
  [ERROR_CODES.RATE_LIMITED]: 429,
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
};

/**
 * Express error-handling middleware (four-arg signature — required by
 * Express to be recognized as an error handler). Registered last, after
 * all routes.
 *
 * Known errors (ServiceError, thrown throughout the services/agent layers)
 * map to a specific status + code. Anything else is an unexpected failure:
 * logged in full server-side (with requestId for traceability), but
 * returned to the client as a generic 500 rather than leaking internals.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isServiceError = err instanceof ServiceError;
  const code = isServiceError ? err.code : ERROR_CODES.INTERNAL_SERVER_ERROR;
  const status = STATUS_BY_CODE[code] ?? 500;
  const message = isServiceError ? err.message : 'An unexpected server error occurred.';

  console.error(`[${req.requestId ?? 'no-request-id'}] ${err.stack || err.message}`);

  res.status(status).json({
    success: false,
    error: { code, message },
  });
}
