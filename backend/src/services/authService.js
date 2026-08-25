const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const env = require('../config/env');
const prisma = require('../config/prisma');

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Generates a cryptographically secure 6-digit OTP
 */
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes OTP using SHA-256
 */
const hashOTP = (otp, contact) => {
  return crypto.createHmac('sha256', env.JWT_SECRET).update(`${contact}:${otp}`).digest('hex');
};

/**
 * Validates email address format
 */
const isEmailAddress = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * Sends OTP via Resend email service
 */
const sendOtpEmail = async (email, otp, username) => {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    console.warn('⚠️ Resend is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL). Logging OTP to console.');
    return { id: 'mock-email-id' };
  }

  return resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: 'Your QuickMech OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
        <h2 style="color: #6366f1; margin: 0 0 16px;">QuickMech Verification</h2>
        <p style="margin: 0 0 12px; font-size: 16px;">Hi <strong>${username}</strong>,</p>
        <p style="margin: 0 0 16px; color: #4b5563;">Use the following One-Time Password (OTP) to sign in to QuickMech:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 14px 20px; background: #f3f4f6; text-align: center; border-radius: 8px; color: #1e1b4b; margin-bottom: 16px;">${otp}</div>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">This code is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
      </div>
    `
  });
};

/**
 * Issues JWT for an authenticated user
 */
const generateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Creates and dispatches OTP
 */
const requestOtp = async (contactValue, username) => {
  const normalizedContact = contactValue.trim().toLowerCase();
  const otp = generateSecureOTP();
  const otpHash = hashOTP(otp, normalizedContact);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Invalidate any previous active OTPs for this contact
  await prisma.otpVerification.updateMany({
    where: { contact: normalizedContact, verified: false },
    data: { verified: true }
  });

  // Save hashed OTP in database
  await prisma.otpVerification.create({
    data: {
      contact: normalizedContact,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false
    }
  });

  if (isEmailAddress(normalizedContact)) {
    await sendOtpEmail(normalizedContact, otp, username);
    console.log(`\n✉️ [RESEND OTP] Sent to ${normalizedContact}: ${otp} (expires in 5 min)`);
  } else {
    // In production, integrate SMS provider (Twilio / AWS SNS / Fast2SMS)
    console.log(`\n📱 [SMS OTP] Sent to ${normalizedContact}: ${otp} (expires in 5 min)`);
  }

  return {
    contact: normalizedContact,
    expiresInSeconds: 300,
    devOtp: env.NODE_ENV !== 'production' ? otp : undefined
  };
};

/**
 * Verifies OTP and generates authenticated user session
 */
const verifyOtp = async (contactValue, otp) => {
  const normalizedContact = contactValue.trim().toLowerCase();
  const providedHash = hashOTP(otp.trim(), normalizedContact);

  const record = await prisma.otpVerification.findFirst({
    where: {
      contact: normalizedContact,
      verified: false
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    throw { statusCode: 400, message: 'No OTP request found for this contact. Please request a new OTP.', code: 'NO_OTP_FOUND' };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    });
    throw { statusCode: 400, message: 'OTP has expired. Please request a new OTP.', code: 'OTP_EXPIRED' };
  }

  // Check attempts limit (max 5)
  if (record.attempts >= 5) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    });
    throw { statusCode: 400, message: 'Too many incorrect attempts. Please request a new OTP.', code: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  // Verify hash
  if (record.otpHash !== providedHash) {
    const updatedAttempts = record.attempts + 1;
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: updatedAttempts }
    });
    throw {
      statusCode: 400,
      message: 'Invalid OTP code. Please try again.',
      code: 'INVALID_OTP',
      attemptsRemaining: Math.max(0, 5 - updatedAttempts)
    };
  }

  // Mark OTP as verified/consumed
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true }
  });

  // Upsert user in database
  const isEmail = isEmailAddress(normalizedContact);
  const whereClause = isEmail
    ? { email: normalizedContact }
    : { mobileNumber: normalizedContact };

  let user = await prisma.user.findFirst({ where: whereClause });

  if (!user) {
    const randomCode = 'QM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    user = await prisma.user.create({
      data: {
        username: isEmail ? normalizedContact.split('@')[0] : `User_${normalizedContact.slice(-4)}`,
        email: isEmail ? normalizedContact : null,
        mobileNumber: isEmail ? null : normalizedContact,
        role: (normalizedContact === '7396230359' || normalizedContact === 'ajay@quickmech.com') ? 'ADMIN' : 'USER',
        referralCode: randomCode
      }
    });
  }

  const token = generateJwtToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance
    },
    token
  };
};

module.exports = {
  requestOtp,
  verifyOtp,
  generateJwtToken,
  isEmailAddress
};
