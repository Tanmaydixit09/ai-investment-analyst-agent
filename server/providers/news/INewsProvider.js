/**
 * Abstract interface for news providers.
 *
 * Normalizes different vendors' article shapes (GNews, NewsAPI, RSS feeds all
 * return different field names) into one stable contract. Deliberately does
 * NOT include sentiment tagging — that's rule-based business logic that
 * belongs in the service layer (newsService.js, built in a later step), not
 * something a provider should be responsible for. A provider's only job is
 * "get me articles about X," normalized.
 */
export class INewsProvider {
  constructor() {
    if (new.target === INewsProvider) {
      throw new Error('INewsProvider is an interface and cannot be instantiated directly.');
    }
  }

  /**
   * Fetch recent news articles matching a query (typically a company name or ticker).
   *
   * @param {string} query
   * @param {{limit?: number}} [options]
   * @returns {Promise<Array<{title: string, url: string, source: string, publishedAt: string|null}>>}
   * @throws {Error} if the provider cannot retrieve any articles
   */
  async getNews(query, options = {}) {
    throw new Error(`${this.constructor.name} must implement getNews().`);
  }
}
