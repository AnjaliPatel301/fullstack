const express = require('express');
const router = express.Router();
const {
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory,
  addType, removeType, renameType, getSubcategories
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/all', protect, admin, getAllCategories);
router.get('/:slug/subcategories', getSubcategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);
router.post('/:id/types', protect, admin, addType);
router.delete('/:id/types/:type', protect, admin, removeType);
router.put('/:id/types/rename', protect, admin, renameType);

module.exports = router;
