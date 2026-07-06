const Category = require('../models/Category');

const FIXED_CATEGORIES = [
  { slug: 'men', name: "Men's Fashion" },
  { slug: 'women', name: "Women's Fashion" },
  { slug: 'kids', name: 'Kids Fashion' },
  { slug: 'accessories', name: 'Accessories' },
];

// Auto-initialize fixed categories if they don't exist
const ensureFixedCategories = async () => {
  for (const cat of FIXED_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({ name: cat.name, slug: cat.slug, types: [], isActive: true });
    }
  }
};

// Get all active categories (public)
exports.getCategories = async (req, res) => {
  await ensureFixedCategories();
  const categories = await Category.find({ isActive: true }).sort({ slug: 1 });
  // Return in fixed order
  const ordered = FIXED_CATEGORIES.map(fc => categories.find(c => c.slug === fc.slug)).filter(Boolean);
  res.json({ success: true, categories: ordered });
};

// Get all categories including inactive (admin)
exports.getAllCategories = async (req, res) => {
  await ensureFixedCategories();
  const categories = await Category.find().sort({ slug: 1 });
  const ordered = FIXED_CATEGORIES.map(fc => categories.find(c => c.slug === fc.slug)).filter(Boolean);
  res.json({ success: true, categories: ordered });
};

// Create category — disabled (only 4 fixed categories allowed)
exports.createCategory = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Main categories are fixed. Only subcategories (types) can be added.',
  });
};

// Update category active status only (name and slug are locked)
exports.updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  // Only allow toggling isActive; name and slug are fixed
  if (req.body.isActive !== undefined) {
    category.isActive = req.body.isActive;
    await category.save();
  }
  res.json({ success: true, category });
};

// Delete category — disabled
exports.deleteCategory = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Main categories cannot be deleted.',
  });
};

// Add a subcategory (type) to a category
exports.addType = async (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ success: false, message: 'Subcategory name is required' });
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const normalizedType = type.trim();
  if (category.types.map(t => t.toLowerCase()).includes(normalizedType.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Subcategory already exists in this category' });
  }
  category.types.push(normalizedType);
  await category.save();
  res.json({ success: true, category });
};

// Remove a subcategory (type)
exports.removeType = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const typeToRemove = decodeURIComponent(req.params.type);
  category.types = category.types.filter(t => t !== typeToRemove);
  await category.save();
  res.json({ success: true, category });
};

// Rename a subcategory (type)
exports.renameType = async (req, res) => {
  const { oldType, newType } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const idx = category.types.indexOf(oldType);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Subcategory not found' });
  category.types[idx] = newType.trim();
  await category.save();
  res.json({ success: true, category });
};

// Get subcategories for a given category slug (public)
exports.getSubcategories = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, subcategories: category.types });
};
