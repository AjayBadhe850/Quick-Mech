const prisma = require('../config/prisma');

/**
 * Creates a new service booking
 */
const createBooking = async (bookingData, user = null) => {
  const {
    mechanicId,
    bookingDate,
    bookingTime,
    amount = 499,
    vehicleId,
    serviceId,
    notes,
    paymentMethod = 'upi',
    userMobile,
    username
  } = bookingData;

  const booking = await prisma.booking.create({
    data: {
      mechanicId: parseInt(mechanicId, 10),
      userId: user?.id || null,
      userMobile: user?.mobileNumber || userMobile || null,
      username: user?.username || username || 'Guest',
      bookingDate,
      bookingTime,
      amount: parseFloat(amount),
      vehicleId: vehicleId ? parseInt(vehicleId, 10) : null,
      serviceId: serviceId ? parseInt(serviceId, 10) : null,
      notes,
      paymentMethod,
      status: 'CONFIRMED',
      paymentStatus: 'pending'
    },
    include: {
      mechanic: true,
      service: true,
      vehicle: true
    }
  });

  return booking;
};

/**
 * Retrieves bookings for a specific user or all bookings for admin
 */
const getBookings = async (userId = null, userMobile = null) => {
  const where = {};
  if (userId) {
    where.userId = parseInt(userId, 10);
  } else if (userMobile) {
    where.userMobile = userMobile;
  }

  return prisma.booking.findMany({
    where,
    include: {
      mechanic: true,
      service: true,
      vehicle: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Updates status of a booking
 */
const updateBookingStatus = async (bookingId, status) => {
  return prisma.booking.update({
    where: { id: parseInt(bookingId, 10) },
    data: { status }
  });
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};
