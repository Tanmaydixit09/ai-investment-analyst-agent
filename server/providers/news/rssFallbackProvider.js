import Parser from 'rss-parser';
import { INewsProvider } from './INewsProvider.js';

const parser = new Parser();

/**
 * Fixed list of general financial-news RSS feeds used as a last-resort
 * fallback when API-based providers (GNews, NewsAPI) are unavailable or
 * out of quota. These feeds are not per-company — we fetch them and filter
 * client-side by whether the query text appears in the article title.
 */
const FALLBACK_FEEDS = [
  'https://finance.yahoo.com/rss/topfinstories',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
];

/**
 * Last-resort news provider. Parses a fixed set of RSS feeds and filters
 * items by whether the query text (company name or ticker) appears in the
 * title. Coverage is deliberately narrower and less targeted than an API
 * search — this is the fallback of last resort, not a primary source, and
 * that trade-off is worth stating plainly rather than dressing it up.
 */
export class RssFallbackProvider extends INewsProvider {
  async getNews(query, options = {}) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('RssFallbackProvider.getNews: query must be a non-empty string.');
    }

    const limit = options.limit ?? 5;
    const normalizedQuery = query.trim().toLowerCase();

    const allItems = [];
    for (const feedUrl of FALLBACK_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        allItems.push(...(feed.items ?? []));
      } catch (cause) {
        // One dead/unreachable feed shouldn't take down the whole fallback —
        // log it and continue with whatever feeds did succeed.
        console.warn(`RssFallbackProvider.getNews: failed to parse feed "${feedUrl}": ${cause.message}`);
      }
    }

    const matched = allItems
      .filter((item) => (item.title ?? '').toLowerCase().includes(normalizedQuery))
      .slice(0, limit)
      .map((item) => ({
        title: item.title,
        url: item.link,
        source: item.creator || item.author || 'RSS Feed',
        publishedAt: item.pubDate || item.isoDate || null,
      }));

    if (matched.length === 0) {
      throw new Error(
        `RssFallbackProvider.getNews: no matching articles found for "${query}" across ${FALLBACK_FEEDS.length} fallback feeds.`
      );
    }

    return matched;
  }
}
