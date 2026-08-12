const express = require('express');
const router = express.Router();
const { getRandom, upsert, getAll } = require('../controllers/suggestionController');
const { auth } = require('../middleware/auth');

// Public
router.get('/:category/:language', getRandom);

// Admin
router.get('/', auth, getAll);
router.post('/', auth, upsert);

module.exports = router;
