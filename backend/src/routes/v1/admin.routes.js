import { Router } from 'express';
import { adminController } from '../../controllers/admin.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/index.js';
import {
  idParam,
  updateOrderStatusSchema,
  updateReturnStatusSchema,
  moderateReviewSchema,
  createCouponSchema,
  updateCouponSchema,
  createBannerSchema,
  updateBannerSchema,
  setUserActiveSchema,
  setUserRoleSchema,
  updateSettingsSchema,
} from '../../validators/admin.validator.js';

const router = Router();
router.use(protect, authorize(ROLES.ADMIN));

// Analytics
router.get('/analytics/dashboard', adminController.dashboard);
router.get('/analytics/revenue', adminController.revenueSeries);
router.get('/analytics/top-products', adminController.topProducts);
router.get('/analytics/category-split', adminController.categorySplit);
router.get('/analytics/order-status', adminController.orderStatusBreakdown);
router.get('/analytics/customers', adminController.customerStats);
router.get('/reports/sales', adminController.salesReport);

// Inventory
router.get('/inventory/low-stock', adminController.lowStock);
router.get('/products', adminController.adminProducts);

// Orders
router.get('/orders', adminController.orders);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), adminController.updateOrderStatus);

// Returns
router.get('/returns', adminController.returns);
router.patch('/returns/:id/status', validate(updateReturnStatusSchema), adminController.updateReturnStatus);

// Reviews
router.get('/reviews', adminController.reviews);
router.patch('/reviews/:id/moderate', validate(moderateReviewSchema), adminController.moderateReview);

// Coupons
router.get('/coupons', adminController.coupons);
router.post('/coupons', validate(createCouponSchema), adminController.createCoupon);
router.patch('/coupons/:id', validate(updateCouponSchema), adminController.updateCoupon);
router.delete('/coupons/:id', validate(idParam), adminController.removeCoupon);

// Banners
router.get('/banners', adminController.banners);
router.post('/banners', validate(createBannerSchema), adminController.createBanner);
router.patch('/banners/:id', validate(updateBannerSchema), adminController.updateBanner);
router.delete('/banners/:id', validate(idParam), adminController.removeBanner);

// Users
router.get('/users', adminController.users);
router.get('/users/:id', validate(idParam), adminController.user);
router.patch('/users/:id/active', validate(setUserActiveSchema), adminController.setUserActive);
router.patch('/users/:id/role', validate(setUserRoleSchema), adminController.setUserRole);

router.get('/settings', adminController.settings);
router.patch('/settings', validate(updateSettingsSchema), adminController.updateSettings);

export default router;
