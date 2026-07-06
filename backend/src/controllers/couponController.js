const Coupon = require('../models/Coupon');

exports.validateCoupon = async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return res.status(400).json({ success: false, message: 'Coupon has expired' });
  if (coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  if (orderAmount < coupon.minOrderAmount)
    return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });

  let discount = coupon.discountType === 'percentage'
    ? (orderAmount * coupon.discountValue) / 100
    : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  res.json({ success: true, coupon, discount: Math.round(discount) });
};

exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
};

exports.createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, coupon });
};

exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, message: 'Coupon deleted' });
};
