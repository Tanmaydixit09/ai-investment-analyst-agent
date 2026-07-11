import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ILLMProvider } from './ILLMProvider.js';
import { env } from '../../config/index.js';

/**
 * Concrete LLM provider backed by Google's Gemini API, via LangChain.js's
 * `@langchain/google-genai` integration. Using LangChain's chat model wrapper
 * here (rather than the raw Google SDK) keeps this provider's shape
 * consistent with how it will be invoked from within the LangGraph pipeline
 * in a later step.
 */
export class GeminiProvider extends ILLMProvider {
  constructor() {
    super();
    this._model = new ChatGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
    });
  }

  async generateText(prompt) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('GeminiProvider.generateText: prompt must be a non-empty string.');
    }

    let response;
    try {
      response = await this._model.invoke(prompt);
    } catch (cause) {
      throw new Error(`GeminiProvider.generateText: Gemini call failed: ${cause.message}`);
    }

    const text = typeof response?.content === 'string' ? response.content : null;

    if (!text) {
      throw new Error('GeminiProvider.generateText: Gemini returned no usable text content.');
    }

    return text;
  }

  getModelName() {
    return env.GEMINI_MODEL;
  }
}
