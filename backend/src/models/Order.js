const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: { type: String, default: 'razorpay' },
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  coupon: { type: String },
  couponDiscount: { type: Number, default: 0 },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'packed', 'ready_for_pickup',
      'picked_up', 'shipped', 'reached_sorting_center', 'in_transit',
      'reached_destination_city', 'out_for_delivery', 'delivered',
      'cancelled', 'returned', 'refunded', 'failed_delivery'
    ],
    default: 'pending',
  },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  // Tracking
  trackingNumber: { type: String },
  assignedCourier: { type: mongoose.Schema.Types.ObjectId, ref: 'CourierPartner' },
  courierCompany: { type: String },
  estimatedDelivery: { type: Date },
  // Seller status (for multi-vendor)
  sellerStatus: {
    type: String,
    enum: ['new', 'accepted', 'packed', 'ready_for_pickup'],
    default: 'new',
  },
  rejectionReason: { type: String },
  // Delivery OTP — generated when courier marks "out_for_delivery"; customer shares
  // it with the delivery person, courier submits it to confirm "delivered".
  deliveryOTP: { type: String },
  otpVerified: { type: Boolean, default: false },
  proofOfDelivery: {
    photo: { type: String },
    customerSignature: { type: String },
    notes: { type: String },
  },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `LF${String(Date.now()).slice(-8)}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
