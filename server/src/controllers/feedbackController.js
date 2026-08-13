const Feedback = require('../models/Feedback');
const Business = require('../models/Business');

// POST /api/feedbacks (public)
exports.submit = async (req, res, next) => {
  try {
    const { businessId, scanId, rating, name, phone, message } = req.body;

    const feedback = await Feedback.create({
      businessId,
      scanId: scanId || null,
      rating,
      name,
      phone,
      message,
    });

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/feedbacks (admin)
exports.getAll = async (req, res, next) => {
  try {
    const { businessId, isResolved, page = 1, limit = 20 } = req.query;

    const query = {};
    if (req.admin.role !== 'super_admin') {
      const userBusinesses = await Business.find({ adminId: req.admin._id }).select('_id');
      const userBusinessIds = userBusinesses.map(b => b._id);
      query.businessId = { $in: userBusinessIds };

      if (businessId && userBusinessIds.some(id => id.toString() === businessId)) {
        query.businessId = businessId;
      }
    } else if (businessId) {
      query.businessId = businessId;
    }

    if (isResolved !== undefined) {
      query.isResolved = isResolved === 'true';
    }

    const feedbacks = await Feedback.find(query)
      .populate('businessId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/feedbacks/:id/resolve (admin)
exports.resolve = async (req, res, next) => {
  try {
    const userBusinesses = await Business.find({ adminId: req.admin._id }).select('_id');
    const userBusinessIds = userBusinesses.map(b => b._id);

    const feedback = await Feedback.findOne({
      _id: req.params.id,
      businessId: { $in: userBusinessIds },
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found.' });
    }

    feedback.isResolved = req.body.isResolved !== undefined ? req.body.isResolved : true;
    await feedback.save();

    res.json({ message: 'Feedback updated.', feedback });
  } catch (error) {
    next(error);
  }
};
