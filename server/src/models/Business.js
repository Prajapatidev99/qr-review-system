const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    category: {
      type: String,
      trim: true,
      default: 'other',
    },
    googleReviewLink: {
      type: String,
      required: [true, 'Google review link is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
    },
    googleMapsLink: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      trim: true,
      default: '',
    },
    offer: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: '', trim: true },
      description: { type: String, default: '', trim: true },
      expiresAt: { type: Date, default: null },
    },
    reviewSuggestions: {
      type: [String],
      default: [],
    },
    defaultLanguage: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
businessSchema.index({ adminId: 1 });

module.exports = mongoose.model('Business', businessSchema);
