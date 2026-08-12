const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan',
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 15,
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: 1000,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ businessId: 1, createdAt: -1 });
feedbackSchema.index({ businessId: 1, isResolved: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
