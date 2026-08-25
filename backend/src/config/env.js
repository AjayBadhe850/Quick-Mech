const dotenv = require('dotenv');
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/quickmech',
  JWT_SECRET: process.env.JWT_SECRET || 'quickmech_fallback_dev_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'QuickMech <onboarding@resend.dev>',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000'
};

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = env.JWT_SECRET;
}

module.exports = env;
