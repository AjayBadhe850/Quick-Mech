const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Record payment
router.post('/', optionalAuth, paymentController.handleRecordPayment);

// Get payments for a mobile number or authenticated user
router.get('/:mobileNumber', optionalAuth, paymentController.handleGetPayments);
router.get('/', optionalAuth, paymentController.handleGetPayments);

module.exports = router;
