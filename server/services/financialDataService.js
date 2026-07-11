import { PROVIDERS, PROVIDER_TIMEOUTS_MS, ERROR_CODES } from '../config/index.js';
import { YahooFinanceProvider } from '../providers/financialData/yahooFinanceProvider.js';
import { withTimeout } from '../utils/withTimeout.js';
import { ServiceError } from '../utils/ServiceError.js';

/**
 * Selects the concrete IFinancialDataProvider implementation based on
 * config/providers.js. This is the ONLY place in the codebase that knows
 * concrete provider class names — everything else in the app (tools, graph
 * nodes, controllers) calls the functions exported below and never touches
 * a provider class directly.
 *
 * Swapping providers later (e.g. Yahoo -> Alpha Vantage) means: add
 * `alphaVantageProvider.js` implementing IFinancialDataProvider, add a case
 * here, and change `PROVIDERS.financial` in config/providers.js. Nothing
 * else in the codebase changes.
 *
 * @returns {import('../providers/financialData/IFinancialDataProvider.js').IFinancialDataProvider}
 */
function createProvider() {
  switch (PROVIDERS.financial) {
    case 'yahoo':
      return new YahooFinanceProvider();
    default:
      throw new Error(
        `financialDataService: unknown financial provider "${PROVIDERS.financial}" configured in config/providers.js.`
      );
  }
}

// Instantiated once at module load, not per-request. A misconfigured
// provider name (e.g. a typo after adding a new provider) fails immediately
// when the server starts, rather than surfacing confusingly on a user's
// first request — the same fail-fast principle used in config/env.js.
const provider = createProvider();

/**
 * Resolve a free-text company name to a ticker.
 *
 * @param {string} companyName
 * @returns {Promise<{ticker: string, name: string, exchange: string}>}
 * @throws {ServiceError} code COMPANY_NOT_FOUND — covers "no match" and
 *   "provider unreachable/timed out" alike. Distinguishing those precisely
 *   would require the provider to throw typed errors rather than plain
 *   `Error` — a reasonable future improvement, not built now to avoid
 *   over-engineering a single call site.
 */
export async function resolveTicker(companyName) {
  try {
    return await withTimeout(
      provider.resolveTicker(companyName),
      PROVIDER_TIMEOUTS_MS.financialDataMs,
      `Ticker resolution timed out for "${companyName}"`
    );
  } catch (cause) {
    throw new ServiceError(
      ERROR_CODES.COMPANY_NOT_FOUND,
      `Could not resolve company "${companyName}": ${cause.message}`,
      cause
    );
  }
}

/**
 * Fetch a quote for a resolved ticker.
 *
 * @param {string} ticker
 * @returns {Promise<{ticker: string, price: number|null, change: number|null, changePercent: number|null, marketCap: number|null, currency: string}>}
 * @throws {ServiceError} code DATA_UNAVAILABLE
 */
export async function getQuote(ticker) {
  try {
    return await withTimeout(
      provider.getQuote(ticker),
      PROVIDER_TIMEOUTS_MS.financialDataMs,
      `Quote fetch timed out for "${ticker}"`
    );
  } catch (cause) {
    throw new ServiceError(
      ERROR_CODES.DATA_UNAVAILABLE,
      `Could not fetch quote for "${ticker}": ${cause.message}`,
      cause
    );
  }
}

/**
 * Fetch fundamentals for a resolved ticker.
 *
 * @param {string} ticker
 * @returns {Promise<{peRatio: number|null, debtToEquity: number|null, revenueGrowth: number|null, profitMargins: number|null, marketCap: number|null}>}
 * @throws {ServiceError} code DATA_UNAVAILABLE
 */
export async function getFundamentals(ticker) {
  try {
    return await withTimeout(
      provider.getFundamentals(ticker),
      PROVIDER_TIMEOUTS_MS.financialDataMs,
      `Fundamentals fetch timed out for "${ticker}"`
    );
  } catch (cause) {
    throw new ServiceError(
      ERROR_CODES.DATA_UNAVAILABLE,
      `Could not fetch fundamentals for "${ticker}": ${cause.message}`,
      cause
    );
  }
}
