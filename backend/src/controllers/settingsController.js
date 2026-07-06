const SiteSettings = require('../models/SiteSettings');

// ADMIN: Get settings
exports.getSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json({ success: true, settings });
};

// ADMIN: Update settings
exports.updateSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json({ success: true, settings });
};
