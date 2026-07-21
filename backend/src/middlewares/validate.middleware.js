/**
 * Request validation middleware backed by Zod. Pass a schema shaped like
 * `{ body?, query?, params? }`; validated/coerced values replace the originals.
 */
import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = {};
    for (const key of ['body', 'query', 'params']) {
      if (!schema[key]) continue;
      const parsed = schema[key].safeParse(req[key]);
      if (!parsed.success) {
        const errors = parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return next(ApiError.unprocessable('Validation failed', errors));
      }
      result[key] = parsed.data;
    }
    // Assign coerced values back (Express 4 allows reassigning req.query).
    if (result.body) req.body = result.body;
    if (result.query) req.query = result.query;
    if (result.params) req.params = result.params;
    return next();
  };
}

export default validate;
