/**
 * Centralized error handling: converts thrown errors (operational or not) into
 * a consistent JSON envelope and logs unexpected failures.
 */
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/** 404 handler for unmatched routes. */
export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Normalizes common non-ApiError failures into ApiError instances. */
function normalize(err) {
  if (err instanceof ApiError) return err;

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.unprocessable('Validation failed', errors);
  }
  // Invalid ObjectId / cast
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }
  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`${field} already exists`);
  }
  // JWT
  if (err.name === 'JsonWebTokenError') return ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') return ApiError.unauthorized('Token expired');

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error');
}

// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature
export function errorHandler(err, req, res, next) {
  const apiError = normalize(err);

  if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${apiError.message}\n${err.stack || ''}`);
  }

  const body = {
    success: false,
    message: apiError.statusCode >= 500 && env.isProd ? 'Internal server error' : apiError.message,
  };
  if (apiError.errors?.length) body.errors = apiError.errors;
  if (!env.isProd && apiError.statusCode >= 500) body.stack = err.stack;

  res.status(apiError.statusCode).json(body);
}

export default errorHandler;
