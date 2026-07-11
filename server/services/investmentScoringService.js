import { SCORE_WEIGHTS } from '../config/index.js';

/**
 * Pure deterministic scoring over four fundamentals metrics. No LLM calls,
 * no external API calls — this module only does arithmetic on numbers it's
 * handed. That's the whole point: the LLM (wired in a later step) explains
 * this score, it never computes or overrides it.
 *
 * Each `score*` function maps one raw metric onto a 0-100 sub-score using a
 * simple, transparent linear formula with a named "ideal" target — these are
 * intentionally simple heuristics reasonable for a demo/portfolio project,
 * not a real quantitative model. That trade-off is worth stating plainly if
 * asked, rather than dressing the formulas up as more rigorous than they are.
 */

/** Clamp a number into [min, max]. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * P/E ratio: a "healthy" band (10-20) scores highest; very high valuations
 * are penalized, very low/negative PE (often means no or negative earnings)
 * is penalized too, since it isn't automatically a bargain.
 */
const PE_IDEAL_MIN = 10;
const PE_IDEAL_MAX = 20;
function scorePeRatio(peRatio) {
  if (peRatio === null || peRatio === undefined) return null;
  if (peRatio <= 0) return 20; // unprofitable on a trailing basis
  if (peRatio >= PE_IDEAL_MIN && peRatio <= PE_IDEAL_MAX) return 100;
  if (peRatio < PE_IDEAL_MIN) return clamp(100 - (PE_IDEAL_MIN - peRatio) * 4, 0, 100);
  return clamp(100 - (peRatio - PE_IDEAL_MAX) * 2, 0, 100);
}

/**
 * Revenue growth (fraction, e.g. 0.15 = 15%): 0% growth is neutral (50),
 * scaling up to 100 at +20% and down to 0 at -20%.
 */
function scoreRevenueGrowth(revenueGrowth) {
  if (revenueGrowth === null || revenueGrowth === undefined) return null;
  const pct = revenueGrowth * 100;
  return clamp(50 + pct * 2.5, 0, 100);
}

/**
 * Profit margin (fraction, e.g. 0.25 = 25%): scales linearly to 100 at a
 * 25% margin; negative margins floor at 0.
 */
function scoreProfitMargin(profitMargins) {
  if (profitMargins === null || profitMargins === undefined) return null;
  const pct = profitMargins * 100;
  return clamp(pct * 4, 0, 100);
}

/**
 * Debt-to-equity (Yahoo's raw scale, e.g. 150 means D/E of 1.5x): lower
 * leverage scores higher. 0 -> 100, ~250+ -> 0.
 */
function scoreDebtToEquity(debtToEquity) {
  if (debtToEquity === null || debtToEquity === undefined) return null;
  return clamp(100 - debtToEquity * 0.4, 0, 100);
}

/**
 * Maps each internal metric key to the corresponding raw field name on the
 * fundamentals object returned by financialDataService.getFundamentals()
 * (built in Step 4) — the raw field is "profitMargins" (plural, matching
 * Yahoo's field name), while the metric/weight key here is "profitMargin"
 * (singular, matching this step's requirement naming). Kept as an explicit
 * map rather than relying on the names matching, since they don't.
 */
const RAW_FIELD_MAP = {
  peRatio: 'peRatio',
  revenueGrowth: 'revenueGrowth',
  profitMargin: 'profitMargins',
  debtToEquity: 'debtToEquity',
};

const SCORERS = {
  peRatio: scorePeRatio,
  revenueGrowth: scoreRevenueGrowth,
  profitMargin: scoreProfitMargin,
  debtToEquity: scoreDebtToEquity,
};

/**
 * Calculate an overall investment score (0-100) from fundamentals, using
 * SCORE_WEIGHTS from config/constants.js.
 *
 * Missing metrics (null/undefined) are EXCLUDED from the weighted average
 * and the remaining weights are renormalized — a missing metric is treated
 * as "unknown," not as "zero," so incomplete data doesn't unfairly drag the
 * score down. `confidence` reports how much of the metric set was actually
 * available (data completeness), separate from the score itself.
 *
 * @param {{peRatio: number|null, revenueGrowth: number|null, profitMargins: number|null, debtToEquity: number|null}} fundamentals
 * @returns {{score: number, confidence: number, breakdown: Object}}
 * @throws {Error} if fundamentals is missing or every metric is unavailable
 */
export function calculateScore(fundamentals) {
  if (!fundamentals || typeof fundamentals !== 'object') {
    throw new Error('investmentScoringService.calculateScore: a fundamentals object is required.');
  }

  const metricKeys = Object.keys(SCORE_WEIGHTS);
  const breakdown = {};
  let weightedSum = 0;
  let weightUsed = 0;
  let availableCount = 0;

  for (const key of metricKeys) {
    const rawField = RAW_FIELD_MAP[key];
    const rawValue = fundamentals[rawField] ?? null;
    const subScore = SCORERS[key](rawValue);
    const weight = SCORE_WEIGHTS[key];

    breakdown[key] = { rawValue, subScore, weight };

    if (subScore !== null) {
      weightedSum += subScore * weight;
      weightUsed += weight;
      availableCount += 1;
    }
  }

  if (weightUsed === 0) {
    throw new Error(
      'investmentScoringService.calculateScore: none of the required fundamentals metrics were available.'
    );
  }

  const score = Math.round(weightedSum / weightUsed);
  const confidence = Number((availableCount / metricKeys.length).toFixed(2));

  return { score, confidence, breakdown };
}
