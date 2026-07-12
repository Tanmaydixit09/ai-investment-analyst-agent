import { Router } from 'express';
import { postResearch } from '../controllers/researchController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Mounted at /api in index.js -> full path is POST /api/research.
// Rate limiting applied here, not globally, since it's specifically this
// endpoint (backed by paid-free-tier external APIs and an LLM call) that
// needs quota protection.
router.post('/research', rateLimiter, postResearch);

export default router;
