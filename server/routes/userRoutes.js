const express = require('express');
const { getMe, updateMe } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
