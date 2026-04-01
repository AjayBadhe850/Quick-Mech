const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickmech';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schemas
const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const mechanicImageSchema = new mongoose.Schema({
  mechanicId: { type: Number, required: true, unique: true },
  images: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  userMobile: { type: String, required: true },
  username: { type: String, default: 'Guest' },
  mechanicId: { type: Number, required: true },
  mechanicName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  method: { type: String, default: 'upi' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  username: { type: String, required: true },
  eventType: { type: String, enum: ['login', 'logout'], required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const adminSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'QuickMech' },
  tagline: { type: String, default: 'Mechanic Near You' },
  supportEmail: { type: String, default: 'support@quickmech.com' },
  contactNumber: { type: String, default: '7396230359' },
  referralCode: { type: String, default: 'QM2024USER789' },
  welcomeMessage: { type: String, default: 'Edit site content, mechanics, and booking details from this admin panel.' },
  updatedAt: { type: Date, default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);
const User = mongoose.model('User', userSchema);
const MechanicImages = mongoose.model('MechanicImages', mechanicImageSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const SessionEvent = mongoose.model('SessionEvent', sessionSchema);
const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate referral code
const generateReferralCode = () => {
  return 'QM' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
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
    await OTP.findOneAndUpdate(
      { mobileNumber },
      {
        mobileNumber,
        username,
        otp: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0
      },
      { upsert: true, new: true }
    );

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
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP required'
      });
    }

    const storedData = await OTP.findOne({ mobileNumber });

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this number. Please request a new OTP.'
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt.getTime()) {
      await OTP.deleteOne({ mobileNumber });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      await OTP.deleteOne({ mobileNumber });
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      await storedData.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - storedData.attempts
      });
    }

    // OTP verified successfully - create/update user
    const username = storedData.username;
    let user = await User.findOne({ mobileNumber });

    if (!user) {
      user = new User({
        username,
        mobileNumber,
        isVerified: true,
        referralCode: generateReferralCode()
      });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }

    await SessionEvent.create({
      mobileNumber,
      username,
      eventType: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // Delete OTP after successful verification
    await OTP.deleteOne({ mobileNumber });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      username: username,
      mobileNumber: mobileNumber,
      user: {
        id: user._id,
        username: user.username,
        referralCode: user.referralCode
      }
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
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number required'
      });
    }

    const storedData = await OTP.findOne({ mobileNumber });

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request a new OTP.'
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    storedData.otp = newOtp;
    storedData.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    storedData.attempts = 0;
    await storedData.save();

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

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required to create an order.'
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured on the server.'
      });
    }

    const razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });

    const options = {
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: razorpayKeyId
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to create Razorpay order.',
      error: error.message
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are missing.'
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully.'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to verify payment.',
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/user/:mobileNumber', async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        earnings: user.earnings,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Store mechanic images for a given mechanic in MongoDB
app.post('/api/mechanics/:id/images', async (req, res) => {
  try {
    const mechanicId = Number(req.params.id);
    const { images } = req.body;

    if (!mechanicId || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mechanic ID and image array are required.'
      });
    }

    const record = await MechanicImages.findOneAndUpdate(
      { mechanicId },
      { $addToSet: { images: { $each: images.filter(Boolean) } }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, images: record.images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to store mechanic images.', error: error.message });
  }
});

app.get('/api/mechanics/:id/images', async (req, res) => {
  try {
    const mechanicId = Number(req.params.id);
    const record = await MechanicImages.findOne({ mechanicId });
    res.json({ success: true, images: record?.images || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load mechanic images.', error: error.message });
  }
});

// Create payment record
app.post('/api/payments', async (req, res) => {
  try {
    const { userMobile, username, mechanicId, mechanicName, amount, status, method, notes } = req.body;

    if (!userMobile || !mechanicId || !mechanicName || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields.' });
    }

    const payment = new Payment({
      userMobile,
      username: username || 'Guest',
      mechanicId,
      mechanicName,
      amount,
      status: status || 'pending',
      method: method || 'upi',
      notes
    });

    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save payment.', error: error.message });
  }
});

app.get('/api/payments/:mobileNumber', async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const payments = await Payment.find({ userMobile: mobileNumber }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load payments.', error: error.message });
  }
});

// Record login/logout activity
app.post('/api/auth/session', async (req, res) => {
  try {
    const { mobileNumber, username, eventType } = req.body;

    if (!mobileNumber || !username || !['login', 'logout'].includes(eventType)) {
      return res.status(400).json({ success: false, message: 'mobileNumber, username, and valid eventType are required.' });
    }

    const event = new SessionEvent({
      mobileNumber,
      username,
      eventType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record session event.', error: error.message });
  }
});

// Admin settings storage
app.get('/api/admin/settings', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load admin settings.', error: error.message });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  try {
    const updates = req.body;
    const settings = await AdminSettings.findOneAndUpdate({}, { ...updates, updatedAt: new Date() }, { upsert: true, new: true });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save admin settings.', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get("/", (req, res) => {
  res.send("QuickMech Backend Alive 🔥");
});


const PORT = process.env.BACKEND_PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ QuickMech Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api\n`);
});
