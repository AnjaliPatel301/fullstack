const Commission = require('../models/Commission');
const Seller = require('../models/Seller');

// ADMIN: Get all commissions
exports.getAllCommissions = async (req, res) => {
  const commissions = await Commission.find().sort('-createdAt').populate('seller', 'shopName');
  res.json({ success: true, commissions });
};

// ADMIN: Set global commission
exports.setGlobalCommission = async (req, res) => {
  const { percentage, notes } = req.body;
  let commission = await Commission.findOne({ type: 'global' });
  if (commission) {
    commission.percentage = percentage;
    commission.notes = notes;
    commission.updatedBy = req.user._id;
    await commission.save();
  } else {
    commission = await Commission.create({ type: 'global', percentage, notes, updatedBy: req.user._id, isActive: true });
  }
  res.json({ success: true, commission });
};

// ADMIN: Set category commission
exports.setCategoryCommission = async (req, res) => {
  const { category, percentage, notes } = req.body;
  let commission = await Commission.findOne({ type: 'category', category });
  if (commission) {
    commission.percentage = percentage;
    commission.notes = notes;
    commission.updatedBy = req.user._id;
    await commission.save();
  } else {
    commission = await Commission.create({ type: 'category', category, percentage, notes, updatedBy: req.user._id });
  }
  res.json({ success: true, commission });
};

// ADMIN: Set seller commission
exports.setSellerCommission = async (req, res) => {
  const { sellerId, percentage, notes } = req.body;
  const seller = await Seller.findById(sellerId);
  if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

  seller.commissionPercentage = percentage;
  await seller.save();

  let commission = await Commission.findOne({ type: 'seller', seller: sellerId });
  if (commission) {
    commission.percentage = percentage;
    commission.notes = notes;
    commission.updatedBy = req.user._id;
    await commission.save();
  } else {
    commission = await Commission.create({ type: 'seller', seller: sellerId, percentage, notes, updatedBy: req.user._id });
  }
  res.json({ success: true, commission });
};

// Calculate effective commission for an order item
exports.getEffectiveCommission = async (sellerId, category) => {
  // Priority: seller > category > global
  const sellerComm = await Commission.findOne({ type: 'seller', seller: sellerId, isActive: true });
  if (sellerComm) return sellerComm.percentage;

  const categoryComm = await Commission.findOne({ type: 'category', category, isActive: true });
  if (categoryComm) return categoryComm.percentage;

  const globalComm = await Commission.findOne({ type: 'global', isActive: true });
  return globalComm ? globalComm.percentage : 10;
};

// ADMIN: Delete commission
exports.deleteCommission = async (req, res) => {
  await Commission.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Commission deleted' });
};
