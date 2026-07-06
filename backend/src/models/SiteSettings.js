const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'LuxeFit' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  address: { type: String, default: '' },
  // Payment
  codEnabled: { type: Boolean, default: true },
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  upiId: { type: String, default: '' },
  // Shipping
  defaultShippingCharge: { type: Number, default: 50 },
  freeShippingThreshold: { type: Number, default: 499 },
  // Tax
  gstPercentage: { type: Number, default: 18 },
  // SEO
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  // SMTP
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, select: false },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
