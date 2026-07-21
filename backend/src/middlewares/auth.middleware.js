/**
 * Authentication & authorization middleware.
 *
 * `protect` requires a valid access token and loads the user onto req.user.
 * `authorize(...roles)` restricts a route to the given roles.
 * `optionalAuth` attaches the user when a token is present but never rejects.
 */
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import { userRepository } from '../repositories/index.js';
import { MESSAGES } from '../constants/index.js';

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const user = await userRepository.findById(decoded.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or disabled');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.sub);
    if (user && user.isActive) req.user = user;
  } catch {
    // Ignore invalid tokens for optional auth.
  }
  return next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden(MESSAGES.FORBIDDEN));
    }
    return next();
  };
}
