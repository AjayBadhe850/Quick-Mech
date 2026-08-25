const prisma = require('../config/prisma');

const checkHealth = async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'unreachable';
  }

  const healthData = {
    status: dbStatus === 'unreachable' ? 'degraded' : 'healthy',
    service: 'quick-mech-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus
  };

  return res.status(200).json(healthData);
};

module.exports = {
  checkHealth
};
