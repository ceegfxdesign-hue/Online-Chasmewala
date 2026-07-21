import { Router } from 'express';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { dbStatus } from '../../config/db.js';

const router = Router();

/**
 * GET /api/v1/health
 * Liveness/readiness probe for load balancers and uptime checks.
 */
router.get('/', (req, res) =>
  sendSuccess(res, {
    message: 'Online Chasmewala API is healthy',
    data: {
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
      db: dbStatus(),
    },
  })
);

export default router;
