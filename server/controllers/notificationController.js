const Notification = require('../models/Notifications');

// GET /api/notifications - latest notifications for the signed-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actor', 'firstName lastName email');
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Not found' });
    res.json(notif);
  } catch (err) {
    console.error('Error marking as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { read: true });
    res.json({ message: 'All read' });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
