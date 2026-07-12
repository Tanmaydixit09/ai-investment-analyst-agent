import { z } from 'zod';
import { GeminiProvider } from '../providers/llm/geminiProvider.js';
import { buildInvestmentPrompt, buildRepairPrompt } from '../prompts/investment/investmentPrompt.js';
import { ERROR_CODES, LLM_MAX_RETRIES } from '../config/index.js';
import { ServiceError } from '../utils/ServiceError.js';

/**
 * Response contract for this node. Deliberately minimal per this step's
 * scope: `{ explanation: string }` only — no recommendation, no confidence,
 * no risks array. Gemini is never asked to produce those here; it only
 * explains a decision that already exists in graph state.
 */
const explanationSchema = z.object({
  explanation: z.string().min(1, 'explanation must be a non-empty string'),
});

// Instantiated once at module load, consistent with the singleton pattern
// used by financialDataService/newsService — a misconfigured GEMINI_API_KEY
// would already have failed at config/env.js load time, before this runs.
const llmProvider = new GeminiProvider();

/**
 * Strips markdown code fences if present. The prompt explicitly instructs
 * "no markdown, no code fences," but real models sometimes wrap JSON in
 * ```json ... ``` anyway — defensively stripping this is cheap and avoids
 * burning a retry attempt on pure formatting noise rather than a genuine
 * content problem.
 */
function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

/**
 * Parses raw LLM text as JSON and validates it against explanationSchema.
 * Throws a plain Error (not ServiceError) on failure — this is an internal
 * helper; only the node function itself decides when to give up and throw
 * the client-facing ServiceError.
 */
function parseAndValidate(rawText) {
  let json;
  try {
    json = JSON.parse(stripMarkdownFences(rawText));
  } catch (cause) {
    throw new Error(`response was not valid JSON: ${cause.message}`);
  }

  const result = explanationSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`response failed schema validation: ${issues}`);
  }

  return result.data;
}

/**
 * LangGraph node: generates a natural-language explanation of the
 * already-decided recommendation via Gemini, validated against a fixed
 * schema, with exactly LLM_MAX_RETRIES retries on validation failure.
 *
 * The `llmProviderOverride` parameter is not used by the graph itself
 * (LangGraph always calls nodes as `node(state)`) — it exists purely so
 * this node can be unit-tested with a fake provider, without needing a
 * real network call to Gemini.
 *
 * @param {{company: string, ticker: string, financials: object, news: Array, score: object, recommendation: string}} state
 * @param {import('../providers/llm/ILLMProvider.js').ILLMProvider} [llmProviderOverride]
 * @returns {Promise<{explanation: string}>}
 * @throws {ServiceError} code LLM_VALIDATION_FAILED — thrown only if every attempt fails
 */
export async function generateExplanationNode(state, llmProviderOverride = llmProvider) {
  const context = {
    company: state.company ?? state.companyName,
    ticker: state.ticker,
    financials: state.financials,
    news: state.news,
    score: state.score,
    recommendation: state.recommendation,
  };

  const totalAttempts = 1 + LLM_MAX_RETRIES; // initial attempt + configured retries
  let lastError;
  let previousRawText = null;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const prompt =
      attempt === 0
        ? buildInvestmentPrompt(context)
        : buildRepairPrompt(context, previousRawText, lastError.message);

    try {
      const rawText = await llmProviderOverride.generateText(prompt);
      previousRawText = rawText;
      const parsed = parseAndValidate(rawText);
      return { explanation: parsed.explanation };
    } catch (cause) {
      lastError = cause;
      console.warn(
        `generateExplanationNode: attempt ${attempt + 1}/${totalAttempts} failed: ${cause.message}`
      );
    }
  }

  throw new ServiceError(
    ERROR_CODES.LLM_VALIDATION_FAILED,
    `Gemini explanation failed validation after ${totalAttempts} attempt(s): ${lastError.message}`,
    lastError
  );
}
