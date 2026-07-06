const CourierPartner = require('../models/CourierPartner');
const Order = require('../models/Order');
const TrackingUpdate = require('../models/TrackingUpdate');
const Notification = require('../models/Notification');
const { logTracking } = require('../utils/tracking');

const sendCourierToken = (courier, statusCode, res) => {
  const token = courier.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    courier: {
      _id: courier._id,
      companyName: courier.companyName,
      deliveryPersonName: courier.deliveryPersonName,
      email: courier.email,
      mobile: courier.mobile,
      status: courier.status,
    },
  });
};

// COURIER: Register
exports.registerCourier = async (req, res) => {
  const { companyName, deliveryPersonName, email, password, mobile, vehicleNumber, serviceAreas } = req.body;
  const existing = await CourierPartner.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const courier = await CourierPartner.create({
    companyName, deliveryPersonName, email, password, mobile,
    vehicleNumber, serviceAreas: serviceAreas || [],
  });
  res.status(201).json({ success: true, message: 'Registration submitted. Await admin approval.' });
};

// COURIER: Login
exports.loginCourier = async (req, res) => {
  const { email, password } = req.body;
  const courier = await CourierPartner.findOne({ email }).select('+password');
  if (!courier || !(await courier.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (courier.status !== 'approved')
    return res.status(403).json({ success: false, message: `Account ${courier.status}. Await admin approval.`, status: courier.status });
  courier.lastLogin = new Date();
  await courier.save({ validateBeforeSave: false });
  sendCourierToken(courier, 200, res);
};

// COURIER: Get me
exports.getCourierMe = async (req, res) => {
  const courier = await CourierPartner.findById(req.courier._id);
  res.json({ success: true, courier });
};

// COURIER: Get assigned orders
exports.getCourierOrders = async (req, res) => {
  const { status } = req.query;
  const query = { assignedCourier: req.courier._id };
  if (status) query.status = status;
  const orders = await Order.find(query)
    .select('-deliveryOTP')
    .sort('-createdAt')
    .populate('user', 'name phone')
    .populate('items.product', 'name images');
  res.json({ success: true, orders });
};

// COURIER: Update tracking status
exports.updateTracking = async (req, res) => {
  const { status, location, note, deliveryPhoto, failureReason, otp, customerSignature } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.assignedCourier?.toString() !== req.courier._id.toString())
    return res.status(403).json({ success: false, message: 'Not authorized' });

  // Update order status — every courier-facing status maps 1:1 onto Order.status now
  const orderStatusMap = {
    picked_up: 'picked_up',
    shipped: 'shipped',
    reached_sorting_center: 'reached_sorting_center',
    in_transit: 'in_transit',
    reached_destination_city: 'reached_destination_city',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    failed_delivery: 'failed_delivery',
    returned: 'returned',
  };

  if (status === 'delivered' && order.deliveryOTP && otp && otp !== order.deliveryOTP) {
    return res.status(400).json({ success: false, message: 'Incorrect delivery OTP.' });
  }

  if (orderStatusMap[status]) {
    order.status = orderStatusMap[status];
    if (status === 'out_for_delivery' && !order.deliveryOTP) {
      // Generate a 4-digit OTP the customer shares with the courier at doorstep
      order.deliveryOTP = String(Math.floor(1000 + Math.random() * 9000));
    }
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      if (order.deliveryOTP && otp === order.deliveryOTP) order.otpVerified = true;
      if (deliveryPhoto || customerSignature || note) {
        order.proofOfDelivery = {
          photo: deliveryPhoto || order.proofOfDelivery?.photo,
          customerSignature: customerSignature || order.proofOfDelivery?.customerSignature,
          notes: note || order.proofOfDelivery?.notes,
        };
      }
    }
    await order.save();
  }

  const tracking = await logTracking(
    order._id,
    { status, location, note, courier: req.courier._id, deliveryPhoto, failureReason, customerSignature },
    order.user
  );

  res.json({ success: true, tracking, order: { status: order.status, deliveryOTP: order.deliveryOTP } });
};

// COURIER: Scan a parcel by tracking number to mark it picked up (alternative to selecting from list)
exports.scanParcel = async (req, res) => {
  const { trackingNumber } = req.body;
  if (!trackingNumber) return res.status(400).json({ success: false, message: 'trackingNumber is required' });

  const order = await Order.findOne({ trackingNumber, assignedCourier: req.courier._id });
  if (!order) return res.status(404).json({ success: false, message: 'No assigned order found with this tracking number' });
  if (order.status !== 'ready_for_pickup') {
    return res.status(400).json({ success: false, message: `Order is '${order.status}', not ready for pickup.` });
  }

  order.status = 'picked_up';
  await order.save();
  await logTracking(order._id, { status: 'picked_up', courier: req.courier._id, note: 'Parcel scanned and picked up by courier.' }, order.user);

  res.json({ success: true, order });
};

// COURIER: Get tracking history for an order
exports.getOrderTracking = async (req, res) => {
  const trackingHistory = await TrackingUpdate.find({ order: req.params.orderId })
    .sort('createdAt')
    .populate('courier', 'companyName deliveryPersonName');
  res.json({ success: true, trackingHistory });
};

// COURIER: Dashboard stats
exports.getCourierStats = async (req, res) => {
  const [assigned, pending, inTransit, outForDelivery, delivered, failed] = await Promise.all([
    Order.countDocuments({ assignedCourier: req.courier._id }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'ready_for_pickup' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: { $in: ['picked_up', 'shipped', 'in_transit', 'reached_sorting_center', 'reached_destination_city'] } }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'out_for_delivery' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'delivered' }),
    Order.countDocuments({ assignedCourier: req.courier._id, status: 'failed_delivery' }),
  ]);
  res.json({ success: true, stats: { assigned, pending, inTransit, outForDelivery, delivered, failed } });
};

// ========== ADMIN COURIER MANAGEMENT ==========

// ADMIN: Get all couriers
exports.getAllCouriers = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const couriers = await CourierPartner.find(query).sort('-createdAt');
  res.json({ success: true, couriers });
};

// ADMIN: Update courier status
exports.updateCourierStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const courier = await CourierPartner.findByIdAndUpdate(
    req.params.id,
    { status, rejectionReason },
    { new: true }
  );
  if (!courier) return res.status(404).json({ success: false, message: 'Courier not found' });
  res.json({ success: true, courier });
};

// ADMIN: Assign courier to order
exports.assignCourier = async (req, res) => {
  const { courierId, trackingId, estimatedDelivery } = req.body;
  if (!courierId) return res.status(400).json({ success: false, message: 'courierId is required' });

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.status !== 'ready_for_pickup') {
    return res.status(400).json({ success: false, message: `Order must be 'ready_for_pickup' before assigning a courier (currently '${order.status}').` });
  }

  const courier = await CourierPartner.findById(courierId);
  if (!courier) return res.status(404).json({ success: false, message: 'Courier partner not found' });
  if (courier.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Only approved couriers can be assigned.' });
  }

  order.assignedCourier = courierId;
  order.trackingNumber = trackingId || order.trackingNumber || `TRK${Date.now().toString().slice(-8)}`;
  order.courierCompany = courier.companyName;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  await order.save();

  await logTracking(order._id, { status: 'ready_for_pickup', courier: courierId, note: `Assigned to courier: ${courier.companyName}.` }, order.user);

  res.json({ success: true, order });
};
