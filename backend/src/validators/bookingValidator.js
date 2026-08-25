const { z } = require('zod');

const createBookingSchema = z.object({
  mechanicId: z.coerce.number().positive(),
  bookingDate: z.string().min(1, 'Booking date is required'),
  bookingTime: z.string().min(1, 'Booking time is required'),
  amount: z.coerce.number().positive().default(499),
  vehicleId: z.coerce.number().optional(),
  serviceId: z.coerce.number().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().default('upi'),
  userMobile: z.string().optional(),
  username: z.string().optional()
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema
};
