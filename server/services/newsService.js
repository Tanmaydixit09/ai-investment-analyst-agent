import { PROVIDERS, PROVIDER_TIMEOUTS_MS, ERROR_CODES } from '../config/index.js';
import { GNewsProvider } from '../providers/news/gnewsProvider.js';
import { RssFallbackProvider } from '../providers/news/rssFallbackProvider.js';
import { withTimeout } from '../utils/withTimeout.js';
import { ServiceError } from '../utils/ServiceError.js';

/**
 * Selects the primary INewsProvider implementation based on
 * config/providers.js. Mirrors the factory pattern used in
 * financialDataService.js. Only 'gnews' exists as a case today — a
 * `newsApiProvider.js` was described in the architecture doc but was never
 * actually implemented in step 3; adding it later means creating that file
 * and adding one case here, nothing else changes.
 *
 * @returns {import('../providers/news/INewsProvider.js').INewsProvider}
 */
function createPrimaryProvider() {
  switch (PROVIDERS.news) {
    case 'gnews':
      return new GNewsProvider();
    default:
      throw new Error(
        `newsService: unknown news provider "${PROVIDERS.news}" configured in config/providers.js.`
      );
  }
}

// Instantiated once at module load — same fail-fast reasoning as
// financialDataService.js. The RSS fallback is NOT selected via
// config/providers.js: it's a fixed last-resort, not a swappable "active"
// provider, so it's constructed directly rather than through the factory.
const primaryProvider = createPrimaryProvider();
const fallbackProvider = new RssFallbackProvider();

/**
 * Fetch recent news for a query (company name or ticker), trying the
 * primary provider first and falling back to RSS if it fails or times out.
 *
 * @param {string} query
 * @param {{limit?: number}} [options]
 * @returns {Promise<Array<{title: string, url: string, source: string, publishedAt: string|null}>>}
 * @throws {ServiceError} code NEWS_UNAVAILABLE — thrown only if BOTH the
 *   primary provider and the RSS fallback fail.
 */
export async function getNews(query, options = {}) {
  try {
    return await withTimeout(
      primaryProvider.getNews(query, options),
      PROVIDER_TIMEOUTS_MS.newsMs,
      `News fetch timed out for "${query}"`
    );
  } catch (primaryError) {
    console.warn(
      `newsService: primary provider failed for "${query}" (${primaryError.message}). Falling back to RSS.`
    );

    try {
      return await withTimeout(
        fallbackProvider.getNews(query, options),
        PROVIDER_TIMEOUTS_MS.newsMs,
        `RSS fallback news fetch timed out for "${query}"`
      );
    } catch (fallbackError) {
      throw new ServiceError(
        ERROR_CODES.NEWS_UNAVAILABLE,
        `Could not fetch news for "${query}" from any provider: ${fallbackError.message}`,
        fallbackError
      );
    }
  }
}
