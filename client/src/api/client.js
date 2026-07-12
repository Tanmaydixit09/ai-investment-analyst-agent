import axios from 'axios';

/**
 * Single Axios instance for the whole app. Every API call goes through
 * this, rather than components importing axios directly — one place to
 * change the base URL, add auth headers later, or add interceptors.
 *
 * Base URL points directly at the Express server (http://localhost:4000/api)
 * per this step's spec, rather than the '/api' relative path the Vite dev
 * proxy (vite.config.js, from Step 1) was set up to handle. Both work for
 * local development; this points at the backend explicitly.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Runs the full research workflow for a company name.
 *
 * @param {string} company - free-text company name, e.g. "Apple"
 * @returns {Promise<{company: string, ticker: string, financials: object, news: Array, score: object, recommendation: string, explanation: string}>}
 * @throws {Error} with a `.userMessage` property suitable for display, on any failure
 */
export async function fetchResearch(company) {
  try {
    const response = await apiClient.post('/research', { company });
    return response.data.data;
  } catch (err) {
    const backendMessage = err.response?.data?.error?.message;
    const wrapped = new Error(backendMessage || err.message || 'The request failed.');
    wrapped.userMessage =
      backendMessage ||
      (err.code === 'ECONNABORTED'
        ? 'The request took too long. Try again in a moment.'
        : 'Could not reach the research service. Check that the backend is running.');
    wrapped.code = err.response?.data?.error?.code ?? null;
    throw wrapped;
  }
}

export default apiClient;
