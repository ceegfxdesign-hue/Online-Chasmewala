import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { analyticsService } from '../services/analytics.service.js';
import { productService } from '../services/product.service.js';
import { orderService } from '../services/order.service.js';
import { returnService } from '../services/return.service.js';
import { reviewService } from '../services/review.service.js';
import { couponService } from '../services/coupon.service.js';
import { bannerService } from '../services/banner.service.js';
import { adminUserService } from '../services/admin-user.service.js';
import { settingsService } from '../services/settings.service.js';

export const adminController = {
  // ── Analytics ────────────────────────────────────────────────────────────
  dashboard: asyncHandler(async (req, res) => {
    const data = await analyticsService.dashboard();
    return sendSuccess(res, { data });
  }),
  revenueSeries: asyncHandler(async (req, res) => {
    const data = await analyticsService.revenueSeries(req.query.range);
    return sendSuccess(res, { data });
  }),
  topProducts: asyncHandler(async (req, res) => {
    const data = await analyticsService.topProducts(req.query.range);
    return sendSuccess(res, { data });
  }),
  categorySplit: asyncHandler(async (req, res) => {
    const data = await analyticsService.categorySplit(req.query.range);
    return sendSuccess(res, { data });
  }),
  orderStatusBreakdown: asyncHandler(async (req, res) => {
    const data = await analyticsService.orderStatusBreakdown();
    return sendSuccess(res, { data });
  }),
  customerStats: asyncHandler(async (req, res) => {
    const data = await analyticsService.customerStats(req.query.range);
    return sendSuccess(res, { data });
  }),
  salesReport: asyncHandler(async (req, res) => {
    const data = await analyticsService.salesReport(req.query);
    return sendSuccess(res, { data });
  }),

  // ── Inventory ─────────────────────────────────────────────────────────────
  lowStock: asyncHandler(async (req, res) => {
    const data = await analyticsService.lowStock();
    return sendSuccess(res, { data });
  }),
  adminProducts: asyncHandler(async (req, res) => {
    const { data, meta } = await productService.adminList(req.query);
    return sendSuccess(res, { data, meta });
  }),

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: asyncHandler(async (req, res) => {
    const { data, meta } = await orderService.adminList(req.query);
    return sendSuccess(res, { data, meta });
  }),
  updateOrderStatus: asyncHandler(async (req, res) => {
    const data = await orderService.updateStatus(req.params.id, req.body.status, req.body.note);
    return sendSuccess(res, { message: 'Order updated', data });
  }),

  // ── Returns ───────────────────────────────────────────────────────────────
  returns: asyncHandler(async (req, res) => {
    const { data, meta } = await returnService.adminList(req.query);
    return sendSuccess(res, { data, meta });
  }),
  updateReturnStatus: asyncHandler(async (req, res) => {
    const data = await returnService.updateStatus(req.params.id, req.body.status, req.body.note);
    return sendSuccess(res, { message: 'Return updated', data });
  }),

  // ── Reviews moderation ──────────────────────────────────────────────────────
  reviews: asyncHandler(async (req, res) => {
    const { data, meta } = await reviewService.adminList(req.query);
    return sendSuccess(res, { data, meta });
  }),
  moderateReview: asyncHandler(async (req, res) => {
    const data = await reviewService.moderate(req.params.id, req.body.status);
    return sendSuccess(res, { message: 'Review moderated', data });
  }),

  // ── Coupons ───────────────────────────────────────────────────────────────
  coupons: asyncHandler(async (req, res) => {
    const data = await couponService.adminList();
    return sendSuccess(res, { data });
  }),
  createCoupon: asyncHandler(async (req, res) => {
    const data = await couponService.create(req.body);
    return sendCreated(res, { message: 'Coupon created', data });
  }),
  updateCoupon: asyncHandler(async (req, res) => {
    const data = await couponService.update(req.params.id, req.body);
    return sendSuccess(res, { message: 'Coupon updated', data });
  }),
  removeCoupon: asyncHandler(async (req, res) => {
    const data = await couponService.remove(req.params.id);
    return sendSuccess(res, { message: 'Coupon deleted', data });
  }),

  // ── Banners ───────────────────────────────────────────────────────────────
  banners: asyncHandler(async (req, res) => {
    const data = await bannerService.adminList();
    return sendSuccess(res, { data });
  }),
  createBanner: asyncHandler(async (req, res) => {
    const data = await bannerService.create(req.body);
    return sendCreated(res, { message: 'Banner created', data });
  }),
  updateBanner: asyncHandler(async (req, res) => {
    const data = await bannerService.update(req.params.id, req.body);
    return sendSuccess(res, { message: 'Banner updated', data });
  }),
  removeBanner: asyncHandler(async (req, res) => {
    const data = await bannerService.remove(req.params.id);
    return sendSuccess(res, { message: 'Banner deleted', data });
  }),

  // ── Users ─────────────────────────────────────────────────────────────────
  users: asyncHandler(async (req, res) => {
    const { data, meta } = await adminUserService.list(req.query);
    return sendSuccess(res, { data, meta });
  }),
  user: asyncHandler(async (req, res) => {
    const data = await adminUserService.get(req.params.id);
    return sendSuccess(res, { data });
  }),
  setUserActive: asyncHandler(async (req, res) => {
    const data = await adminUserService.setActive(req.user._id, req.params.id, req.body.isActive);
    return sendSuccess(res, { message: 'User updated', data });
  }),
  setUserRole: asyncHandler(async (req, res) => {
    const data = await adminUserService.setRole(req.user._id, req.params.id, req.body.role);
    return sendSuccess(res, { message: 'Role updated', data });
  }),
  settings: asyncHandler(async (req, res) => {
    const data = await settingsService.get();
    return sendSuccess(res, { data });
  }),
  updateSettings: asyncHandler(async (req, res) => {
    const data = await settingsService.update(req.body);
    return sendSuccess(res, { message: 'Settings updated', data });
  }),
};

export default adminController;
