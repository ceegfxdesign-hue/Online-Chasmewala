import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { settingsService } from '../../services/settings.service.js';

const router = Router();

/** Public storefront settings that do not contain account or operational data. */
router.get(
  '/home-category-images',
  asyncHandler(async (_req, res) => {
    const settings = await settingsService.get();
    return sendSuccess(res, { data: settings.homeCategoryImages || {} });
  })
);

export default router;
