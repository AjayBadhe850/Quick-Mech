const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Resend } = require('resend');

const app = express();

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for OTPs (for demo - use database in production)
const otpStore = {};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isEmailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const sendOtpEmail = async (email, otp, username) => {
  if (!resend || !resendFromEmail) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');
  }

  return resend.emails.send({
    from: resendFromEmail,
    to: email,
    subject: 'Your QuickMech OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 16px;">QuickMech OTP Verification</h2>
        <p style="margin: 0 0 12px;">Hi ${username},</p>
        <p style="margin: 0 0 12px;">Use the following one-time password to sign in to QuickMech:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 8px;">${otp}</div>
        <p style="margin: 16px 0 0;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
};

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { mobileNumber, contactValue, username } = req.body;
    const contact = contactValue || mobileNumber;

    if (!contact || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact value and username required' 
      });
    }

    const isMobile = /^\d{10}$/.test(contact);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

    if (!isMobile && !isEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid contact value. Use a 10-digit mobile number or email address.' 
      });
    }

    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore[contact] = {
      otp: otp,
      username: username,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };

    if (isEmailAddress(contact)) {
      await sendOtpEmail(contact, otp, username);
      console.log(`\n✉️ OTP sent to ${contact}: ${otp}`);
      console.log(`OTP expires in 5 minutes\n`);
    } else {
      // In production, integrate with Twilio, AWS SNS, or your SMS provider
      console.log(`\n📱 OTP sent to ${contact}: ${otp}`);
      console.log(`OTP expires in 5 minutes\n`);
    }

    res.json({ 
      success: true, 
      message: `OTP sent to ${contact}`,
      // Remove this in production - only for testing
      devOtp: otp
    });
  } catch (error) {
    if (error && error.message && error.message.includes('Resend is not configured')) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

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
    const { mobileNumber, contactValue, otp } = req.body;
    const contact = contactValue || mobileNumber;

    if (!contact || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact value and OTP required' 
      });
    }

    const storedData = otpStore[contact];

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found for this number. Please request a new OTP.' 
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      delete otpStore[contact];
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      delete otpStore[contact];
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
    delete otpStore[contact];

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      username: username,
      mobileNumber: contact
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
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { mobileNumber, contactValue } = req.body;
    const contact = contactValue || mobileNumber;

    if (!contact) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact value required' 
      });
    }

    const storedData = otpStore[contact];

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

    if (isEmailAddress(contact)) {
      await sendOtpEmail(contact, newOtp, storedData.username);
      console.log(`\n✉️ OTP resent to ${contact}: ${newOtp}`);
      console.log(`OTP expires in 5 minutes\n`);
    } else {
      console.log(`\n📱 OTP resent to ${contact}: ${newOtp}`);
      console.log(`OTP expires in 5 minutes\n`);
    }

    res.json({ 
      success: true, 
      message: `OTP resent to ${contact}`,
      // Remove this in production - only for testing
      devOtp: newOtp
    });
  } catch (error) {
    if (error && error.message && error.message.includes('Resend is not configured')) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

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

// Serve static frontend files (for production build)
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to React app for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.BACKEND_PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ QuickMech Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api\n`);
});
