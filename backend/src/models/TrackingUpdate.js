const mongoose = require('mongoose');

const trackingUpdateSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'CourierPartner' },
  status: {
    type: String,
    enum: [
      'order_placed', 'seller_accepted', 'packed', 'ready_for_pickup',
      'picked_up', 'shipped', 'reached_sorting_center', 'in_transit',
      'reached_destination_city', 'out_for_delivery', 'delivered',
      'failed_delivery', 'returned', 'cancelled'
    ],
    required: true,
  },
  location: { type: String },
  note: { type: String },
  timestamp: { type: Date, default: Date.now },
  deliveryPhoto: { type: String },
  customerSignature: { type: String },
  failureReason: {
    type: String,
    enum: ['customer_not_available', 'wrong_address', 'delivery_refused', 'reschedule_requested'],
  },
}, { timestamps: true });

module.exports = mongoose.model('TrackingUpdate', trackingUpdateSchema);
