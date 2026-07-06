const express = require('express');
const router = express.Router();
const {
  createReview, getProductReviews, getMyReviews,
  getSellerProductReviews, replyToReview,
  getAllReviews, deleteReview, toggleReviewVisibility
} = require('../controllers/reviewController');
const { protect, admin, protectSeller } = require('../middleware/auth');

// Public
router.get('/product/:productId', getProductReviews);

// User
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);

// Seller
router.get('/seller/reviews', protectSeller, getSellerProductReviews);
router.put('/:id/reply', protectSeller, replyToReview);

// Admin
router.get('/', protect, admin, getAllReviews);
router.delete('/:id', protect, admin, deleteReview);
router.put('/:id/toggle-visibility', protect, admin, toggleReviewVisibility);

module.exports = router;
