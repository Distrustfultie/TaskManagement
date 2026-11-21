const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.use(auth);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead); // must come before /:id
router.put('/:id/read', markAsRead);

module.exports = router;
