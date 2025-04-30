// server/routes/authRoutes.js
const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/forgot', forgotPassword);
router.put('/reset', resetPassword);

module.exports = router;