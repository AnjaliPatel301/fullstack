const express = require('express');
const router = express.Router();
const {
  createBanner, getActiveBanners, getAllBanners, updateBanner, deleteBanner, toggleBanner
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');

router.get('/active', getActiveBanners);
router.get('/', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.put('/:id/toggle', protect, admin, toggleBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
