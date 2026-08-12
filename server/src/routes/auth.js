const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth, superAdminOnly } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', auth, superAdminOnly, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, getMe);

module.exports = router;
