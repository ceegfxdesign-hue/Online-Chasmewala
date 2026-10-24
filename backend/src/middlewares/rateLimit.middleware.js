/**
 * Rate limiting middleware with shared MongoDB multi-instance store.
 * Applies targeted limits to login, registration, OTP, refresh, and abuse-prone routes.
 */
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { RateLimit } from '../models/RateLimit.js';

class MongoRateLimitStore {
  constructor(windowMs) {
    this.windowMs = windowMs || 15 * 60 * 1000;
  }

  init(options) {
    if (options?.windowMs) {
      this.windowMs = options.windowMs;
    }
  }

  async increment(key) {
    if (mongoose.connection.readyState !== 1) {
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }
    const resetTime = new Date(Date.now() + this.windowMs);
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      {
        $inc: { totalHits: 1 },
        $setOnInsert: { expiresAt: resetTime },
      },
      { upsert: true, new: true }
    );
    return {
      totalHits: doc.totalHits,
      resetTime: doc.expiresAt || resetTime,
    };
  }

  async decrement(key) {
    if (mongoose.connection.readyState !== 1) return;
    await RateLimit.updateOne({ key }, { $inc: { totalHits: -1 } });
  }

  async resetKey(key) {
    if (mongoose.connection.readyState !== 1) return;
    await RateLimit.deleteOne({ key });
  }

  async resetAll() {
    if (mongoose.connection.readyState !== 1) return;
    await RateLimit.deleteMany({});
  }
}

export function createLimiter({ windowMs, max, message, keyGenerator, prefix = '' }) {
  const options = {
    windowMs,
    max: env.isTest ? 1000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  };

  if (keyGenerator) {
    options.keyGenerator = keyGenerator;
  }

  // Use shared MongoDB store in development/production for multi-instance sync
  if (!env.isTest) {
    const store = new MongoRateLimitStore(windowMs);
    if (prefix) {
      const origKeyGen = options.keyGenerator || ((req) => req.ip || 'anonymous');
      options.keyGenerator = (req) => `${prefix}:${origKeyGen(req)}`;
    }
    options.store = store;
  }

  return rateLimit(options);
}

// ── Targeted Limiters ────────────────────────────────────────────────────────

/** General auth limiter fallback */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts. Please try again later.',
  prefix: 'auth',
});

/** Login endpoint: 10 attempts per 15 minutes */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many sign-in attempts. Please try again in 15 minutes.',
  prefix: 'login',
});

/** Registration: 10 account creations per hour per IP */
export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many accounts created from this IP. Please try again in an hour.',
  prefix: 'register',
});

/** OTP request: 5 requests per 10 minutes (prevents SMS/email bombing) */
export const otpRequestLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many verification code requests. Please wait before requesting another.',
  prefix: 'otp-req',
});

/** OTP verification: 10 attempts per 15 minutes */
export const otpVerifyLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many verification attempts. Please try again later.',
  prefix: 'otp-ver',
});

/** Refresh token endpoint: 60 requests per 15 minutes */
export const refreshLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many session refresh attempts.',
  prefix: 'refresh',
});

/** Order placement & quotes: 20 requests per 15 minutes */
export const orderLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many order requests. Please slow down.',
  prefix: 'order',
});

/** Coupon validation */
const couponOptions = {
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many coupon validation attempts. Please try again in 10 minutes.',
  },
};

export const couponLimiter = [
  rateLimit(couponOptions),
  rateLimit({ ...couponOptions, keyGenerator: (req) => String(req.user?._id || req.ip) }),
];

export default authLimiter;
