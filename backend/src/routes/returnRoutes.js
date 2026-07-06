const express = require('express');
const router = express.Router();
const {
  createReturn, getMyReturns, getAllReturns, updateReturnStatus, getReturnStats, getSellerReturns,
  courierUpdateReturnPickup,
} = require('../controllers/returnController');
const { protect, admin, protectSeller, protectCourier } = require('../middleware/auth');

// User routes
router.post('/', protect, createReturn);
router.get('/my-returns', protect, getMyReturns);

// Admin routes
router.get('/', protect, admin, getAllReturns);
router.get('/stats', protect, admin, getReturnStats);
router.put('/:id', protect, admin, updateReturnStatus);

// Seller routes
router.get('/seller/returns', protectSeller, getSellerReturns);

// Courier route
router.put('/:id/pickup', protectCourier, courierUpdateReturnPickup);

module.exports = router;
