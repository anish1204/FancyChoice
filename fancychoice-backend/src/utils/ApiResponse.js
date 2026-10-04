class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static created(res, data = null, message = 'Created') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, { docs, total, page, limit }, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data: docs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }
}

module.exports = ApiResponse;
