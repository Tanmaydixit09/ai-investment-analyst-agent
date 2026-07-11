import { RECOMMENDATION_THRESHOLDS } from '../config/index.js';
import { calculateScore } from './investmentScoringService.js';

/**
 * Maps a numeric score to a recommendation label via fixed thresholds. Split
 * out as its own pure function (rather than inlined in getRecommendation)
 * so the threshold boundaries themselves are directly unit-testable without
 * needing fundamentals values that happen to produce an exact score.
 *
 * @param {number} score - 0-100
 * @returns {'BUY'|'HOLD'|'SELL'}
 */
export function scoreToRecommendation(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    throw new Error('recommendationService.scoreToRecommendation: score must be a number.');
  }
  if (score >= RECOMMENDATION_THRESHOLDS.buyMin) return 'BUY';
  if (score >= RECOMMENDATION_THRESHOLDS.holdMin) return 'HOLD';
  return 'SELL';
}

/**
 * Consumes investmentScoringService to compute the score, then applies
 * scoreToRecommendation. Deterministic, no AI, no randomness, no provider
 * access — this function's only inputs are the fundamentals object passed
 * in and the fixed thresholds from config/constants.js. Returns ONLY the
 * label; the score/confidence/breakdown are available separately by calling
 * investmentScoringService.calculateScore() directly if a caller needs them.
 *
 * @param {{peRatio: number|null, revenueGrowth: number|null, profitMargins: number|null, debtToEquity: number|null}} fundamentals
 * @returns {'BUY'|'HOLD'|'SELL'}
 */
export function getRecommendation(fundamentals) {
  const { score } = calculateScore(fundamentals);
  return scoreToRecommendation(score);
}
