/**
 * Builds prompts for the Gemini explanation step. Gemini's ONLY job is to
 * explain a recommendation that deterministic code has already produced —
 * it never sees a "decide the recommendation" instruction anywhere in this
 * file, and it's explicitly told the recommendation is fixed and not to be
 * second-guessed. This file only builds prompt text; sending it to Gemini
 * and validating the response happens in generateExplanationNode.js.
 */

function formatFinancials(financials) {
  const { quote, fundamentals } = financials ?? {};
  const lines = [];

  if (quote) {
    lines.push(`Price: ${quote.price ?? 'unknown'} ${quote.currency ?? ''}`.trim());
    lines.push(`Change: ${quote.change ?? 'unknown'} (${quote.changePercent ?? 'unknown'}%)`);
    lines.push(`Market Cap: ${quote.marketCap ?? 'unknown'}`);
  }
  if (fundamentals) {
    lines.push(`P/E Ratio: ${fundamentals.peRatio ?? 'unavailable'}`);
    lines.push(`Revenue Growth: ${fundamentals.revenueGrowth ?? 'unavailable'}`);
    lines.push(`Profit Margin: ${fundamentals.profitMargins ?? 'unavailable'}`);
    lines.push(`Debt-to-Equity: ${fundamentals.debtToEquity ?? 'unavailable'}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No financial metrics were available.';
}

function formatNews(news) {
  if (!Array.isArray(news) || news.length === 0) {
    return 'No recent news headlines were available.';
  }
  return news
    .slice(0, 5)
    .map((item, i) => `${i + 1}. "${item.title}" (source: ${item.source})`)
    .join('\n');
}

function formatScore(score) {
  if (!score) return 'unavailable';
  const breakdownLines = Object.entries(score.breakdown ?? {}).map(
    ([key, detail]) =>
      `  - ${key}: value=${detail.rawValue ?? 'n/a'}, subScore=${detail.subScore ?? 'n/a'}, weight=${detail.weight}`
  );
  return [
    `Overall score: ${score.score}/100 (data completeness: ${score.confidence})`,
    ...breakdownLines,
  ].join('\n');
}

/**
 * @param {{company: string, ticker: string, financials: object, news: Array, score: object, recommendation: string}} context
 * @returns {string}
 */
export function buildInvestmentPrompt({ company, ticker, financials, news, score, recommendation }) {
  return `You are a financial explanation assistant. A separate, deterministic system has ALREADY calculated an investment score and a recommendation for this company using fixed, rule-based logic. Your ONLY job is to explain that existing decision in plain language. You do not calculate anything, and you do not decide or change the recommendation.

Company: ${company}
Ticker: ${ticker}

Financial Metrics:
${formatFinancials(financials)}

Recent News Headlines:
${formatNews(news)}

Deterministic Score:
${formatScore(score)}

Deterministic Recommendation (already decided — do not change this): ${recommendation}

Instructions:
- Explain WHY this recommendation (${recommendation}) was produced, based on the metrics and score above.
- Mention specific strengths supporting the recommendation.
- Mention specific risks or weaknesses.
- Reference the financial metrics provided above by name.
- Reference the recent news headlines above if they are relevant to the explanation.
- Do NOT invent, estimate, or guess any number that was not provided above.
- Do NOT change, contradict, or second-guess the recommendation (${recommendation}) — treat it as fixed and final.
- Do NOT output markdown of any kind (no headers, no bullet points, no asterisks, no code fences).
- Respond with ONLY a single JSON object, no other text before or after it, matching exactly this shape:
{"explanation": "your explanation text as a single plain-text string"}`;
}

/**
 * Retry/repair variant sent only after the first response fails validation.
 * Includes the original prompt plus the previous (invalid) response and the
 * specific validation error, so Gemini can correct its own mistake rather
 * than repeating it blindly.
 *
 * @param {{company: string, ticker: string, financials: object, news: Array, score: object, recommendation: string}} context
 * @param {string|null} previousRawText - Gemini's previous, invalid response
 * @param {string} validationErrorMessage
 * @returns {string}
 */
export function buildRepairPrompt(context, previousRawText, validationErrorMessage) {
  const basePrompt = buildInvestmentPrompt(context);
  return `${basePrompt}

Your previous response could not be used because: ${validationErrorMessage}

Your previous response was:
${previousRawText ?? '(no response was returned)'}

Respond again with ONLY a single valid JSON object of the exact shape {"explanation": "..."}, with no markdown, no code fences, and no extra text before or after the JSON.`;
}
