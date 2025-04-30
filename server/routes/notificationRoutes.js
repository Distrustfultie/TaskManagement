const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// Protect all notification routes
router.use(auth);

// List notifications
router.get('/', getNotifications);

// Mark as read
router.put('/:id/read', markAsRead);

module.exports = router;