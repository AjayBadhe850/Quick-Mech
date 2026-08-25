const prisma = require('../config/prisma');

/**
 * Records a payment transaction
 */
const recordPayment = async (paymentData, user = null) => {
  const {
    userMobile,
    username,
    mechanicId,
    bookingId,
    amount,
    status = 'completed',
    method = 'upi',
    notes
  } = paymentData;

  const payment = await prisma.payment.create({
    data: {
      userId: user?.id || null,
      userMobile: user?.mobileNumber || userMobile,
      username: user?.username || username || 'Guest',
      mechanicId: mechanicId ? parseInt(mechanicId, 10) : null,
      bookingId: bookingId ? parseInt(bookingId, 10) : null,
      amount: parseFloat(amount),
      status,
      method,
      notes
    },
    include: {
      mechanic: true
    }
  });

  // If there is an associated booking, update booking payment status
  if (bookingId && status === 'completed') {
    await prisma.booking.update({
      where: { id: parseInt(bookingId, 10) },
      data: { paymentStatus: 'completed' }
    }).catch(() => {});
  }

  return payment;
};

/**
 * Gets payments for a user by mobile number or user ID
 */
const getPaymentsForUser = async (userMobile, userId = null) => {
  const where = {};
  if (userId) {
    where.userId = parseInt(userId, 10);
  } else if (userMobile) {
    where.userMobile = userMobile;
  }

  return prisma.payment.findMany({
    where,
    include: {
      mechanic: true,
      booking: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  recordPayment,
  getPaymentsForUser
};
