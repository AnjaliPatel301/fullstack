const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const courierPartnerSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  deliveryPersonName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  mobile: { type: String, required: true },
  vehicleNumber: { type: String },
  serviceAreas: [{ type: String }],
  photo: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String },
  totalDeliveries: { type: Number, default: 0 },
  lastLogin: { type: Date },
}, { timestamps: true });

courierPartnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

courierPartnerSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

courierPartnerSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id, role: 'courier' },
    process.env.JWT_SECRET || 'luxefit_secret_key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('CourierPartner', courierPartnerSchema);
