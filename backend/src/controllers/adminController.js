const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Seller = require('../models/Seller');
const Return = require('../models/Return');

exports.getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, totalUsers, totalProducts, totalSellers,
    monthOrders, lastMonthOrders,
    monthRevenue, lastMonthRevenue,
    pendingOrders, pendingReturns,
    lowStockProducts,
    recentOrders, topProducts,
    ordersByStatus, revenueByMonth,
    dailySales, weeklySales,
    commissionEarned,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Seller.countDocuments({ status: 'approved' }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    Return.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
    Order.find().sort('-createdAt').limit(10).populate('user', 'name email'),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfToday } } },
      { $group: { _id: { $hour: '$createdAt' }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]),
    // Approximate commission from sellers' total
    Seller.aggregate([{ $group: { _id: null, total: { $sum: { $subtract: ['$totalEarnings', '$availableBalance'] } } } }]),
  ]);

  const currentRevenue = monthRevenue[0]?.total || 0;
  const previousRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = previousRevenue > 0 ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 100;
  const orderGrowth = lastMonthOrders > 0 ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 100;

  res.json({
    success: true,
    stats: {
      totalOrders, totalUsers, totalProducts, totalSellers,
      monthOrders, currentRevenue,
      revenueGrowth: Number(revenueGrowth),
      orderGrowth: Number(orderGrowth),
      pendingOrders, pendingReturns, lowStockProducts,
      totalCommissionEarned: commissionEarned[0]?.total || 0,
    },
    recentOrders, topProducts, ordersByStatus, revenueByMonth, dailySales, weeklySales,
  });
};

// ADMIN: Get all users
exports.getAdminUsers = async (req, res) => {
  const { search, page = 1, limit = 20, status } = req.query;
  const query = { role: { $ne: 'admin' } };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (status === 'active') query.isActive = true;
  if (status === 'blocked') query.isActive = false;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total });
};

// ADMIN: Block/unblock user
exports.toggleUserBlock = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user, message: user.isActive ? 'User unblocked' : 'User blocked' });
};

// ADMIN: Delete user
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};

// ADMIN: Sales report
exports.getSalesReport = async (req, res) => {
  const { period = 'monthly' } = req.query;
  const now = new Date();
  let groupBy, matchFrom;

  if (period === 'daily') {
    matchFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  } else if (period === 'weekly') {
    matchFrom = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    matchFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  }

  const sales = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: matchFrom } } },
    { $group: { _id: groupBy, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  res.json({ success: true, sales });
};
