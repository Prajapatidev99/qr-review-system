const express = require('express');
const router = express.Router();
const {
  getAll, getBySlug, create, update, remove, getQR,
} = require('../controllers/businessController');
const { auth } = require('../middleware/auth');

// Public route — used by customer review page
router.get('/slug/:slug', getBySlug);

// Admin routes
router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);
router.get('/:id/qr', auth, getQR);

module.exports = router;
