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
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=900');
    return sendSuccess(res, { data: settings.homeCategoryImages || {} });
  })
);

router.get(
  '/trust-benefits',
  asyncHandler(async (_req, res) => {
    const settings = await settingsService.get();
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=900');
    return sendSuccess(res, { data: settings.trustBenefits });
  })
);

router.get(
  '/footer',
  asyncHandler(async (_req, res) => {
    const settings = await settingsService.get();
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=900');
    return sendSuccess(res, {
      data: {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        storeAddress: settings.storeAddress,
        businessHoursTitle: settings.businessHoursTitle,
        businessHoursText: settings.businessHoursText,
        whatsappNumber: settings.whatsappNumber,
      },
    });
  })
);

export default router;
