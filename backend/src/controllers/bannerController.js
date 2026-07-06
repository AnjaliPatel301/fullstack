const Banner = require('../models/Banner');

// ADMIN: Create banner
exports.createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
};

// PUBLIC: Get active banners
exports.getActiveBanners = async (req, res) => {
  const { type } = req.query;
  const now = new Date();
  const query = {
    isActive: true,
    $or: [
      { startDate: null },
      { startDate: { $lte: now } },
    ],
    $and: [
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
    ],
  };
  if (type) query.type = type;
  const banners = await Banner.find(query).sort('sortOrder');
  res.json({ success: true, banners });
};

// ADMIN: Get all banners
exports.getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort('-createdAt');
  res.json({ success: true, banners });
};

// ADMIN: Update banner
exports.updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, banner });
};

// ADMIN: Delete banner
exports.deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, message: 'Banner deleted' });
};

// ADMIN: Toggle banner status
exports.toggleBanner = async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  banner.isActive = !banner.isActive;
  await banner.save();
  res.json({ success: true, banner });
};
