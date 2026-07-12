import rateLimit from 'express-rate-limit';
import { env, ERROR_CODES } from '../config/index.js';

/**
 * Rate limiter driven entirely by config/env.js (RATE_LIMIT_WINDOW_MINUTES,
 * RATE_LIMIT_MAX_REQUESTS — validated with defaults back in Step 2, unused
 * until now). Justified by relying on free-tier external APIs (Yahoo
 * Finance, GNews) with real quotas — this protects those quotas, not just
 * the server itself.
 *
 * Applied at the route level (see routes/researchRoutes.js) to the
 * expensive /api/research endpoint specifically, not globally — the
 * lightweight GET / health check has no reason to share that budget.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMITED,
        message: `Too many requests. Limit is ${env.RATE_LIMIT_MAX_REQUESTS} requests per ${env.RATE_LIMIT_WINDOW_MINUTES} minute(s).`,
      },
    });
  },
});
