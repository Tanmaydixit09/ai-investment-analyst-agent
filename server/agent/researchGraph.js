import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import * as financialDataService from '../services/financialDataService.js';
import * as newsService from '../services/newsService.js';
import { calculateScore } from '../services/investmentScoringService.js';
import { scoreToRecommendation } from '../services/recommendationService.js';
import { generateExplanationNode } from './generateExplanationNode.js';

/**
 * Graph state schema. Every field below is a "channel" — LangGraph uses the
 * channel names to detect node/channel name collisions, which is why every
 * node function below is named with a `Node` suffix (discovered by testing:
 * LangGraph throws at graph-construction time if a node name matches a
 * channel name).
 *
 * No custom reducers are needed here: every field is written by exactly one
 * node in this graph, so the default "last write wins" behavior is correct
 * — there's no concurrent-write conflict to resolve.
 */
const ResearchState = Annotation.Root({
  company: Annotation(), // raw input, e.g. "Apple"
  ticker: Annotation(),
  companyName: Annotation(), // resolved display name from financialDataService
  exchange: Annotation(),
  quote: Annotation(),
  fundamentals: Annotation(),
  financials: Annotation(), // { quote, fundamentals } — combined in mergeResultsNode
  news: Annotation(),
  newsUnavailable: Annotation(),
  score: Annotation(), // { score, confidence, breakdown }
  recommendation: Annotation(), // 'BUY' | 'HOLD' | 'SELL'
  explanation: Annotation(), // string, from generateExplanationNode (Step 8)
});

/**
 * Resolve the free-text company name to a ticker. Uses financialDataService
 * only — never calls a provider directly, per this step's scope. If
 * resolution fails, the ServiceError propagates and rejects the whole
 * graph invocation; there's nothing meaningful to continue with if we
 * don't know the ticker.
 */
export async function resolveCompanyNode(state) {
  const { ticker, name, exchange } = await financialDataService.resolveTicker(state.company);
  return { ticker, companyName: name, exchange };
}

/**
 * Fetch quote + fundamentals concurrently (both are independent calls to
 * the same service). Errors propagate and reject the graph — no defensible
 * score/recommendation can be produced without fundamentals.
 */
export async function fetchFinancialDataNode(state) {
  const [quote, fundamentals] = await Promise.all([
    financialDataService.getQuote(state.ticker),
    financialDataService.getFundamentals(state.ticker),
  ]);
  return { quote, fundamentals };
}

/**
 * Fetch news via newsService (which already handles its own GNews -> RSS
 * fallback internally). If BOTH of those fail, newsService throws — this
 * node catches that and degrades gracefully to an empty news list rather
 * than failing the whole research request over a news outage.
 */
export async function fetchNewsNode(state) {
  const query = state.companyName || state.company;
  try {
    const news = await newsService.getNews(query, { limit: 5 });
    return { news, newsUnavailable: false };
  } catch (cause) {
    console.warn(`researchGraph.fetchNewsNode: news unavailable for "${query}": ${cause.message}`);
    return { news: [], newsUnavailable: true };
  }
}

/**
 * Runs after BOTH fetchFinancialDataNode and fetchNewsNode complete (fan-in
 * — LangGraph waits for all incoming edges into this node before running
 * it). Not a no-op: combines `quote` + `fundamentals` into the single
 * `financials` object the public output contract requires.
 */
export async function mergeResultsNode(state) {
  return {
    financials: {
      quote: state.quote,
      fundamentals: state.fundamentals,
    },
  };
}

/**
 * Deterministic scoring only — investmentScoringService, no LLM. Scores
 * from `financials.fundamentals`, the shape produced by mergeResultsNode.
 */
export async function scoreInvestmentNode(state) {
  const score = calculateScore(state.financials.fundamentals);
  return { score };
}

/**
 * Deterministic thresholding only. Uses scoreToRecommendation directly
 * (rather than recommendationService.getRecommendation, which would
 * recompute the score) since the score is already in state from the
 * previous node — avoids redundant work.
 */
export async function decideRecommendationNode(state) {
  const recommendation = scoreToRecommendation(state.score.score);
  return { recommendation };
}

/**
 * The compiled, reusable LangGraph workflow. Exported directly so it can be
 * invoked with `.invoke({ company })` by callers that need the full
 * internal state (e.g. for debugging), or wrapped by runResearchWorkflow()
 * below for the public, contract-shaped result.
 *
 * Step 8 adds generateExplanationNode as the final step: Gemini explains
 * the already-decided recommendation, with its own internal retry-once
 * logic (see generateExplanationNode.js) and a ServiceError thrown if both
 * attempts fail. No other graph-level error-recovery/retry edges exist —
 * a rejected promise from any node (other than fetchNewsNode, which
 * degrades gracefully) propagates up to whatever calls .invoke(), to be
 * handled by the controller layer (Step 9).
 */
export const researchGraph = new StateGraph(ResearchState)
  .addNode('resolveCompanyNode', resolveCompanyNode)
  .addNode('fetchFinancialDataNode', fetchFinancialDataNode)
  .addNode('fetchNewsNode', fetchNewsNode)
  .addNode('mergeResultsNode', mergeResultsNode)
  .addNode('scoreInvestmentNode', scoreInvestmentNode)
  .addNode('decideRecommendationNode', decideRecommendationNode)
  .addNode('generateExplanationNode', generateExplanationNode)
  .addEdge(START, 'resolveCompanyNode')
  .addEdge('resolveCompanyNode', 'fetchFinancialDataNode')
  .addEdge('resolveCompanyNode', 'fetchNewsNode')
  .addEdge('fetchFinancialDataNode', 'mergeResultsNode')
  .addEdge('fetchNewsNode', 'mergeResultsNode')
  .addEdge('mergeResultsNode', 'scoreInvestmentNode')
  .addEdge('scoreInvestmentNode', 'decideRecommendationNode')
  .addEdge('decideRecommendationNode', 'generateExplanationNode')
  .addEdge('generateExplanationNode', END)
  .compile();

/**
 * Convenience wrapper: runs the graph and maps its (larger, bookkeeping-
 * heavy) internal state down to the public output contract. Keeps internal
 * fields like `quote`, `fundamentals` (pre-merge), and `exchange` out of
 * the shape callers depend on.
 *
 * @param {string} companyName - free-text company name, e.g. "Apple"
 * @returns {Promise<{company: string, ticker: string, financials: object, news: Array, score: object, recommendation: string, explanation: string}>}
 */
export async function runResearchWorkflow(companyName) {
  const finalState = await researchGraph.invoke({ company: companyName });

  return {
    company: finalState.companyName,
    ticker: finalState.ticker,
    financials: finalState.financials,
    news: finalState.news,
    score: finalState.score,
    recommendation: finalState.recommendation,
    explanation: finalState.explanation,
  };
}
