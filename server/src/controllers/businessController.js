const Business = require('../models/Business');
const { slugify } = require('../utils/slugify');
const { generateQRDataUrl } = require('../utils/qrGenerator');
const config = require('../config/env');

// GET /api/businesses
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { adminId: req.admin._id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const businesses = await Business.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
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

// GET /api/businesses/:slug (public)
exports.getBySlug = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select('-adminId');

    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    res.json({ business });
  } catch (error) {
    next(error);
  }
};

// POST /api/businesses
exports.create = async (req, res, next) => {
  try {
    const {
      name, category, googleReviewLink, phone,
      whatsappNumber, googleMapsLink, address, logo,
      offer, reviewSuggestions, defaultLanguage,
    } = req.body;

    // Generate unique slug
    let slug = slugify(name);
    const existingSlug = await Business.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Generate QR code URL
    const pageUrl = `${config.baseUrl}/${slug}`;
    const qrCodeUrl = await generateQRDataUrl(pageUrl);

    const business = await Business.create({
      adminId: req.admin._id,
      name,
      slug,
      category: category || 'other',
      googleReviewLink,
      phone: phone || '',
      whatsappNumber: whatsappNumber || '',
      googleMapsLink: googleMapsLink || '',
      address: address || '',
      logo: logo || '',
      offer: offer || { enabled: false, title: '', description: '' },
      reviewSuggestions: reviewSuggestions || [],
      defaultLanguage: defaultLanguage || 'en',
      qrCodeUrl,
    });

    res.status(201).json({ business });
  } catch (error) {
    next(error);
  }
};

// PUT /api/businesses/:id
exports.update = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    const allowedUpdates = [
      'name', 'category', 'googleReviewLink', 'phone',
      'whatsappNumber', 'googleMapsLink', 'address', 'logo',
      'offer', 'reviewSuggestions', 'defaultLanguage', 'isActive',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    // Regenerate slug if name changed
    if (req.body.name && req.body.name !== business.name) {
      let newSlug = slugify(req.body.name);
      const existingSlug = await Business.findOne({ slug: newSlug, _id: { $ne: business._id } });
      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now().toString(36)}`;
      }
      business.slug = newSlug;
      // Regenerate QR code for new slug
      const pageUrl = `${config.baseUrl}/${newSlug}`;
      business.qrCodeUrl = await generateQRDataUrl(pageUrl);
    }

    await business.save();

    res.json({ business });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/businesses/:id
exports.remove = async (req, res, next) => {
  try {
    const business = await Business.findOneAndDelete({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    res.json({ message: 'Business deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/businesses/:id/qr
exports.getQR = async (req, res, next) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found.' });
    }

    const pageUrl = `${config.baseUrl}/${business.slug}`;
    const qrDataUrl = await generateQRDataUrl(pageUrl, { width: 600 });

    res.json({
      qrDataUrl,
      pageUrl,
      slug: business.slug,
      businessName: business.name,
    });
  } catch (error) {
    next(error);
  }
};
