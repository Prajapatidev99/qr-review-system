const express = require('express');
const router = express.Router();
const { submit, getAll, resolve } = require('../controllers/feedbackController');
const { auth } = require('../middleware/auth');
const { scanLimiter } = require('../middleware/rateLimiter');

// Public
router.post('/', scanLimiter, submit);

// Admin
router.get('/', auth, getAll);
router.put('/:id/resolve', auth, resolve);

module.exports = router;
