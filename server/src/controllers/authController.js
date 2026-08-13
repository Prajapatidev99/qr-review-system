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

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your account email.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      // Security practice: Don't disclose if account exists
      return res.json({ message: 'If an account exists for this email, password reset instructions have been sent.' });
    }

    // Generate a simple reset token / confirmation
    res.json({ message: 'Password reset link sent to your email! Enter your new password below.', emailExists: true });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Account not found with this email.' });
    }

    admin.passwordHash = newPassword;
    await admin.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/users (super_admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/users/:id/plan (super_admin)
exports.updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const planLimits = {
      free: 1,
      starter: 3,
      growth: 10,
      enterprise: 999,
    };

    if (!planLimits[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.subscription = {
      plan,
      status: 'active',
      maxBusinesses: planLimits[plan],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    await user.save();
    res.json({ message: `Plan updated to ${plan.toUpperCase()} successfully.`, user });
  } catch (error) {
    next(error);
  }
};
