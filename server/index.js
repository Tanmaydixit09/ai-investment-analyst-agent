import express from 'express';
import cors from 'cors';
import { env } from './config/index.js';
import { requestId } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import researchRoutes from './routes/researchRoutes.js';

/**
 * Server entry point. Wires together the middleware, routes, and
 * centralized error handler built in Step 9, on top of the business logic
 * layers (services, LangGraph pipeline) built in earlier steps.
 *
 * Importing `env` from config/index.js (rather than reading process.env
 * directly) also means: if a required environment variable is missing,
 * the process already would have exited with a clear error during this
 * import — before app.listen() is ever reached.
 */
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestId);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Investment Research Agent API',
  });
});

app.use('/api', researchRoutes);

// Error handler is registered LAST, after all routes — Express only
// recognizes a four-argument function as error-handling middleware, and
// it only catches errors from routes/middleware registered before it.
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 AI Investment Research Agent API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
