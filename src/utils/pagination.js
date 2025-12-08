function getPaginationParams(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function makePagedResponse(data, page, limit, total) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = { getPaginationParams, makePagedResponse };
