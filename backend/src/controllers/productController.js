const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  const {
    page = 1, limit = 12, category, subCategory, productType, brand,
    minPrice, maxPrice, size, color, sort = '-createdAt',
    search, isFeatured, isFlashSale
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (productType) query.productType = productType;
  if (brand) query.brand = brand;
  if (isFeatured === 'true') query.isFeatured = true;
  if (isFlashSale === 'true') query.isFlashSale = true;
  if (size) query.sizes = { $in: [size] };
  if (color) query.colors = { $in: [color] };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) query.$text = { $search: search };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

exports.createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
};

exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true }).limit(8);
  res.json({ success: true, products });
};

exports.getFlashSaleProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFlashSale: true }).limit(8);
  res.json({ success: true, products });
};

// ─── Variant Controllers ───────────────────────────────────────────────────────

exports.addVariant = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const variantData = req.body;

  // If first variant or isDefault requested, clear other defaults
  if (variantData.isDefault || product.variants.length === 0) {
    product.variants.forEach(v => { v.isDefault = false; });
    variantData.isDefault = true;
  }

  product.variants.push(variantData);

  // Sync legacy colors array from variants
  const activeColors = product.variants.filter(v => v.isActive).map(v => v.colorName);
  product.colors = [...new Set([...product.colors, ...activeColors])];

  await product.save();
  res.status(201).json({ success: true, product });
};

exports.updateVariant = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const variant = product.variants.id(req.params.variantId);
  if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

  const updates = req.body;

  // If setting as default, clear others
  if (updates.isDefault) {
    product.variants.forEach(v => { v.isDefault = false; });
  }

  Object.assign(variant, updates);

  // Sync legacy colors array
  const activeColors = product.variants.filter(v => v.isActive).map(v => v.colorName);
  product.colors = [...new Set(activeColors)];

  await product.save();
  res.json({ success: true, product });
};

exports.deleteVariant = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const variant = product.variants.id(req.params.variantId);
  if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

  variant.deleteOne();

  // Sync legacy colors array
  const activeColors = product.variants.filter(v => v.isActive).map(v => v.colorName);
  product.colors = [...new Set(activeColors)];

  await product.save();
  res.json({ success: true, message: 'Variant deleted', product });
};

exports.reorderVariantImages = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const variant = product.variants.id(req.params.variantId);
  if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

  const { images } = req.body;
  if (!Array.isArray(images)) return res.status(400).json({ success: false, message: 'images must be an array' });

  variant.images = images;
  await product.save();
  res.json({ success: true, product });
};
