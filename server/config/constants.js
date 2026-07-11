/**
 * Fixed business-logic constants.
 *
 * Distinction from env.js: values here should NOT vary between environments
 * (dev/staging/prod) — they're properties of the domain logic itself (how
 * scoring is weighted, what counts as a BUY). Values that legitimately differ
 * per environment (ports, TTLs, rate limits) live in env.js instead. Mixing
 * the two would make it unclear, six months from now, whether changing a
 * number requires a deploy config change or a code change.
 */

/**
 * Weights used to combine individual sub-scores into the overall investment
 * score. Must sum to 1 — enforced by a check in investmentScoringService,
 * not here, since this file holds data, not logic.
 * @type {Readonly<{growth: number, financialHealth: number, risk: number, sentiment: number, marketPosition: number}>}
 */
export const SCORE_WEIGHTS = Object.freeze({
  growth: 0.25,
  financialHealth: 0.25,
  risk: 0.2,
  sentiment: 0.15,
  marketPosition: 0.15,
});

/**
 * Fixed thresholds mapping an overall score (0-100) to a recommendation
 * label. Decided in code (recommendationService), never by the LLM — see
 * architecture-spec.md Section 5.
 * @type {Readonly<{buyMin: number, holdMin: number}>}
 */
export const RECOMMENDATION_THRESHOLDS = Object.freeze({
  /** overallScore >= buyMin -> BUY */
  buyMin: 80,
  /** holdMin <= overallScore < buyMin -> HOLD; overallScore < holdMin -> SELL */
  holdMin: 60,
});

/**
 * How many times the LLM explanation step will be retried after a Zod
 * validation failure before giving up and returning a structured error.
 * @type {number}
 */
export const LLM_MAX_RETRIES = 1;

/**
 * Timeout (ms) applied to outbound calls to external data providers
 * (financial data, news). Prevents a single slow/hanging provider from
 * stalling the whole request pipeline.
 * @type {Readonly<{financialDataMs: number, newsMs: number, llmMs: number}>}
 */
export const PROVIDER_TIMEOUTS_MS = Object.freeze({
  financialDataMs: 8000,
  newsMs: 8000,
  llmMs: 15000,
});

/**
 * Confidence bands used to translate "distance from a threshold boundary"
 * into a human-facing confidence number, keeping confidence derived from
 * the score rather than stated arbitrarily by the LLM. See
 * recommendationService / architecture-spec.md Section 7.
 * @type {Readonly<{high: number, medium: number, low: number}>}
 */
export const CONFIDENCE_BANDS = Object.freeze({
  /** Score is >= 15 points past the nearest threshold boundary. */
  high: 0.9,
  /** Score is 5-15 points past the nearest threshold boundary. */
  medium: 0.7,
  /** Score is within 5 points of a threshold boundary. */
  low: 0.5,
});
