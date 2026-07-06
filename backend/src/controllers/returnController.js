const Return = require('../models/Return');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// USER: Submit return request
exports.createReturn = async (req, res) => {
  const { orderId, productId, reason, description, images, videos, refundMethod } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });
  if (order.status !== 'delivered')
    return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });

  const existing = await Return.findOne({ order: orderId, product: productId, user: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'Return request already submitted for this product' });

  const orderItem = order.items.find(i => i.product.toString() === productId);
  const returnReq = await Return.create({
    order: orderId,
    user: req.user._id,
    product: productId,
    seller: orderItem?.seller,
    reason,
    description,
    images: images || [],
    videos: videos || [],
    refundMethod: refundMethod || 'original_payment',
    refundAmount: orderItem?.price || 0,
    trackingHistory: [{ status: 'pending', note: 'Return request submitted by customer' }],
  });

  await Notification.create({
    title: 'New Return Request',
    message: `Return request submitted for order #${order.orderNumber}`,
    type: 'push',
    targetRole: 'admin',
  });

  res.status(201).json({ success: true, return: returnReq });
};

// USER: Get my returns
exports.getMyReturns = async (req, res) => {
  const returns = await Return.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('order', 'orderNumber')
    .populate('product', 'name images');
  res.json({ success: true, returns });
};

// ADMIN: Get all returns
exports.getAllReturns = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [returns, total] = await Promise.all([
    Return.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalPrice')
      .populate('product', 'name images'),
    Return.countDocuments(query),
  ]);
  res.json({ success: true, returns, total });
};

// ADMIN: Update return status
exports.updateReturnStatus = async (req, res) => {
  const { status, adminNotes, refundAmount, refundMethod } = req.body;
  const returnReq = await Return.findById(req.params.id);
  if (!returnReq) return res.status(404).json({ success: false, message: 'Return not found' });

  returnReq.status = status;
  if (adminNotes) returnReq.adminNotes = adminNotes;
  if (refundAmount !== undefined) returnReq.refundAmount = refundAmount;
  if (refundMethod) returnReq.refundMethod = refundMethod;

  returnReq.trackingHistory.push({ status, note: adminNotes || `Status updated to ${status}`, updatedBy: req.user._id });

  if (status === 'refund_completed') returnReq.refundedAt = new Date();

  await returnReq.save();

  await Notification.create({
    title: 'Return Update',
    message: `Your return request status: ${status.replace(/_/g, ' ')}`,
    type: 'push',
    targetUser: returnReq.user,
    relatedOrder: returnReq.order,
  });

  res.json({ success: true, return: returnReq });
};

// ADMIN: Return dashboard stats
exports.getReturnStats = async (req, res) => {
  const [pending, approved, rejected, refunded] = await Promise.all([
    Return.countDocuments({ status: 'pending' }),
    Return.countDocuments({ status: 'approved' }),
    Return.countDocuments({ status: 'rejected' }),
    Return.countDocuments({ status: 'refund_completed' }),
  ]);
  res.json({ success: true, stats: { pending, approved, rejected, refunded } });
};

// SELLER: Get return requests for seller's products
exports.getSellerReturns = async (req, res) => {
  const returns = await Return.find({ seller: req.seller._id })
    .sort('-createdAt')
    .populate('user', 'name email')
    .populate('order', 'orderNumber')
    .populate('product', 'name images');
  res.json({ success: true, returns });
};

// COURIER: mark an assigned return pickup as completed (mirrors the order pickup flow)
exports.courierUpdateReturnPickup = async (req, res) => {
  const { location, note } = req.body;
  const returnDoc = await Return.findOne({ _id: req.params.id, assignedCourier: req.courier._id });
  if (!returnDoc) return res.status(404).json({ success: false, message: 'Return not found or not assigned to you' });
  if (returnDoc.status !== 'pickup_scheduled')
    return res.status(400).json({ success: false, message: 'Return is not scheduled for pickup yet' });

  returnDoc.status = 'picked_up';
  returnDoc.pickupDate = new Date();
  returnDoc.trackingHistory.push({ status: 'picked_up', location, note: note || 'Return parcel picked up by courier' });
  await returnDoc.save();
  res.json({ success: true, return: returnDoc });
};
