const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getFeaturedProducts, getFlashSaleProducts,
  addVariant, updateVariant, deleteVariant, reorderVariantImages
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Variant routes
router.post('/:id/variants', protect, admin, addVariant);
router.put('/:id/variants/:variantId', protect, admin, updateVariant);
router.delete('/:id/variants/:variantId', protect, admin, deleteVariant);
router.put('/:id/variants/:variantId/reorder-images', protect, admin, reorderVariantImages);

module.exports = router;
