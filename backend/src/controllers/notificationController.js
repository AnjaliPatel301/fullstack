const Notification = require('../models/Notification');

// ADMIN: Send notification
exports.sendNotification = async (req, res) => {
  const { title, message, type, targetRole, targetUser } = req.body;
  const notification = await Notification.create({
    title, message, type, targetRole, targetUser,
    sentBy: req.user._id,
  });
  res.status(201).json({ success: true, notification });
};

// USER/SELLER/COURIER: Get my notifications
exports.getMyNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = {
    $or: [
      { targetUser: req.user._id },
      { targetRole: req.user.role },
      { targetRole: 'all' },
    ],
  };
  const [notifications, total, unread] = await Promise.all([
    Notification.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ ...query, isRead: false }),
  ]);
  res.json({ success: true, notifications, total, unread });
};

// USER: Mark notification as read
exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
};

// USER: Mark all as read
exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { $or: [{ targetUser: req.user._id }, { targetRole: req.user.role }, { targetRole: 'all' }] },
    { isRead: true }
  );
  res.json({ success: true });
};

// ADMIN: Get all notifications
exports.getAllNotifications = async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, total] = await Promise.all([
    Notification.find().sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('sentBy', 'name'),
    Notification.countDocuments(),
  ]);
  res.json({ success: true, notifications, total });
};
