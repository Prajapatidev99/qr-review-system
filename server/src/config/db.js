const mongoose = require('mongoose');
const config = require('./env');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = config.mongoUri;

    // If USE_MEMORY_DB is set or MongoDB URI is localhost and connection fails,
    // use in-memory MongoDB
    if (config.useMemoryDB) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('🧠 Using in-memory MongoDB');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Auto-seed on first connection in memory mode
    if (config.useMemoryDB) {
      await seedDatabase();
    }

    return conn;
  } catch (error) {
    // If local MongoDB fails, try in-memory
    if (!config.useMemoryDB && config.mongoUri.includes('localhost')) {
      console.log('⚠️  Local MongoDB unavailable, switching to in-memory...');
      config.useMemoryDB = true;
      return connectDB();
    }
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Inline seed for memory mode (data is lost on restart)
async function seedDatabase() {
  const Admin = require('../models/Admin');
  const ReviewSuggestion = require('../models/ReviewSuggestion');
  const defaultSuggestions = require('../data/defaultSuggestions');

  // Create default admin
  const existingAdmin = await Admin.findOne({ email: 'admin@qrreview.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@qrreview.com',
      passwordHash: 'admin123',
      role: 'super_admin',
    });
    console.log('✅ Default admin created (admin@qrreview.com / admin123)');
  }

  // Seed suggestions
  for (const suggestion of defaultSuggestions) {
    await ReviewSuggestion.findOneAndUpdate(
      { category: suggestion.category, language: suggestion.language },
      { suggestions: suggestion.suggestions },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${defaultSuggestions.length} suggestion pools`);
}

const getMongoServer = () => mongoServer;

module.exports = connectDB;
module.exports.getMongoServer = getMongoServer;
