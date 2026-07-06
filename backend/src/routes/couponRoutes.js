const express = require('express');
const router = express.Router();
const { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, admin, getAllCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
