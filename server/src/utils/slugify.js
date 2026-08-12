/**
 * Create a URL-safe slug from a string
 * @param {string} text - Text to slugify
 * @returns {string} URL-safe slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start
    .replace(/-+$/, '');        // Trim - from end
};

module.exports = { slugify };
