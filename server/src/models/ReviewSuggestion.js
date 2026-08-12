const mongoose = require('mongoose');

const reviewSuggestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['restaurant', 'salon', 'clinic', 'mobile_shop', 'gym', 'hotel', 'general'],
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      required: true,
    },
    suggestions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 5,
        message: 'At least 5 suggestions are required per category/language',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index
reviewSuggestionSchema.index({ category: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('ReviewSuggestion', reviewSuggestionSchema);
