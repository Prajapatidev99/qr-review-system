const QRCode = require('qrcode');

/**
 * Generate a QR code as a Data URL (base64 PNG)
 * @param {string} url - The URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<string>} Base64 data URL
 */
const generateQRDataUrl = async (url, options = {}) => {
  const defaultOptions = {
    width: 400,
    margin: 2,
    color: {
      dark: '#1e1b4b',  // Deep indigo
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
    ...options,
  };

  return QRCode.toDataURL(url, defaultOptions);
};

/**
 * Generate a QR code as an SVG string
 * @param {string} url - The URL to encode
 * @returns {Promise<string>} SVG string
 */
const generateQRSvg = async (url) => {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#1e1b4b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
};

module.exports = { generateQRDataUrl, generateQRSvg };
