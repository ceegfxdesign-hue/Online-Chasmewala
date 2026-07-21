import { Router } from 'express';
import { couponController } from '../../controllers/coupon.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { validateCouponSchema } from '../../validators/shop.validator.js';

const router = Router();

router.get('/', couponController.listActive);
router.post('/validate', protect, validate(validateCouponSchema), couponController.validate);

export default router;
