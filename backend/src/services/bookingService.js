const prisma = require('../config/prisma');

const localBookingsStore = [];

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

  try {
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
  } catch (err) {
    const newBooking = {
      id: Date.now(),
      mechanicId: parseInt(mechanicId, 10),
      userId: user?.id || null,
      userMobile: user?.mobileNumber || userMobile || null,
      username: user?.username || username || 'Guest',
      bookingDate,
      bookingTime,
      amount: parseFloat(amount),
      status: 'CONFIRMED',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    localBookingsStore.push(newBooking);
    return newBooking;
  }
};

/**
 * Retrieves bookings for a specific user or all bookings for admin
 */
const getBookings = async (userId = null, userMobile = null) => {
  try {
    const where = {};
    if (userId) {
      where.userId = parseInt(userId, 10);
    } else if (userMobile) {
      where.userMobile = userMobile;
    }

    return await prisma.booking.findMany({
      where,
      include: {
        mechanic: true,
        service: true,
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    return localBookingsStore.filter(b => (!userMobile || b.userMobile === userMobile));
  }
};

/**
 * Updates status of a booking
 */
const updateBookingStatus = async (bookingId, status) => {
  try {
    return await prisma.booking.update({
      where: { id: parseInt(bookingId, 10) },
      data: { status }
    });
  } catch {
    const booking = localBookingsStore.find(b => b.id === parseInt(bookingId, 10));
    if (booking) booking.status = status;
    return booking || { id: bookingId, status };
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};
