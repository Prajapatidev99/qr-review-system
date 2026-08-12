const express = require('express');
const router = express.Router();
const { recordScan, recordAction } = require('../controllers/scanController');
const { scanLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/', scanLimiter, recordScan);
router.post('/:id/action', scanLimiter, recordAction);

module.exports = router;
