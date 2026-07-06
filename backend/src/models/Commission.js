const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['global', 'category', 'seller'],
    required: true,
  },
  // For category commission
  category: { type: String },
  // For seller commission
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);
