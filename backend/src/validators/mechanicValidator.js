const { z } = require('zod');

const nearbyMechanicsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(500).default(50),
  category: z.string().optional()
});

const createMechanicSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  category: z.string().default('General Repair'),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  priceRange: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.string().default('Active'),
  availability: z.string().default('Available now'),
  openingHours: z.string().optional(),
  image: z.string().default('🔧'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  address: z.string().min(3),
  description: z.string().optional(),
  certified: z.boolean().default(false),
  offer: z.string().optional(),
  isNew: z.boolean().default(false),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  images: z.array(z.string()).optional()
});

module.exports = {
  nearbyMechanicsSchema,
  createMechanicSchema
};
