import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * This file is the ONLY place in the codebase allowed to read `process.env` directly.
 * Every other module must import the parsed `env` object from here (or from
 * `config/index.js`). This keeps configuration centralized, typed, and testable —
 * a service can be tested by passing in a fake `env` object instead of mutating
 * global process state.
 *
 * (Note: this convention is enforced by code review / a custom ESLint rule in a
 * real team setting, not by the language itself — flagging that honestly rather
 * than pretending this file can prevent someone from typing `process.env.X`
 * elsewhere.)
 */

/**
 * Variables the server cannot run without. If any of these are missing or
 * malformed, we fail fast at startup with a clear message rather than crashing
 * later, mid-request, with a confusing stack trace.
 */
const requiredSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required — the app has no LLM without it.'),
});

/**
 * Variables that have a safe default or a designed fallback path (e.g. missing
 * GNEWS_API_KEY just means the news provider façade falls back to NewsAPI, then
 * RSS — see services/newsService.js in a later step). Missing ones are warned
 * about, not fatal.
 */
const optionalSchema = z.object({
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GNEWS_API_KEY: z.string().optional(),
  NEWSAPI_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(1),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),
});

function loadEnv() {
  const requiredResult = requiredSchema.safeParse(process.env);

  if (!requiredResult.success) {
    // Fail loudly and immediately. A misconfigured deployment should never
    // start "successfully" and then fail on the first real request.
    console.error('❌ Invalid or missing required environment variables:');
    for (const issue of requiredResult.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  const optionalResult = optionalSchema.safeParse(process.env);
  if (!optionalResult.success) {
    console.error('❌ Invalid optional environment variables:');
    for (const issue of optionalResult.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (!optionalResult.data.GNEWS_API_KEY && !optionalResult.data.NEWSAPI_API_KEY) {
    console.warn(
      '⚠️  No GNEWS_API_KEY or NEWSAPI_API_KEY set — news fetching will rely on the RSS fallback only.'
    );
  }

  return Object.freeze({
    ...requiredResult.data,
    ...optionalResult.data,
  });
}

/**
 * The single, immutable, validated configuration object for the whole server.
 * `Object.freeze` makes accidental mutation (e.g. `env.PORT = 5000` somewhere
 * deep in a service) fail silently in non-strict contexts or throw in strict
 * mode — either way, it signals a bug rather than allowing config to drift
 * at runtime.
 */
export const env = loadEnv();
