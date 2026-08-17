import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { bannerService } from '../../services/banner.service.js';

const router = Router();

/** GET /api/v1/banners?placement=hero — public active banners for the storefront. */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await bannerService.listActive(req.query.placement);
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return sendSuccess(res, { data });
  })
);

export default router;
