const env = require('../config/env');
const { errorResponse } = require('../utils/response');

/**
 * Centralized Express error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);

  // Prisma known request errors
  if (err.code && err.code.startsWith('P20')) {
    if (err.code === 'P2002') {
      return errorResponse(res, 'A record with this unique field already exists.', 409, 'DUPLICATE_RESOURCE');
    }
    if (err.code === 'P2025') {
      return errorResponse(res, 'The requested record was not found.', 404, 'NOT_FOUND');
    }
    return errorResponse(res, 'Database query error.', 400, 'DATABASE_ERROR');
  }

  // Zod syntax or validation errors
  if (err.name === 'ZodError') {
    return errorResponse(res, 'Validation failed', 400, 'VALIDATION_ERROR', err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }

  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : (err.message || 'Something went wrong');

  return errorResponse(res, message, statusCode, err.code || 'SERVER_ERROR');
};

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
};

module.exports = {
  errorHandler,
  notFoundHandler
};
