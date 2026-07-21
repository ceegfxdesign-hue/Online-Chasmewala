import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/otp/request', authLimiter, validate(requestOtpSchema), authController.requestOtp);
router.post('/otp/verify', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);

export default router;
