const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SVljaUWH0od1Sd',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '7Nyc99SGg6QrLhaztoFoHhMZ',
});

exports.createRazorpayOrder = async (req, res) => {
  const { amount, orderId } = req.body;
  const razorpay = getRazorpay();

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `receipt_${orderId}`,
  });

  await Payment.create({
    order: orderId,
    user: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    amount,
  });

  res.json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_SVljaUWH0od1Sd',
  });
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '7Nyc99SGg6QrLhaztoFoHhMZ')
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature)
    return res.status(400).json({ success: false, message: 'Invalid payment signature' });

  await Promise.all([
    Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'captured' }
    ),
    Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: new Date(),
      status: 'confirmed',
      paymentResult: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    }),
  ]);

  res.json({ success: true, message: 'Payment verified successfully' });
};

exports.getPaymentKey = async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID || 'rzp_test_SVljaUWH0od1Sd' });
};
