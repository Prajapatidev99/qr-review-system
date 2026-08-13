const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, forgotPassword, resetPassword, getAllUsers, updateUserPlan } = require('../controllers/authController');
const { auth, superAdminOnly } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Super Admin User & Subscription Management
router.get('/users', auth, superAdminOnly, getAllUsers);
router.put('/users/:id/plan', auth, superAdminOnly, updateUserPlan);

module.exports = router;
