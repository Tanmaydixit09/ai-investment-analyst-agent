/**
 * Abstract interface for financial data providers.
 *
 * JavaScript has no native `interface` keyword, so this is the standard
 * idiomatic approximation: an abstract base class whose constructor refuses
 * direct instantiation, and whose methods throw unless overridden by a
 * subclass. Concrete providers (e.g. YahooFinanceProvider) extend this and
 * implement every method.
 *
 * The value of this interface is NOT "three method names" — it's the
 * *normalized return shape* every implementation must produce, regardless of
 * how wildly different the underlying vendor's raw response looks. Yahoo
 * Finance returns fields like `regularMarketPrice` and `trailingPE`; Alpha
 * Vantage would return completely different field names. Callers (the future
 * financialDataService.js) only ever see the shapes documented below.
 */
export class IFinancialDataProvider {
  constructor() {
    if (new.target === IFinancialDataProvider) {
      throw new Error('IFinancialDataProvider is an interface and cannot be instantiated directly.');
    }
  }

  /**
   * Resolve a free-text company name to a stock ticker. Deliberately NOT
   * delegated to the LLM — guessing a ticker from a name is exactly the kind
   * of small, easy-to-overlook hallucination risk this project is designed
   * to avoid (see architecture-spec.md Section 4).
   *
   * @param {string} companyName - e.g. "Apple"
   * @returns {Promise<{ticker: string, name: string, exchange: string}>}
   * @throws {Error} if no matching company is found, or the lookup fails
   */
  async resolveTicker(companyName) {
    throw new Error(`${this.constructor.name} must implement resolveTicker().`);
  }

  /**
   * Fetch a real-time (or last-known) quote for a ticker.
   *
   * @param {string} ticker - e.g. "AAPL"
   * @returns {Promise<{ticker: string, price: number|null, change: number|null, changePercent: number|null, marketCap: number|null, currency: string}>}
   * @throws {Error} if the ticker is invalid or the quote cannot be fetched
   */
  async getQuote(ticker) {
    throw new Error(`${this.constructor.name} must implement getQuote().`);
  }

  /**
   * Fetch fundamental metrics used by the Investment Scoring Service.
   * Individual fields may legitimately be `null` (not every company reports
   * every metric), but the call itself throws if no data could be retrieved
   * at all — the caller should never receive an empty object and mistake it
   * for "the company has no fundamentals."
   *
   * @param {string} ticker - e.g. "AAPL"
   * @returns {Promise<{peRatio: number|null, debtToEquity: number|null, revenueGrowth: number|null, profitMargins: number|null, marketCap: number|null}>}
   * @throws {Error} if fundamentals cannot be fetched at all
   */
  async getFundamentals(ticker) {
    throw new Error(`${this.constructor.name} must implement getFundamentals().`);
  }
}
