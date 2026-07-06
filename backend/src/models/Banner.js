const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  mobileImage: { type: String },
  redirectLink: { type: String, default: '' },
  type: {
    type: String,
    enum: ['desktop', 'mobile', 'category', 'festival'],
    default: 'desktop',
  },
  category: { type: String },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
