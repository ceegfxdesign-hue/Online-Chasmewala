/**
 * Operational error carrying an HTTP status code and optional field errors.
 * Thrown by services/controllers and translated to a response by the error
 * middleware.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status.
   * @param {string} message Human-readable message.
   * @param {Array<{field:string,message:string}>} [errors] Field-level errors.
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }

  static unprocessable(msg = 'Unprocessable entity', errors = []) {
    return new ApiError(422, msg, errors);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}

export default ApiError;
