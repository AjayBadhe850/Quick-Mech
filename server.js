const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for OTPs (for demo - use database in production)
const otpStore = {};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
app.post('/api/send-otp', (req, res) => {
  try {
    const { mobileNumber, username } = req.body;

    if (!mobileNumber || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and username required' 
      });
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid mobile number. Must be 10 digits.' 
      });
    }

    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore[mobileNumber] = {
      otp: otp,
      username: username,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };

    // In production, integrate with Twilio, AWS SNS, or your SMS provider
    console.log(`\n📱 OTP sent to ${mobileNumber}: ${otp}`);
    console.log(`OTP expires in 5 minutes\n`);

    res.json({ 
      success: true, 
      message: `OTP sent to ${mobileNumber}`,
      // Remove this in production - only for testing
      devOtp: otp
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and OTP required' 
      });
    }

    const storedData = otpStore[mobileNumber];

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found for this number. Please request a new OTP.' 
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      delete otpStore[mobileNumber];
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      delete otpStore[mobileNumber];
      return res.status(400).json({ 
        success: false, 
        message: 'Too many attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - storedData.attempts
      });
    }

    // OTP verified successfully
    const username = storedData.username;
    delete otpStore[mobileNumber];

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      username: username,
      mobileNumber: mobileNumber
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP',
      error: error.message 
    });
  }
});

// Resend OTP endpoint
app.post('/api/resend-otp', (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number required' 
      });
    }

    const storedData = otpStore[mobileNumber];

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP request found. Please request a new OTP.' 
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    storedData.otp = newOtp;
    storedData.expiresAt = Date.now() + 5 * 60 * 1000; // Reset expiration
    storedData.attempts = 0; // Reset attempts

    console.log(`\n📱 OTP resent to ${mobileNumber}: ${newOtp}`);
    console.log(`OTP expires in 5 minutes\n`);

    res.json({ 
      success: true, 
      message: `OTP resent to ${mobileNumber}`,
      // Remove this in production - only for testing
      devOtp: newOtp
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend OTP',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get("/", (req, res) => {
  res.send("QuickMech Backend Alive 🔥");
});


const PORT = process.env.BACKEND_PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n✅ QuickMech Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api\n`);
});
