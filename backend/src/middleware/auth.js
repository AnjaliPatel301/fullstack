const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const CourierPartner = require('../models/CourierPartner');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

const protectSeller = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    if (req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Seller access required' });
    }
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller profile not found' });
    if (seller.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your seller account is ${seller.status}. Please wait for admin approval.`,
        status: seller.status,
      });
    }
    req.seller = seller;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const protectCourier = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'courier') {
      return res.status(403).json({ success: false, message: 'Courier access required' });
    }
    const courier = await CourierPartner.findById(decoded.id);
    if (!courier) return res.status(404).json({ success: false, message: 'Courier not found' });
    if (courier.status !== 'approved') {
      return res.status(403).json({ success: false, message: `Courier account ${courier.status}` });
    }
    req.courier = courier;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = { protect, admin, protectSeller, protectCourier };
