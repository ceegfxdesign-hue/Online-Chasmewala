import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { couponService } from '../services/coupon.service.js';

export const couponController = {
  listActive: asyncHandler(async (req, res) => {
    const data = await couponService.listActive();
    return sendSuccess(res, { data });
  }),
  validate: asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    const { coupon, discount } = await couponService.validate({
      code,
      subtotal,
      userId: req.user._id,
    });
    return sendSuccess(res, {
      message: 'Coupon applied',
      data: { code: coupon.code, description: coupon.description, discount },
    });
  }),
};

export default couponController;
