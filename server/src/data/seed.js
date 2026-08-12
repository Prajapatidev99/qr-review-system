/**
 * Seed script — populates the database with default review suggestions
 * and creates a default admin account.
 *
 * Usage: npm run seed (or: node src/data/seed.js)
 */
const mongoose = require('mongoose');
const config = require('../config/env');
const Admin = require('../models/Admin');
const ReviewSuggestion = require('../models/ReviewSuggestion');
const defaultSuggestions = require('./defaultSuggestions');

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Create default admin
    const existingAdmin = await Admin.findOne({ email: 'admin@qrreview.com' });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@qrreview.com',
        passwordHash: 'admin123',
        role: 'super_admin',
      });
      console.log('✅ Default admin created (admin@qrreview.com / admin123)');
    } else {
      console.log('ℹ️  Default admin already exists');
    }

    // 2. Seed review suggestions
    for (const suggestion of defaultSuggestions) {
      await ReviewSuggestion.findOneAndUpdate(
        { category: suggestion.category, language: suggestion.language },
        { suggestions: suggestion.suggestions },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${defaultSuggestions.length} suggestion pools`);

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
