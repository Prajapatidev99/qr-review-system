const ReviewSuggestion = require('../models/ReviewSuggestion');
const { generateAiReviews } = require('../utils/aiReviewGenerator');

// GET /api/suggestions/:category/:language (public — AI generated or randomized pool)
exports.getRandom = async (req, res, next) => {
  try {
    const { category, language } = req.params;
    const { count = 5, businessName = '', keywords = '' } = req.query;

    // Use AI Review Engine if businessName or keywords are provided
    if (businessName) {
      const aiSuggestions = await generateAiReviews({
        businessName,
        category,
        keywords,
        language,
      });
      if (aiSuggestions && aiSuggestions.length >= 3) {
        return res.json({ suggestions: aiSuggestions.slice(0, parseInt(count)) });
      }
    }

    // Fallback / Standard Pool lookup
    let doc = await ReviewSuggestion.findOne({ category, language });
    if (!doc) {
      doc = await ReviewSuggestion.findOne({ category: 'general', language });
    }
    if (!doc) {
      doc = await ReviewSuggestion.findOne({ category: 'general', language: 'en' });
    }

    if (!doc || !doc.suggestions.length) {
      return res.json({ suggestions: [] });
    }

    // Fisher-Yates shuffle and pick `count` items
    const shuffled = [...doc.suggestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, parseInt(count));

    res.json({ suggestions: selected });
  } catch (error) {
    next(error);
  }
};

// POST /api/suggestions (admin — upsert)
exports.upsert = async (req, res, next) => {
  try {
    const { category, language, suggestions } = req.body;

    if (!suggestions || suggestions.length < 5) {
      return res.status(400).json({ error: 'At least 5 suggestions are required.' });
    }

    const doc = await ReviewSuggestion.findOneAndUpdate(
      { category, language },
      { suggestions },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ suggestion: doc });
  } catch (error) {
    next(error);
  }
};

// GET /api/suggestions (admin — list all)
exports.getAll = async (req, res, next) => {
  try {
    const suggestions = await ReviewSuggestion.find().sort({ category: 1, language: 1 });
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};
