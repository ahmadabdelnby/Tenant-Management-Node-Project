/**
 * Build pagination response
 * @param {Array} data - Data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} - Pagination response
 */
const buildPaginationResponse = (data, page, limit, total) => {
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
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

module.exports = {
  buildPaginationResponse,
  parsePaginationParams,
};
