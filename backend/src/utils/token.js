/**
 * JWT + refresh-token helpers.
 *
 * Access tokens are short-lived and sent in the Authorization header. Refresh
 * tokens are long-lived, delivered as an httpOnly cookie, and stored *hashed* on
 * the user document so they can be rotated and revoked.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/** Hash a token/OTP for at-rest storage (never store raw refresh tokens/OTPs). */
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/** Generate a numeric OTP of the given length. */
export function generateOtp(length = 6) {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, '0');
}

/** Cookie options for the refresh token. */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export const REFRESH_COOKIE = 'oc_refresh';
