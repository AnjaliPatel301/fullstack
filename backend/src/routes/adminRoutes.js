const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAdminUsers, toggleUserBlock, deleteUser, getSalesReport
} = require('../controllers/adminController');
const {
  getAllSellers, getSellerById, updateSellerStatus, updateSellerCommission,
  getSellerAnalytics, getAllWithdrawals, updateWithdrawal, setDefaultCommission,
} = require('../controllers/adminSellerController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/reports/sales', getSalesReport);

// User management
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-block', toggleUserBlock);
router.delete('/users/:id', deleteUser);

// Seller management
router.get('/sellers', getAllSellers);
router.get('/sellers/analytics', getSellerAnalytics);
router.get('/sellers/:id', getSellerById);
router.put('/sellers/:id/status', updateSellerStatus);
router.put('/sellers/:id/commission', updateSellerCommission);
router.put('/sellers/default-commission', setDefaultCommission);

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id', updateWithdrawal);

module.exports = router;
