/**
 * Races a promise against a timeout, rejecting with a clear timeout error if
 * the promise doesn't settle in time. Generic and provider-agnostic — used
 * by any service that calls a potentially-slow external provider, so a
 * single hanging request (e.g. a stalled Yahoo Finance call) can never stall
 * the whole research pipeline indefinitely.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms - timeout duration in milliseconds
 * @param {string} [timeoutMessage] - error message used if the timeout wins the race
 * @returns {Promise<T>}
 */
export function withTimeout(promise, ms, timeoutMessage = 'Operation timed out') {
  let timeoutHandle;

  const timeout = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutHandle));
}
