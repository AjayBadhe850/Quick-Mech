const paymentService = require('../services/paymentService');
const { successResponse } = require('../utils/response');

const handleRecordPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.recordPayment(req.body, req.user);
    return successResponse(res, { payment }, 'Payment recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

const handleGetPayments = async (req, res, next) => {
  try {
    const mobileNumber = req.params.mobileNumber || req.query.mobileNumber || req.user?.mobileNumber;
    const payments = await paymentService.getPaymentsForUser(mobileNumber, req.user?.id);
    return successResponse(res, { payments }, 'Payments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRecordPayment,
  handleGetPayments
};
