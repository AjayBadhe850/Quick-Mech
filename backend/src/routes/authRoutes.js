const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { sendOtpSchema, verifyOtpSchema, resendOtpSchema } = require('../validators/authValidator');
const { authenticateUser } = require('../middleware/authMiddleware');
const { otpLimiter } = require('../middleware/rateLimiter');

// OTP Endpoints
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.handleSendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.handleVerifyOtp);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), authController.handleResendOtp);

// User Profile & Session Endpoints
router.get('/me', authenticateUser, authController.handleGetCurrentUser);
router.post('/session', authController.handleRecordSession);

module.exports = router;
