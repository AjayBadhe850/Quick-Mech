/**
 * Formats a successful response
 */
const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...data // include top-level properties for backwards compatibility with existing frontend
  });
};

/**
 * Formats an error response
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, code = 'SERVER_ERROR', errors = null) => {
  const payload = {
    success: false,
    message,
    error: {
      code,
      message,
      ...(errors && { details: errors })
    }
  };
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
