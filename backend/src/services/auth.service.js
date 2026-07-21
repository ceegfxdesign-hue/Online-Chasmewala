/**
 * Authentication business logic: registration, login, token refresh with
 * rotation, logout, and a mock OTP flow. No Express types here — the controller
 * adapts HTTP to these calls.
 */
import { userRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateOtp,
} from '../utils/token.js';
import { otpProvider } from './providers/otpProvider.js';
import { eventBus, EVENTS } from '../events/eventBus.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_REFRESH_TOKENS = 5;

function tokenPayload(user) {
  return { sub: user._id.toString(), role: user.role };
}

async function issueTokens(user) {
  const accessToken = signAccessToken(tokenPayload(user));
  const refreshToken = signRefreshToken(tokenPayload(user));
  const hashed = hashToken(refreshToken);

  // Keep only the most recent N refresh tokens (bounds device count).
  const existing = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
  user.refreshTokens = [...existing, hashed].slice(-MAX_REFRESH_TOKENS);
  user.lastLoginAt = new Date();
  await user.save();

  return { accessToken, refreshToken };
}

export const authService = {
  async register({ name, email, password, phone }) {
    const exists = await userRepository.exists({ email: email.toLowerCase() });
    if (exists) throw ApiError.conflict('An account with this email already exists');

    const user = await userRepository.create({ name, email, password, phone });
    eventBus.emitEvent(EVENTS.USER_REGISTERED, { userId: user._id });

    const tokens = await issueTokens(user);
    return { user: user.toJSON(), ...tokens };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, { withPassword: true }).select(
      '+password +refreshTokens'
    );
    if (!user || !user.isActive) throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);

    const tokens = await issueTokens(user);
    return { user: user.toJSON(), ...tokens };
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findAuthById(decoded.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account not found');

    const hashed = hashToken(refreshToken);
    if (!user.refreshTokens?.includes(hashed)) {
      // Token reuse / revoked — force re-login and clear all sessions.
      user.refreshTokens = [];
      await user.save();
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    // Rotate: drop the used token, issue a fresh pair.
    user.refreshTokens = user.refreshTokens.filter((t) => t !== hashed);
    const tokens = await issueTokens(user);
    return { user: user.toJSON(), ...tokens };
  },

  async logout(userId, refreshToken) {
    if (!userId) return;
    const user = await userRepository.findAuthById(userId);
    if (!user) return;
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== hashed);
    } else {
      user.refreshTokens = [];
    }
    await user.save();
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId).populate('wishlist', 'name slug price images');
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },

  /** Request an OTP for the given purpose (mock delivery in dev). */
  async requestOtp(email, purpose = 'verification') {
    const user = await userRepository.findByEmail(email).select('+otpHash +otpExpiresAt');
    if (!user) throw ApiError.notFound('No account found for this email');

    const code = generateOtp(6);
    user.otpHash = hashToken(code);
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    const result = await otpProvider.send({ destination: email, code, purpose });
    return { sent: result.delivered, devCode: result.devCode };
  },

  /** Verify an OTP; optionally reset password when a newPassword is provided. */
  async verifyOtp({ email, code, newPassword }) {
    const user = await userRepository
      .findByEmail(email)
      .select('+otpHash +otpExpiresAt +password');
    if (!user) throw ApiError.notFound('No account found for this email');

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw ApiError.badRequest('OTP expired. Please request a new one.');
    }
    if (user.otpHash !== hashToken(code)) throw ApiError.badRequest('Incorrect OTP');

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.isEmailVerified = true;
    if (newPassword) {
      user.password = newPassword;
      user.refreshTokens = []; // invalidate sessions after password reset
    }
    await user.save();
    return { verified: true };
  },
};

export default authService;
