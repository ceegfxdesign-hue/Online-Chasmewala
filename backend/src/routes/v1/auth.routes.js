import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { verifyOriginOrSameSite } from '../../middlewares/origin.middleware.js';
import {
  loginLimiter,
  registerLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  refreshLimiter,
} from '../../middlewares/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  checkOtpSchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', refreshLimiter, verifyOriginOrSameSite, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/otp/request', otpRequestLimiter, validate(requestOtpSchema), authController.requestOtp);
router.post('/otp/verify', otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/otp/check', otpVerifyLimiter, validate(checkOtpSchema), authController.checkOtp);

export default router;
