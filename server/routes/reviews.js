const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// ---------------------------
// Review Routes
// ---------------------------

// GET /api/reviews/all
// Get all reviews for public display (no auth required)
router.get('/all', getAllReviews);

// GET /api/reviews
// Get all reviews of the logged-in customer
router.get('/', auth(['customer']), getReviews);

// POST /api/reviews
// Create a new review for a booking
router.post('/', auth(['customer']), createReview);

// PUT /api/reviews/:id
// Update an existing review (only if created by the logged-in customer)
router.put('/:id', auth(['customer']), updateReview);

// DELETE /api/reviews/:id
// Delete a review (only if created by the logged-in customer)
router.delete('/:id', auth(['customer']), deleteReview);

module.exports = router;
