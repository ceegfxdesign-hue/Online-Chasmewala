/**
 * Stricter rate limiter for sensitive auth endpoints (login, register, OTP) to
 * blunt brute-force and abuse. Relaxed in the test environment.
 */
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isTest ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

export default authLimiter;
