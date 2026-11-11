export function successResponse(res, { statusCode = 200, message = "Berhasil", data = null, meta = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function errorResponse(res, { statusCode = 500, message = "Terjadi kesalahan", errors = [] } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function paginationMeta({ page, limit, total }) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
