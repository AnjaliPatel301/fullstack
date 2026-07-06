const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { logTracking } = require('../utils/tracking');

// ── Auth ──────────────────────────────────────────────────────────────────────

const sendSellerToken = (user, seller, statusCode, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set. Server cannot sign tokens securely.');
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    seller: {
      _id: seller._id,
      shopName: seller.shopName,
      shopSlug: seller.shopSlug,
      logo: seller.logo,
      status: seller.status,
    },
  });
};

exports.registerSeller = async (req, res) => {
  const { name, email, password, phone, shopName, shopDescription, address, logo } = req.body;
  if (!name || !email || !password || !shopName) {
    return res.status(400).json({ success: false, message: 'name, email, password and shopName are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  // Create User with role=seller
  const user = await User.create({ name, email, password, phone, role: 'seller' });

  // Generate unique slug
  let baseSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = baseSlug;
  let count = 1;
  while (await Seller.findOne({ shopSlug: slug })) {
    slug = `${baseSlug}-${count++}`;
  }

  // Create Seller profile (status=pending, admin must approve)
  const seller = await Seller.create({
    user: user._id,
    shopName,
    shopSlug: slug,
    description: shopDescription || '',
    phone: phone || '',
    address: address || '',
    logo: logo || '',
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Your account is pending admin approval.',
    seller: { shopName: seller.shopName, status: seller.status },
  });
};

exports.loginSeller = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  if (user.role !== 'seller')
    return res.status(403).json({ success: false, message: 'This account is not a seller account' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account is deactivated' });

  const seller = await Seller.findOne({ user: user._id });
  if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });

  if (seller.status === 'pending') {
    return res.status(403).json({ success: false, message: 'Your account is pending admin approval', status: 'pending' });
  }
  if (seller.status === 'rejected') {
    return res.status(403).json({ success: false, message: `Your application was rejected. Reason: ${seller.rejectionReason || 'Contact admin'}`, status: 'rejected' });
  }
  if (seller.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.', status: 'blocked' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendSellerToken(user, seller, 200, res);
};

exports.getSellerMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const seller = await Seller.findOne({ user: req.user._id });
  res.json({ success: true, user, seller });
};

// ── Shop Settings ─────────────────────────────────────────────────────────────

exports.updateShopSettings = async (req, res) => {
  const { shopName, description, phone, address, logo, banner, bankDetails } = req.body;
  const seller = req.seller;

  if (shopName) seller.shopName = shopName;
  if (description !== undefined) seller.description = description;
  if (phone !== undefined) seller.phone = phone;
  if (address !== undefined) seller.address = address;
  if (logo !== undefined) seller.logo = logo;
  if (banner !== undefined) seller.banner = banner;
  if (bankDetails) seller.bankDetails = { ...seller.bankDetails, ...bankDetails };

  await seller.save();
  res.json({ success: true, seller });
};

// ── Products ──────────────────────────────────────────────────────────────────

exports.getSellerProducts = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { sellerId: req.seller._id };
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { sku: { $regex: search, $options: 'i' } },
  ];

  const [products, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, products, total, pages: Math.ceil(total / limit) });
};

exports.createSellerProduct = async (req, res) => {
  const data = { ...req.body, sellerId: req.seller._id };
  const product = await Product.create(data);
  res.status(201).json({ success: true, product });
};

exports.updateSellerProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found or access denied' });

  // Prevent changing sellerId
  delete req.body.sellerId;
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, product });
};

exports.deleteSellerProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found or access denied' });
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
};

// ── Orders ────────────────────────────────────────────────────────────────────

exports.getSellerOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  // Get all product IDs belonging to this seller
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id);

  const filter = { 'items.product': { $in: productIds } };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email phone'),
    Order.countDocuments(filter),
  ]);

  // Filter items to only show seller's products in each order
  const filteredOrders = orders.map(order => ({
    ...order.toObject(),
    items: order.items.filter(item => productIds.some(id => id.equals(item.product))),
  }));

  res.json({ success: true, orders: filteredOrders, total, pages: Math.ceil(total / limit) });
};

// Shared: load an order and make sure every item in it belongs to this seller.
// Mixed-vendor orders must be managed by admin so one seller can't override another's status.
async function loadSellerOwnedOrder(req, res) {
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id.toString());

  const order = await Order.findOne({ _id: req.params.id, 'items.product': { $in: sellerProducts.map(p => p._id) } });
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found or access denied' });
    return null;
  }
  const allBelongToSeller = order.items.every(item => productIds.includes(item.product?.toString()));
  if (!allBelongToSeller) {
    res.status(403).json({
      success: false,
      message: 'This order contains items from multiple sellers. Status is managed by the admin for mixed orders.',
    });
    return null;
  }
  return order;
}

// Seller: Accept Order — Pending → Accepted (order.status: 'confirmed')
exports.acceptOrder = async (req, res) => {
  const order = await loadSellerOwnedOrder(req, res);
  if (!order) return;
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Order is already '${order.status}', cannot accept.` });
  }
  order.status = 'confirmed';
  order.sellerStatus = 'accepted';
  await order.save();
  await logTracking(order._id, { status: 'seller_accepted', note: 'Your order has been accepted by seller.' }, order.user);
  res.json({ success: true, order });
};

// Seller: Reject Order — Pending → Cancelled (with reason)
exports.rejectOrder = async (req, res) => {
  const { reason } = req.body;
  const order = await loadSellerOwnedOrder(req, res);
  if (!order) return;
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Order is already '${order.status}', cannot reject.` });
  }
  order.status = 'cancelled';
  order.rejectionReason = reason || 'Rejected by seller';
  await order.save();
  await logTracking(order._id, { status: 'cancelled', note: `Order rejected by seller${reason ? `: ${reason}` : ''}.` }, order.user);
  res.json({ success: true, order });
};

// Seller: Pack Order — Accepted → Packed
exports.packOrder = async (req, res) => {
  const order = await loadSellerOwnedOrder(req, res);
  if (!order) return;
  if (order.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: `Order must be accepted before packing (currently '${order.status}').` });
  }
  order.status = 'packed';
  order.sellerStatus = 'packed';
  await order.save();
  await logTracking(order._id, { status: 'packed', note: 'Your order has been packed.' }, order.user);
  res.json({ success: true, order });
};

// Seller: Ready For Pickup — Packed → Ready For Pickup (courier takes over from here)
exports.readyForPickup = async (req, res) => {
  const order = await loadSellerOwnedOrder(req, res);
  if (!order) return;
  if (order.status !== 'packed') {
    return res.status(400).json({ success: false, message: `Order must be packed first (currently '${order.status}').` });
  }
  order.status = 'ready_for_pickup';
  order.sellerStatus = 'ready_for_pickup';
  await order.save();
  await logTracking(order._id, { status: 'ready_for_pickup', note: 'Your order is ready for courier pickup.' }, order.user);
  res.json({ success: true, order });
};

// Seller: printable invoice data for one of their orders
exports.getSellerOrderInvoice = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id }).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id.toString());
  const items = order.items.filter(item => productIds.includes(item.product?.toString()));
  if (items.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({
    success: true,
    invoice: {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: order.user,
      shippingAddress: order.shippingAddress,
      shopName: req.seller.shopName,
      items,
      itemsTotal,
      paymentMethod: order.paymentMethod,
      isPaid: order.isPaid,
    },
  });
};

// Seller: printable shipping label data
exports.getSellerShippingLabel = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id }).populate('user', 'name phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id.toString());
  const items = order.items.filter(item => productIds.includes(item.product?.toString()));
  if (items.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });

  res.json({
    success: true,
    label: {
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber || '',
      courierCompany: order.courierCompany || '',
      shopName: req.seller.shopName,
      shippingAddress: order.shippingAddress,
      customerPhone: order.user?.phone,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      codAmount: order.paymentMethod === 'cod' && !order.isPaid ? order.totalPrice : 0,
    },
  });
};

// ── Earnings ──────────────────────────────────────────────────────────────────

exports.getSellerEarnings = async (req, res) => {
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [deliveredOrders, pendingOrders, monthOrders, revenueByMonth] = await Promise.all([
    Order.find({ 'items.product': { $in: productIds }, status: 'delivered' }),
    Order.find({ 'items.product': { $in: productIds }, status: { $in: ['pending', 'confirmed', 'packed', 'ready_for_pickup', 'picked_up', 'shipped', 'in_transit', 'out_for_delivery'] } }),
    Order.find({ 'items.product': { $in: productIds }, createdAt: { $gte: startOfMonth } }),
    Order.aggregate([
      { $match: { 'items.product': { $in: productIds }, status: 'delivered' } },
      { $unwind: '$items' },
      { $match: { 'items.product': { $in: productIds } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const commissionRate = req.seller.commissionPercentage / 100;

  const calcSellerRevenue = (orders) => {
    let total = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (productIds.some(id => id.equals(item.product))) {
          total += item.price * item.quantity;
        }
      }
    }
    return total;
  };

  const totalSales = calcSellerRevenue(deliveredOrders);
  const totalCommission = totalSales * commissionRate;
  const netEarnings = totalSales - totalCommission;

  const monthSales = calcSellerRevenue(monthOrders.filter(o => o.status === 'delivered'));
  const monthCommission = monthSales * commissionRate;
  const monthNet = monthSales - monthCommission;

  // Withdrawals
  const withdrawals = await Withdrawal.find({ seller: req.seller._id }).sort('-requestedAt').limit(10);
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const availableBalance = netEarnings - totalWithdrawn - pendingWithdrawals;

  res.json({
    success: true,
    earnings: {
      totalSales,
      totalOrders: deliveredOrders.length,
      totalCommission,
      netEarnings,
      availableBalance: Math.max(availableBalance, 0),
      totalWithdrawn,
      pendingWithdrawals,
      monthSales,
      monthCommission,
      monthNet,
      commissionPercentage: effectiveCommissionPct,
    },
    revenueByMonth,
    withdrawals,
  });
};

// ── Withdrawals ───────────────────────────────────────────────────────────────

exports.requestWithdrawal = async (req, res) => {
  const { amount, paymentMethod, notes } = req.body;
  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹100' });
  }

  // Check available balance
  const sellerProducts = await Product.find({ sellerId: req.seller._id }).select('_id');
  const productIds = sellerProducts.map(p => p._id);
  const deliveredOrders = await Order.find({ 'items.product': { $in: productIds }, status: 'delivered' });

  // Resolve effective commission: seller > global > fallback
  const Commission = require("../models/Commission");
  let _effPct = req.seller.commissionPercentage || 10;
  const _sc2 = await Commission.findOne({ type: "seller", seller: req.seller._id, isActive: true });
  if (_sc2) { _effPct = _sc2.percentage; } else { const _gc2 = await Commission.findOne({ type: "global", isActive: true }); if (_gc2) _effPct = _gc2.percentage; }
  const commissionRate = _effPct / 100;
  let totalSales = 0;
  for (const order of deliveredOrders) {
    for (const item of order.items) {
      if (productIds.some(id => id.equals(item.product))) totalSales += item.price * item.quantity;
    }
  }
  const netEarnings = totalSales * (1 - commissionRate);

  const completedWithdrawals = await Withdrawal.aggregate([
    { $match: { seller: req.seller._id, status: { $in: ['completed', 'pending'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const alreadyWithdrawn = completedWithdrawals[0]?.total || 0;
  const available = netEarnings - alreadyWithdrawn;

  if (amount > available) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Available: ₹${Math.floor(available)}`,
    });
  }

  const withdrawal = await Withdrawal.create({
    seller: req.seller._id,
    amount,
    paymentMethod: paymentMethod || 'bank_transfer',
    notes,
  });

  res.status(201).json({ success: true, withdrawal });
};

exports.getSellerWithdrawals = async (req, res) => {
  const withdrawals = await Withdrawal.find({ seller: req.seller._id }).sort('-requestedAt');
  res.json({ success: true, withdrawals });
};

// ── Public Shop ───────────────────────────────────────────────────────────────

exports.getPublicShop = async (req, res) => {
  const seller = await Seller.findOne({ shopSlug: req.params.slug, status: 'approved' }).populate('user', 'name');
  if (!seller) return res.status(404).json({ success: false, message: 'Shop not found' });

  const products = await Product.find({ sellerId: seller._id, isActive: true }).limit(20);
  res.json({ success: true, seller, products });
};
