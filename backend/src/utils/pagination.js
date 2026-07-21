/**
 * Normalize pagination query params into safe values.
 * @param {object} query Express req.query
 * @param {object} [opts]
 * @param {number} [opts.defaultLimit=12]
 * @param {number} [opts.maxLimit=100]
 */
export function getPagination(query = {}, { defaultLimit = 12, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a pagination meta object for API responses.
 */
export function buildMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
