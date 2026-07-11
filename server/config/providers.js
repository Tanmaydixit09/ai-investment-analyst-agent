/**
 * Declares which concrete provider implementation is "active" for each
 * swappable category. Services import from here rather than hardcoding a
 * vendor name — swapping Yahoo Finance for Alpha Vantage, or Gemini for
 * Claude/OpenAI later, means changing one value here plus adding the new
 * provider file, not touching any calling code.
 *
 * @type {Readonly<{financial: string, news: string, llm: string}>}
 */
export const PROVIDERS = Object.freeze({
  /** Active financial data provider. See providers/financialData/. */
  financial: 'yahoo',
  /** Active primary news provider. See providers/news/ (falls back automatically). */
  news: 'gnews',
  /** Active LLM provider. See providers/llm/. */
  llm: 'gemini',
});
