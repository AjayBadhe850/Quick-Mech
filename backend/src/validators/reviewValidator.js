const { z } = require('zod');

const createReviewSchema = z.object({
  mechanicId: z.coerce.number().positive(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(3, 'Review comment must be at least 3 characters'),
  username: z.string().optional()
});

module.exports = {
  createReviewSchema
};
