const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountHolder: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  bankName: { type: String },
}, { _id: false });

const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true, trim: true },
  shopSlug: { type: String, unique: true, lowercase: true, trim: true },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  description: { type: String, default: '' },
  phone: { type: String },
  address: { type: String },
  // Status controlled by admin only
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending',
  },
  // Commission set exclusively by admin (default 10%)
  commissionPercentage: { type: Number, default: 10, min: 0, max: 100 },
  // Financials
  totalEarnings: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  // Bank details for withdrawals
  bankDetails: { type: bankDetailsSchema, default: {} },
  // Rejection reason
  rejectionReason: { type: String },
}, { timestamps: true });

// Auto-generate shopSlug from shopName
sellerSchema.pre('save', function (next) {
  if (this.isModified('shopName') && !this.shopSlug) {
    this.shopSlug = this.shopName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Seller', sellerSchema);
