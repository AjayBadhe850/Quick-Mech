const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const mechanicRoutes = require('./routes/mechanicRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers with payload limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
app.use('/api', apiLimiter);

// API Route Mounts
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Root & API welcome endpoints
const rootInfo = (req, res) => {
  res.json({
    success: true,
    name: 'QuickMech REST API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      mechanics: '/api/mechanics',
      nearbyMechanics: '/api/mechanics/nearby?lat=12.9716&lng=77.5946',
      auth: '/api/auth',
      sendOtp: 'POST /api/auth/send-otp',
      verifyOtp: 'POST /api/auth/verify-otp',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      services: '/api/services',
      payments: '/api/payments'
    }
  });
};

app.get('/', rootInfo);
app.get('/api', rootInfo);

// Catch 404
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
