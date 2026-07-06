const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  colorName: { type: String, required: true, trim: true },
  colorCode: { type: String, default: '#cccccc', trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, trim: true },
  sizes: [{ type: String }],
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true },
  subCategory: { type: String },
  productType: { type: String },
  brand: { type: String, default: 'LuxeFit' },
  images: [{ type: String }],
  videos: [{ type: String }],
  colorImages: { type: Map, of: [String], default: {} },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleEndsAt: { type: Date },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  // Admin approval for seller products
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved', // Admin products auto-approved
  },
  approvalNote: { type: String },
  variants: [variantSchema],
  // Multi-vendor: seller who owns this product (null = admin product)
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null, index: true },
  weight: { type: Number },
  dimensions: { width: Number, height: Number, length: Number },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
