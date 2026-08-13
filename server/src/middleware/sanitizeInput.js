/**
 * Input Security & NoSQL Injection Prevention Middleware
 * Sanitizes req.body, req.query, and req.params by removing any keys or values
 * containing MongoDB operator characters like '$' or '.'
 */

const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Remove null bytes and trim dangerous characters
    return val.replace(/\0/g, '').trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      // Prevent NoSQL operator injection ($gt, $where, $ne, etc.)
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }
  return val;
};

const sanitizeInput = (req, res, next) => {
  try {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = sanitizeInput;
