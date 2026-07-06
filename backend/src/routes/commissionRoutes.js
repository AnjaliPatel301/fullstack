const express = require('express');
const router = express.Router();
const {
  getAllCommissions, setGlobalCommission, setCategoryCommission, setSellerCommission, deleteCommission
} = require('../controllers/commissionController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);
router.get('/', getAllCommissions);
router.post('/global', setGlobalCommission);
router.post('/category', setCategoryCommission);
router.post('/seller', setSellerCommission);
router.delete('/:id', deleteCommission);

module.exports = router;
