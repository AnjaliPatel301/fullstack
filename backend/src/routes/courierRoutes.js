const express = require('express');
const router = express.Router();
const {
  registerCourier, loginCourier, getCourierMe, getCourierOrders,
  updateTracking, getOrderTracking, getCourierStats, scanParcel,
  getAllCouriers, updateCourierStatus, assignCourier,
} = require('../controllers/courierController');
const { protect, admin, protectCourier } = require('../middleware/auth');

// Public
router.post('/register', registerCourier);
router.post('/login', loginCourier);

// Courier protected
router.get('/me', protectCourier, getCourierMe);
router.get('/orders', protectCourier, getCourierOrders);
router.get('/stats', protectCourier, getCourierStats);
router.post('/orders/:orderId/tracking', protectCourier, updateTracking);
router.post('/scan', protectCourier, scanParcel);

// Protected tracking - user/admin/courier can view (ownership checked in controller)
router.get('/orders/:orderId/tracking', protect, getOrderTracking);

// Admin routes
router.get('/admin/all', protect, admin, getAllCouriers);
router.put('/admin/:id/status', protect, admin, updateCourierStatus);
router.post('/admin/orders/:orderId/assign', protect, admin, assignCourier);

module.exports = router;
