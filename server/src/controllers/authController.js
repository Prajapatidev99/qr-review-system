const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const admin = await Admin.create({
      name,
      email,
      passwordHash: password,
      role: role || 'admin',
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      admin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(admin._id);

    res.json({
      admin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ admin: req.admin });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    admin.passwordHash = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
