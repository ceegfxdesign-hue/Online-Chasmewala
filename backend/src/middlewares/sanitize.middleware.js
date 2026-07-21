/**
 * Recursively strips XSS payloads from request bodies and query values using the
 * `xss` library. Complements express-mongo-sanitize (which handles operator
 * injection) by neutralizing script/HTML injection in user input.
 */
import xss from 'xss';

function clean(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = clean(value[key]);
    return value;
  }
  return value;
}

export function xssSanitizer(req, _res, next) {
  if (req.body) req.body = clean(req.body);
  // req.query is a getter in Express 5+, but mutable in 4.x; guard for safety.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') req.query[key] = xss(req.query[key]);
    }
  }
  next();
}

export default xssSanitizer;
