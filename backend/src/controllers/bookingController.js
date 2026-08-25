const bookingService = require('../services/bookingService');
const { successResponse } = require('../utils/response');

const handleCreateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user);
    return successResponse(res, { booking }, 'Booking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const handleGetBookings = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userMobile = req.query.userMobile || req.user?.mobileNumber;
    const bookings = await bookingService.getBookings(userId, userMobile);
    return successResponse(res, { bookings }, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleUpdateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.params.id, req.body.status);
    return successResponse(res, { booking }, 'Booking status updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateBooking,
  handleGetBookings,
  handleUpdateBookingStatus
};
