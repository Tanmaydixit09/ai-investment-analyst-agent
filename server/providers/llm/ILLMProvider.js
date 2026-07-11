/**
 * Abstract interface for LLM providers.
 *
 * Deliberately minimal: a provider's only job is "send text in, get text
 * back." Prompt construction (prompts/), JSON parsing, and Zod validation
 * (validators/) all live OUTSIDE this interface, in later layers. That
 * separation is exactly what makes swapping Gemini for Claude or OpenAI
 * later a one-file change — no calling code needs to know how any particular
 * vendor structures its request/response.
 */
export class ILLMProvider {
  constructor() {
    if (new.target === ILLMProvider) {
      throw new Error('ILLMProvider is an interface and cannot be instantiated directly.');
    }
  }

  /**
   * Send a fully-constructed prompt to the model and return its raw text response.
   *
   * @param {string} prompt
   * @returns {Promise<string>}
   * @throws {Error} if the call fails, times out, or returns no content
   */
  async generateText(prompt) {
    throw new Error(`${this.constructor.name} must implement generateText().`);
  }

  /**
   * Identifying model name/version, surfaced in API response execution
   * metadata (see architecture-spec.md Section 14).
   *
   * @returns {string}
   */
  getModelName() {
    throw new Error(`${this.constructor.name} must implement getModelName().`);
  }
}
