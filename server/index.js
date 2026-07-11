import express from 'express';
import cors from 'cors';
import { env } from './config/index.js';

/**
 * Server entry point. Deliberately minimal at this stage: routes,
 * controllers, and middleware (rate limiting, request validation, error
 * handling) don't exist yet — they're built in step 9, once the business
 * logic layers (services, LangGraph pipeline) they depend on are in place.
 * This file's only job right now is to prove the server boots, loads
 * validated config, and responds to a basic request.
 *
 * Importing `env` from config/index.js (rather than reading process.env
 * directly) also means: if a required environment variable is missing,
 * the process already would have exited with a clear error during this
 * import — before app.listen() is ever reached.
 */
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Investment Research Agent API',
  });
});

app.listen(env.PORT, () => {
  console.log(`🚀 AI Investment Research Agent API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
