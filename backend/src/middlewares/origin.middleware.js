/**
 * Origin and Sec-Fetch-Site validation middleware for sensitive cookie-bearing routes.
 */
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function verifyOriginOrSameSite(req, res, next) {
  // If Sec-Fetch-Site is cross-site, reject cookie-bearing requests
  const secFetchSite = req.headers['sec-fetch-site'];
  if (secFetchSite === 'cross-site') {
    return next(ApiError.forbidden('Cross-site requests are not allowed'));
  }

  // If Origin header is present, verify against allowed CORS origins
  const origin = req.headers.origin;
  if (origin && !env.corsOrigins.includes(origin)) {
    return next(ApiError.forbidden(`Origin not permitted: ${origin}`));
  }

  next();
}

export default verifyOriginOrSameSite;
