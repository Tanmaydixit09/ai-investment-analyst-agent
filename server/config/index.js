/**
 * Single entry point for all configuration. The rest of the codebase should
 * import from `config/index.js` (or `../config/index.js`) rather than
 * reaching into individual config files — one import path to update if the
 * internal config file layout ever changes.
 *
 * Usage elsewhere in the app:
 *   import { env, PROVIDERS, SCORE_WEIGHTS, ERROR_CODES } from '../config/index.js';
 */
export * from './env.js';
export * from './providers.js';
export * from './constants.js';
export * from './errorCodes.js';
