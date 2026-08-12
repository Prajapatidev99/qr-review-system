const Scan = require('../models/Scan');
const Feedback = require('../models/Feedback');
const Business = require('../models/Business');

// GET /api/analytics/:businessId
exports.getSummary = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total scans
    const totalScans = await Scan.countDocuments({
      businessId,
      createdAt: { $gte: startDate },
    });

    // Rating distribution
    const ratingDistribution = await Scan.aggregate([
      {
        $match: {
          businessId: require('mongoose').Types.ObjectId.createFromHexString(businessId),
          rating: { $ne: null },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Action breakdown
    const actionBreakdown = await Scan.aggregate([
      {
        $match: {
          businessId: require('mongoose').Types.ObjectId.createFromHexString(businessId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);

    // Positive vs Negative
    const positiveCount = await Scan.countDocuments({
      businessId,
      rating: { $gte: 4 },
      createdAt: { $gte: startDate },
    });
    const negativeCount = await Scan.countDocuments({
      businessId,
      rating: { $lte: 3, $ne: null },
      createdAt: { $gte: startDate },
    });

    // Unresolved feedbacks count
    const unresolvedFeedbacks = await Feedback.countDocuments({
      businessId,
      isResolved: false,
    });

    // Average rating
    const avgRatingResult = await Scan.aggregate([
      {
        $match: {
          businessId: require('mongoose').Types.ObjectId.createFromHexString(businessId),
          rating: { $ne: null },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    res.json({
      totalScans,
      positiveCount,
      negativeCount,
      avgRating: avgRatingResult[0]?.avgRating?.toFixed(1) || '0.0',
      unresolvedFeedbacks,
      ratingDistribution: ratingDistribution.map((r) => ({ rating: r._id, count: r.count })),
      actionBreakdown: actionBreakdown.map((a) => ({ action: a._id, count: a.count })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/:businessId/timeline
exports.getTimeline = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const timeline = await Scan.aggregate([
      {
        $match: {
          businessId: require('mongoose').Types.ObjectId.createFromHexString(businessId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          scans: { $sum: 1 },
          positive: {
            $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] },
          },
          negative: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ['$rating', 3] }, { $ne: ['$rating', null] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      timeline: timeline.map((t) => ({
        date: t._id,
        scans: t.scans,
        positive: t.positive,
        negative: t.negative,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/overview (admin — all businesses)
exports.getOverview = async (req, res, next) => {
  try {
    const businesses = await Business.find({ adminId: req.admin._id }).select('_id name slug');
    const businessIds = businesses.map((b) => b._id);

    const totalScans = await Scan.countDocuments({ businessId: { $in: businessIds } });
    const totalPositive = await Scan.countDocuments({
      businessId: { $in: businessIds },
      rating: { $gte: 4 },
    });
    const totalNegative = await Scan.countDocuments({
      businessId: { $in: businessIds },
      rating: { $lte: 3, $ne: null },
    });
    const totalFeedbacks = await Feedback.countDocuments({ businessId: { $in: businessIds } });
    const unresolvedFeedbacks = await Feedback.countDocuments({
      businessId: { $in: businessIds },
      isResolved: false,
    });

    res.json({
      totalBusinesses: businesses.length,
      totalScans,
      totalPositive,
      totalNegative,
      totalFeedbacks,
      unresolvedFeedbacks,
      businesses: businesses.map((b) => ({ _id: b._id, name: b.name, slug: b.slug })),
    });
  } catch (error) {
    next(error);
  }
};
