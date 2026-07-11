import { INewsProvider } from './INewsProvider.js';
import { env } from '../../config/index.js';

const GNEWS_SEARCH_URL = 'https://gnews.io/api/v4/search';

/**
 * Primary news provider, backed by the GNews REST API. Uses Node's built-in
 * global `fetch` (available since Node 18) rather than adding an HTTP client
 * dependency for a single GET request.
 */
export class GNewsProvider extends INewsProvider {
  async getNews(query, options = {}) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('GNewsProvider.getNews: query must be a non-empty string.');
    }

    if (!env.GNEWS_API_KEY) {
      throw new Error('GNewsProvider.getNews: GNEWS_API_KEY is not configured.');
    }

    const limit = options.limit ?? 5;
    const url = `${GNEWS_SEARCH_URL}?q=${encodeURIComponent(query)}&max=${limit}&token=${env.GNEWS_API_KEY}`;

    let response;
    try {
      response = await fetch(url);
    } catch (cause) {
      throw new Error(`GNewsProvider.getNews: network request failed for "${query}": ${cause.message}`);
    }

    if (!response.ok) {
      throw new Error(`GNewsProvider.getNews: GNews API returned HTTP ${response.status} for "${query}".`);
    }

    let data;
    try {
      data = await response.json();
    } catch (cause) {
      throw new Error(`GNewsProvider.getNews: failed to parse GNews response for "${query}": ${cause.message}`);
    }

    if (!Array.isArray(data.articles)) {
      throw new Error(`GNewsProvider.getNews: unexpected response shape from GNews for "${query}".`);
    }

    if (data.articles.length === 0) {
      throw new Error(`GNewsProvider.getNews: no articles found for "${query}".`);
    }

    return data.articles.map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source?.name ?? 'Unknown',
      publishedAt: article.publishedAt ?? null,
    }));
  }
}
