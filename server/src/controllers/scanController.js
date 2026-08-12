const crypto = require('crypto');
const Scan = require('../models/Scan');

// Helper to hash IP for privacy
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex').substring(0, 16);
};

// POST /api/scans
exports.recordScan = async (req, res, next) => {
  try {
    const { businessId, language } = req.body;

    const scan = await Scan.create({
      businessId,
      action: 'scanned',
      language: language || 'en',
      userAgent: req.headers['user-agent'] || '',
      ipHash: hashIP(req.ip),
      referrer: req.headers.referer || '',
    });

    res.status(201).json({ scan: { _id: scan._id } });
  } catch (error) {
    next(error);
  }
};

// POST /api/scans/:id/action
exports.recordAction = async (req, res, next) => {
  try {
    const { action, rating } = req.body;

    const validActions = ['rated', 'copied_review', 'clicked_google', 'submitted_feedback'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action type.' });
    }

    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    scan.action = action;
    if (rating) {
      scan.rating = rating;
    }

    await scan.save();

    res.json({ scan: { _id: scan._id, action: scan.action, rating: scan.rating } });
  } catch (error) {
    next(error);
  }
};
