const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const validate = require('../middleware/validateMiddleware');
const { createReviewSchema } = require('../validators/reviewValidator');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', reviewController.handleGetReviews);
router.post('/', optionalAuth, validate(createReviewSchema), reviewController.handleCreateReview);

module.exports = router;
