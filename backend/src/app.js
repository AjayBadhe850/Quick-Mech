const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const {
  errorHandler,
  notFoundHandler
} = require('./middleware/errorHandler');

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

/*
|--------------------------------------------------------------------------
| Trust Proxy
|--------------------------------------------------------------------------
|
| Railway runs the Express application behind a reverse proxy.
| This allows Express and express-rate-limit to correctly use
| X-Forwarded-For / X-Forwarded-Proto headers.
|
*/
app.set('trust proxy', 1);

/*
|--------------------------------------------------------------------------
| Security Headers
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
|
| FRONTEND_URL can contain multiple comma-separated origins.
|
| Example:
|
| FRONTEND_URL=https://starlit-faloodeh-a0ce94.netlify.app,http://localhost:5173
|
*/

const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  : [
    'http://localhost:5173',
    'http://localhost:3000'
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Requests without an Origin header are allowed.
       * This supports Postman, curl, mobile applications,
       * health checks, and server-to-server requests.
       */
      if (!origin) {
        return callback(null, true);
      }

      /*
       * Allow configured frontend origins.
       */
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      /*
       * Optional wildcard support.
       * Avoid using "*" in production unless absolutely necessary.
       */
      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      /*
       * Allow easier local development.
       */
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS policy blocked access from origin: ${origin}`
        )
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
|
| 10 MB is currently allowed because QuickMech may receive
| image-related request payloads.
|
*/

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

/*
|--------------------------------------------------------------------------
| General API Rate Limiting
|--------------------------------------------------------------------------
|
| trust proxy MUST be configured before this middleware.
|
*/

app.use('/api', apiLimiter);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/mechanics', mechanicRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/services', serviceRoutes);

app.use('/api/vehicles', vehicleRoutes);

/*
|--------------------------------------------------------------------------
| Root API Information
|--------------------------------------------------------------------------
*/

const rootInfo = (req, res) => {
  res.status(200).json({
    success: true,
    name: 'QuickMech REST API',
    version: '1.0.0',
    status: 'online',

    environment:
      process.env.NODE_ENV || 'development',

    endpoints: {
      health: '/api/health',

      mechanics:
        '/api/mechanics',

      nearbyMechanics:
        '/api/mechanics/nearby?lat=12.9716&lng=77.5946',

      auth:
        '/api/auth',

      sendOtp:
        'POST /api/auth/send-otp',

      verifyOtp:
        'POST /api/auth/verify-otp',

      bookings:
        '/api/bookings',

      reviews:
        '/api/reviews',

      services:
        '/api/services',

      payments:
        '/api/payments',

      vehicles:
        '/api/vehicles'
    }
  });
};

app.get('/', rootInfo);

app.get('/api', rootInfo);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
|
| Must be after all valid routes.
|
*/

app.use(notFoundHandler);

/*
|--------------------------------------------------------------------------
| Centralized Error Handler
|--------------------------------------------------------------------------
|
| Must always be the final middleware.
|
*/

app.use(errorHandler);

module.exports = app;