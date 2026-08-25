const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const { errorResponse } = require('../utils/response');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Missing or malformed token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    let user = null;
    if (decoded.id) {
      user = await prisma.user.findUnique({ where: { id: decoded.id } });
    }

    if (!user && decoded.mobileNumber) {
      user = await prisma.user.findUnique({ where: { mobileNumber: decoded.mobileNumber } });
    }

    if (!user) {
      req.user = decoded; // Fallback to token payload if user not in DB yet
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token expired. Please login again.', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);
      let user = null;
      if (decoded.id) {
        user = await prisma.user.findUnique({ where: { id: decoded.id } });
      }
      req.user = user || decoded;
    }
  } catch (error) {
    // Ignore invalid token for optional auth
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied. Administrator privilege required.', 403, 'FORBIDDEN');
  }
  next();
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin
};
