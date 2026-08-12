const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    action: {
      type: String,
      enum: ['scanned', 'rated', 'copied_review', 'clicked_google', 'submitted_feedback'],
      default: 'scanned',
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en',
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipHash: {
      type: String,
      default: '',
    },
    referrer: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
scanSchema.index({ businessId: 1, createdAt: -1 });
scanSchema.index({ businessId: 1, action: 1 });
scanSchema.index({ businessId: 1, rating: 1 });

module.exports = mongoose.model('Scan', scanSchema);
