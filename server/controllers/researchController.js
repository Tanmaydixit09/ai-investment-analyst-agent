import { runResearchWorkflow } from '../agent/researchGraph.js';
import { ServiceError } from '../utils/ServiceError.js';
import { ERROR_CODES } from '../config/index.js';

/**
 * POST /api/research
 *
 * Thin controller: validates the request shape, delegates all real work to
 * runResearchWorkflow() (the LangGraph pipeline built in Steps 7-8), and
 * shapes the HTTP response. No business logic lives here — no scoring, no
 * provider calls, no prompt construction. Errors are passed to next(err)
 * rather than handled inline, so the centralized errorHandler middleware
 * is the single place that maps error codes to HTTP statuses.
 */
export async function postResearch(req, res, next) {
  try {
    const { company } = req.body ?? {};

    if (typeof company !== 'string' || !company.trim()) {
      throw new ServiceError(
        ERROR_CODES.INVALID_REQUEST,
        'Request body must include a non-empty "company" field, e.g. { "company": "Apple" }.'
      );
    }

    const result = await runResearchWorkflow(company.trim());

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
