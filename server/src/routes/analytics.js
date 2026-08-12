const express = require('express');
const router = express.Router();
const { getSummary, getTimeline, getOverview } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.get('/overview', auth, getOverview);
router.get('/:businessId', auth, getSummary);
router.get('/:businessId/timeline', auth, getTimeline);

module.exports = router;
