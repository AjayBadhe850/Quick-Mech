const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

const handleGetReviews = async (req, res, next) => {
  try {
    const mechanicId = req.query.mechanicId ? parseInt(req.query.mechanicId, 10) : undefined;
    const reviews = await prisma.review.findMany({
      where: mechanicId ? { mechanicId } : undefined,
      include: {
        mechanic: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, { reviews }, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleCreateReview = async (req, res, next) => {
  try {
    const { mechanicId, rating, comment, username } = req.body;
    const review = await prisma.review.create({
      data: {
        mechanicId: parseInt(mechanicId, 10),
        rating: parseFloat(rating),
        comment,
        userId: req.user?.id || null,
        username: req.user?.username || username || 'Anonymous'
      }
    });

    // Update mechanic average rating
    const allReviews = await prisma.review.findMany({
      where: { mechanicId: parseInt(mechanicId, 10) }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.mechanic.update({
      where: { id: parseInt(mechanicId, 10) },
      data: {
        rating: +(avgRating.toFixed(1)),
        reviewsCount: allReviews.length
      }
    });

    return successResponse(res, { review }, 'Review posted successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetReviews,
  handleCreateReview
};
