const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const config = require('../config/env');

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@qrreview.com';
  const password = args[1] || 'admin123';
  const name = args[2] || 'System Admin';
  const role = args[3] || 'super_admin';

  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin account with email "${email}" already exists.`);
      process.exit(0);
    }

    const admin = await Admin.create({
      name,
      email,
      passwordHash: password,
      role,
    });

    console.log('✅ Admin Account Created Successfully:');
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin account:', error.message);
    process.exit(1);
  }
};

createAdmin();
