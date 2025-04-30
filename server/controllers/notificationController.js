const Notification = require('../models/Notifications');

// GET /notifications - get all notifications for authenticated user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /notifications/:id/read - mark notification as read
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
