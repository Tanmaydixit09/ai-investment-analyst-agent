/**
 * Error subclass carrying a fixed error code (from config/errorCodes.js)
 * alongside a human-readable message. Thrown by services instead of plain
 * `Error` so that a later layer (the Express error-handling middleware,
 * built in step 9) can respond with the correct structured error shape
 * (`{ error: true, code, message }`) by reading `error.code` directly,
 * instead of pattern-matching on error message text.
 *
 * Uses the native `Error` `cause` option (Node 16.9+) to preserve the
 * original underlying error for logging/debugging, without leaking that
 * detail into the client-facing message.
 */
export class ServiceError extends Error {
  /**
   * @param {string} code - one of the values exported by ERROR_CODES
   * @param {string} message - human-readable, safe to return to the client
   * @param {Error} [cause] - the original underlying error, if any
   */
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ServiceError';
    this.code = code;
  }
}
