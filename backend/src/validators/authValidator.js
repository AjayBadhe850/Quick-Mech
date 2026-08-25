const { z } = require('zod');

const sendOtpSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100),
  contactValue: z.string().trim().min(3, 'Mobile number or email address is required').max(150),
  mobileNumber: z.string().trim().optional()
});

const verifyOtpSchema = z.object({
  contactValue: z.string().trim().min(3, 'Mobile number or email is required'),
  mobileNumber: z.string().trim().optional(),
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers')
});

const resendOtpSchema = z.object({
  contactValue: z.string().trim().min(3, 'Mobile number or email is required'),
  mobileNumber: z.string().trim().optional()
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema
};
