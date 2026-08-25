const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

const handleSendOtp = async (req, res, next) => {
  try {
    const { contactValue, mobileNumber, username } = req.body;
    const targetContact = contactValue || mobileNumber;

    const result = await authService.requestOtp(targetContact, username);

    return successResponse(
      res,
      {
        contact: result.contact,
        devOtp: result.devOtp,
        expiresInSeconds: result.expiresInSeconds
      },
      `OTP sent successfully to ${result.contact}`
    );
  } catch (error) {
    next(error);
  }
};

const handleVerifyOtp = async (req, res, next) => {
  try {
    const { contactValue, mobileNumber, otp } = req.body;
    const targetContact = contactValue || mobileNumber;

    const result = await authService.verifyOtp(targetContact, otp);

    return successResponse(
      res,
      {
        user: result.user,
        username: result.user.username,
        mobileNumber: result.user.mobileNumber || targetContact,
        token: result.token
      },
      'OTP verified successfully'
    );
  } catch (error) {
    next(error);
  }
};

const handleResendOtp = async (req, res, next) => {
  try {
    const { contactValue, mobileNumber, username } = req.body;
    const targetContact = contactValue || mobileNumber;

    const result = await authService.requestOtp(targetContact, username || 'User');

    return successResponse(
      res,
      {
        contact: result.contact,
        devOtp: result.devOtp
      },
      `OTP resent to ${result.contact}`
    );
  } catch (error) {
    next(error);
  }
};

const handleGetCurrentUser = async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current user profile');
};

const handleRecordSession = async (req, res) => {
  // Safe lightweight analytics session endpoint for frontend backwards compatibility
  return successResponse(res, { recorded: true }, 'Session logged');
};

module.exports = {
  handleSendOtp,
  handleVerifyOtp,
  handleResendOtp,
  handleGetCurrentUser,
  handleRecordSession
};
