/**
 * Consistent success-response envelope helpers.
 *
 * Shape: { success, message, data, meta? }
 */
export function sendSuccess(res, { statusCode = 200, message = 'OK', data = null, meta } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendCreated(res, { message = 'Created', data = null, meta } = {}) {
  return sendSuccess(res, { statusCode: 201, message, data, meta });
}

export function sendNoContent(res) {
  return res.status(204).send();
}

export default { sendSuccess, sendCreated, sendNoContent };
