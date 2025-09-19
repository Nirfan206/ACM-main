// controllers/review.controller.js
const Review = require('../models/Review');

/**
 * GET /api/reviews
 * Fetch all reviews by the logged-in user
 */
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate({
        path: 'booking',
        populate: { path: 'service', select: 'type' } // Populate service type within booking
      })
      .populate('user', 'profile.name'); // Populate user name
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

/**
 * GET /api/reviews/all
 * Fetch all reviews for public display
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'profile.name') // Populate user to get name
      .populate({
        path: 'booking',
        populate: { path: 'service', select: 'type' } // Populate service type within booking
      })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

/**
 * POST /api/reviews
 * Create a new review for a service/booking
 */
const createReview = async (req, res) => {
  try {
    // Optional: validate rating
    if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({ ...req.body, user: req.user.id });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error creating review', error: err.message });
  }
};

/**
 * PUT /api/reviews/:id
 * Update an existing review by the logged-in user
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error updating review', error: err.message });
  }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review by the logged-in user
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};

module.exports = { getReviews, getAllReviews, createReview, updateReview, deleteReview };