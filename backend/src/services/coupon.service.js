/**
 * Coupon / offer engine: validates a code against rules (active window, min
 * order, usage limits) and computes the discount. `redeem` records usage after a
 * successful order.
 */
import { couponRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

export const couponService = {
  /** Public list of currently-valid coupons (for the "available offers" UI). */
  async listActive() {
    const now = new Date();
    return couponRepository.find(
      { isActive: true, startsAt: { $lte: now }, expiresAt: { $gte: now } },
      { select: 'code description type value maxDiscount minOrderValue expiresAt', sort: { value: -1 }, lean: true }
    );
  },

  /**
   * Validate a coupon for a given user + subtotal. Returns
   * `{ coupon, discount }` or throws an ApiError with the reason.
   */
  async validate({ code, subtotal, userId }) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) throw ApiError.badRequest('Invalid coupon code');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw ApiError.badRequest('This coupon is not active yet');
    if (coupon.expiresAt && coupon.expiresAt < now) throw ApiError.badRequest('This coupon has expired');
    if (subtotal < coupon.minOrderValue) {
      throw ApiError.badRequest(`Add items worth ₹${coupon.minOrderValue - subtotal} more to use this coupon`);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its usage limit');
    }
    if (userId && coupon.perUserLimit) {
      const record = coupon.usedBy.find((u) => String(u.user) === String(userId));
      if (record && record.count >= coupon.perUserLimit) {
        throw ApiError.badRequest('You have already used this coupon');
      }
    }

    const discount = coupon.computeDiscount(subtotal);
    return { coupon, discount };
  },

  /** Record a redemption after an order is placed. */
  async redeem({ code, userId }) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) return;
    coupon.usedCount += 1;
    const record = coupon.usedBy.find((u) => String(u.user) === String(userId));
    if (record) record.count += 1;
    else coupon.usedBy.push({ user: userId, count: 1 });
    await coupon.save();
  },

  // ── Admin CRUD ──────────────────────────────────────────────────────────────
  async adminList() {
    return couponRepository.find({}, { sort: { createdAt: -1 }, lean: true });
  },
  async create(data) {
    return couponRepository.create(data);
  },
  async update(id, data) {
    const coupon = await couponRepository.updateById(id, data);
    if (!coupon) throw ApiError.notFound('Coupon not found');
    return coupon;
  },
  async remove(id) {
    const coupon = await couponRepository.deleteById(id);
    if (!coupon) throw ApiError.notFound('Coupon not found');
    return { id };
  },
};

export default couponService;
