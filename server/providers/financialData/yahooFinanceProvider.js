import yahooFinance from 'yahoo-finance2';
import { IFinancialDataProvider } from './IFinancialDataProvider.js';

const COMPANY_TICKERS = {
  apple: { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  microsoft: { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  tesla: { ticker: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ" },
  amazon: { ticker: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ" },
  google: { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  alphabet: { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  meta: { ticker: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ" },
  nvidia: { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
};

/**
 * Concrete financial data provider backed by Yahoo Finance (via the
 * unofficial `yahoo-finance2` package).
 *
 * Important, verified constraint: this provider is PINNED to
 * `yahoo-finance2@2.11.3` in package.json (not a caret range). While
 * scaffolding this file, `npm install` on a caret range resolved to
 * `2.14.0`, which ships without the `search` and `quoteSummary` modules
 * entirely (confirmed by inspecting the installed package — only `quote`
 * and a deprecated `autoc` are wired up in that release). This is a live
 * example of exactly the risk flagged in architecture-spec.md: Yahoo
 * Finance has no official API, endpoints get deprecated, and community
 * packages change shape under you. Pinning the exact version is the
 * mitigation; swapping to a paid, SLA-backed provider (Alpha Vantage,
 * Finnhub) behind this same interface is the longer-term fix.
 */
export class YahooFinanceProvider extends IFinancialDataProvider {
  async resolveTicker(companyName) {
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      throw new Error('YahooFinanceProvider.resolveTicker: companyName must be a non-empty string.');
    }

    let searchResult;
    try {
      searchResult = await yahooFinance.search(companyName.trim());
    } 
    catch (cause) {
  const message = cause?.message || "";

  if (message.includes("Too Many Requests")) {
    const fallback =
      COMPANY_TICKERS[companyName.trim().toLowerCase()];

    if (fallback) {
      return fallback;
    }
  }

  throw new Error(
    `YahooFinanceProvider.resolveTicker: search request failed for "${companyName}": ${message}`
  );
}

    const bestMatch = searchResult?.quotes?.find(
      (q) => q.symbol && q.quoteType === 'EQUITY'
    );

    if (!bestMatch) {
      throw new Error(
        `YahooFinanceProvider.resolveTicker: no matching publicly-traded company found for "${companyName}".`
      );
    }

    return {
      ticker: bestMatch.symbol,
      name: bestMatch.shortname || bestMatch.longname || companyName,
      exchange: bestMatch.exchange || 'UNKNOWN',
    };
  }

  async getQuote(ticker) {
    if (!ticker || typeof ticker !== 'string') {
      throw new Error('YahooFinanceProvider.getQuote: ticker must be a non-empty string.');
    }

    let quote;
    try {
      quote = await yahooFinance.quote(ticker);
    } catch (cause) {
      throw new Error(`YahooFinanceProvider.getQuote: failed to fetch quote for "${ticker}": ${cause.message}`);
    }

    if (!quote) {
      throw new Error(`YahooFinanceProvider.getQuote: no quote data returned for "${ticker}".`);
    }

    return {
      ticker,
      price: quote.regularMarketPrice ?? null,
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      marketCap: quote.marketCap ?? null,
      currency: quote.currency ?? 'USD',
    };
  }

  async getFundamentals(ticker) {
    if (!ticker || typeof ticker !== 'string') {
      throw new Error('YahooFinanceProvider.getFundamentals: ticker must be a non-empty string.');
    }

    let summary;
    try {
      summary = await yahooFinance.quoteSummary(ticker, {
        modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail'],
      });
    } catch (cause) {
      throw new Error(
        `YahooFinanceProvider.getFundamentals: failed to fetch fundamentals for "${ticker}": ${cause.message}`
      );
    }

    if (!summary) {
      throw new Error(`YahooFinanceProvider.getFundamentals: no fundamentals data returned for "${ticker}".`);
    }

    return {
      peRatio: summary.summaryDetail?.trailingPE ?? summary.defaultKeyStatistics?.trailingPE ?? null,
      debtToEquity: summary.financialData?.debtToEquity ?? null,
      revenueGrowth: summary.financialData?.revenueGrowth ?? null,
      profitMargins: summary.financialData?.profitMargins ?? null,
      marketCap: summary.summaryDetail?.marketCap ?? summary.defaultKeyStatistics?.marketCap ?? null,
    };
  }
}
