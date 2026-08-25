const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const PORT = env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n========================================`);
  console.log(`🚀 QuickMech API Server Running`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`========================================\n`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('💤 HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error disconnecting database:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
