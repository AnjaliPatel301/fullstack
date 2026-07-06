const express = require('express');
const router = express.Router();
const {
  registerSeller, loginSeller, getSellerMe,
  updateShopSettings,
  getSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct,
  getSellerOrders, acceptOrder, rejectOrder, packOrder, readyForPickup,
  getSellerOrderInvoice, getSellerShippingLabel,
  getSellerEarnings, requestWithdrawal, getSellerWithdrawals,
  getPublicShop,
} = require('../controllers/sellerController');
const { protectSeller } = require('../middleware/auth');

// Public
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.get('/shop/:slug', getPublicShop);

// Protected (approved sellers only)
router.get('/me', protectSeller, getSellerMe);
router.put('/shop', protectSeller, updateShopSettings);

router.get('/products', protectSeller, getSellerProducts);
router.post('/products', protectSeller, createSellerProduct);
router.put('/products/:id', protectSeller, updateSellerProduct);
router.delete('/products/:id', protectSeller, deleteSellerProduct);

router.get('/orders', protectSeller, getSellerOrders);
router.put('/orders/:id/accept', protectSeller, acceptOrder);
router.put('/orders/:id/reject', protectSeller, rejectOrder);
router.put('/orders/:id/pack', protectSeller, packOrder);
router.put('/orders/:id/ready-for-pickup', protectSeller, readyForPickup);
router.get('/orders/:id/invoice', protectSeller, getSellerOrderInvoice);
router.get('/orders/:id/shipping-label', protectSeller, getSellerShippingLabel);

router.get('/earnings', protectSeller, getSellerEarnings);
router.post('/withdrawals', protectSeller, requestWithdrawal);
router.get('/withdrawals', protectSeller, getSellerWithdrawals);

module.exports = router;
