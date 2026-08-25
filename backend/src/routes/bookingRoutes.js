const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const validate = require('../middleware/validateMiddleware');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/bookingValidator');
const { optionalAuth, authenticateUser } = require('../middleware/authMiddleware');

// Create booking (authenticated or guest with mobile number)
router.post('/', optionalAuth, validate(createBookingSchema), bookingController.handleCreateBooking);

// Get bookings
router.get('/', optionalAuth, bookingController.handleGetBookings);

// Update status
router.patch('/:id/status', authenticateUser, validate(updateBookingStatusSchema), bookingController.handleUpdateBookingStatus);

module.exports = router;
