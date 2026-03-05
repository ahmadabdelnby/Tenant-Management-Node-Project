/**
 * Build pagination response
 * @param {Array} data - Data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} - Pagination response
 */
const buildPaginationResponse = (data, page, limit, total) => {
  if (limit === 0) {
    return {
      data,
      pagination: {
        currentPage: 1,
        itemsPerPage: total,
        totalItems: total,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Parse pagination query parameters
 * @param {Object} query - Request query object
 * @returns {Object} - Parsed pagination params
 */
const parsePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.limit, 10);
  // limit=0 means "no limit" — fetch all records
  if (rawLimit === 0) {
    return { page: 1, limit: 0, offset: 0 };
  }
  const limit = Math.min(500, Math.max(1, rawLimit || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

module.exports = {
  buildPaginationResponse,
  parsePaginationParams,
};
