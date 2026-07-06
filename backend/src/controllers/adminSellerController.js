const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');

// ── Seller List & Management ──────────────────────────────────────────────────

exports.getAllSellers = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const sellers = await Seller.find(filter)
    .populate('user', 'name email phone createdAt')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Enrich with stats
  const enriched = await Promise.all(sellers.map(async (seller) => {
    const [productCount, orderCount] = await Promise.all([
      Product.countDocuments({ sellerId: seller._id }),
      Order.countDocuments({ 'items.product': { $in: await Product.find({ sellerId: seller._id }).distinct('_id') } }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: '$productDoc' },
      { $match: { 'productDoc.sellerId': seller._id } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const commissionEarned = totalRevenue * (seller.commissionPercentage / 100);

    return {
      ...seller.toObject(),
      stats: { productCount, orderCount, totalRevenue, commissionEarned },
    };
  }));

  const total = await Seller.countDocuments(filter);
  res.json({ success: true, sellers: enriched, total, pages: Math.ceil(total / limit) });
};

exports.getSellerById = async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate('user', 'name email phone createdAt isActive');
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

  const products = await Product.find({ sellerId: seller._id }).limit(10);
  const productIds = await Product.find({ sellerId: seller._id }).distinct('_id');

  const revenueAgg = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $unwind: '$items' },
    { $match: { 'items.product': { $in: productIds } } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  res.json({ success: true, seller, products, stats: { totalRevenue } });
};

exports.updateSellerStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const allowed = ['pending', 'approved', 'rejected', 'blocked'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
  }

  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

  seller.status = status;
  if (status === 'rejected' && rejectionReason) seller.rejectionReason = rejectionReason;

  // Also update user isActive based on seller status
  const isActive = status === 'approved';
  await User.findByIdAndUpdate(seller.user, { isActive });

  await seller.save();
  res.json({ success: true, seller });
};

exports.updateSellerCommission = async (req, res) => {
  const { commissionPercentage } = req.body;
  if (commissionPercentage === undefined || commissionPercentage < 0 || commissionPercentage > 100) {
    return res.status(400).json({ success: false, message: 'Commission must be between 0 and 100' });
  }

  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    { commissionPercentage },
    { new: true }
  );
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

  res.json({ success: true, seller });
};

// ── Seller Analytics ──────────────────────────────────────────────────────────

exports.getSellerAnalytics = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSellers,
    activeSellers,
    pendingSellers,
    rejectedSellers,
    blockedSellers,
    topSellers,
    totalPlatformCommission,
    monthlyRevenue,
  ] = await Promise.all([
    Seller.countDocuments(),
    Seller.countDocuments({ status: 'approved' }),
    Seller.countDocuments({ status: 'pending' }),
    Seller.countDocuments({ status: 'rejected' }),
    Seller.countDocuments({ status: 'blocked' }),
    // Top selling sellers by revenue
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: '$productDoc' },
      { $match: { 'productDoc.sellerId': { $exists: true } } },
      {
        $group: {
          _id: '$productDoc.sellerId',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $addToSet: '$_id' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerDoc',
        },
      },
      { $unwind: '$sellerDoc' },
      {
        $project: {
          revenue: 1,
          orderCount: { $size: '$orders' },
          shopName: '$sellerDoc.shopName',
          commissionPercentage: '$sellerDoc.commissionPercentage',
        },
      },
    ]),
    // Total platform commission earned
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: '$productDoc' },
      { $match: { 'productDoc.sellerId': { $exists: true } } },
      {
        $lookup: {
          from: 'sellers',
          localField: 'productDoc.sellerId',
          foreignField: '_id',
          as: 'sellerDoc',
        },
      },
      { $unwind: '$sellerDoc' },
      {
        $group: {
          _id: null,
          commission: {
            $sum: {
              $multiply: [
                '$items.price',
                '$items.quantity',
                { $divide: ['$sellerDoc.commissionPercentage', 100] },
              ],
            },
          },
        },
      },
    ]),
    // Monthly revenue from seller products
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startOfMonth } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: '$productDoc' },
      { $match: { 'productDoc.sellerId': { $exists: true } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    analytics: {
      totalSellers,
      activeSellers,
      pendingSellers,
      rejectedSellers,
      blockedSellers,
      totalPlatformCommission: totalPlatformCommission[0]?.commission || 0,
      monthlySellerRevenue: monthlyRevenue[0]?.revenue || 0,
    },
    topSellers,
  });
};

// ── Withdrawals ───────────────────────────────────────────────────────────────

exports.getAllWithdrawals = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter)
      .populate({ path: 'seller', select: 'shopName shopSlug bankDetails', populate: { path: 'user', select: 'name email' } })
      .sort('-requestedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Withdrawal.countDocuments(filter),
  ]);

  res.json({ success: true, withdrawals, total, pages: Math.ceil(total / limit) });
};

exports.updateWithdrawal = async (req, res) => {
  const { status, transactionId, adminNotes } = req.body;
  const allowed = ['approved', 'rejected', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be: ${allowed.join(', ')}` });
  }

  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });

  withdrawal.status = status;
  if (transactionId) withdrawal.transactionId = transactionId;
  if (adminNotes) withdrawal.adminNotes = adminNotes;
  if (status === 'approved') withdrawal.approvedAt = new Date();
  if (status === 'completed') withdrawal.completedAt = new Date();

  await withdrawal.save();
  res.json({ success: true, withdrawal });
};

// ── Default Commission ────────────────────────────────────────────────────────

exports.setDefaultCommission = async (req, res) => {
  const { defaultCommission } = req.body;
  if (defaultCommission === undefined || defaultCommission < 0 || defaultCommission > 100) {
    return res.status(400).json({ success: false, message: 'Commission must be between 0 and 100' });
  }
  // Store in a simple config or just return (no global config model here — store in env or use a Settings model if needed)
  // For now: update all 'pending' sellers with the new default
  await Seller.updateMany({ status: 'pending' }, { commissionPercentage: defaultCommission });
  res.json({ success: true, message: `Default commission set to ${defaultCommission}%` });
};
