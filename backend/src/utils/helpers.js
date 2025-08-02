// Helper functions for the SmartMediChain backend

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a QR code string for medicine tracking
 * @param {Object} medicine - Medicine object
 * @returns {string} QR code data string
 */
const generateMedicineQRCode = (medicine) => {
  return JSON.stringify({
    id: medicine._id,
    name: medicine.name,
    batchNumber: medicine.batchInfo.batchNumber,
    expiryDate: medicine.batchInfo.expiryDate,
    manufacturer: medicine.manufacturer.name,
    timestamp: new Date().toISOString()
  });
};

/**
 * Calculate days until expiry
 * @param {Date} expiryDate - Expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Generate order number
 * @param {string} prefix - Prefix for order number (default: ORD)
 * @returns {string} Generated order number
 */
const generateOrderNumber = (prefix = 'ORD') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getTime()).slice(-6);
  
  return `${prefix}-${year}${month}${day}-${time}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number} Age in years
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total count of items
 * @returns {Object} Pagination info
 */
const getPaginationInfo = (page, limit, totalCount) => {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: parseInt(page),
    totalPages,
    totalCount,
    hasNext: parseInt(page) < totalPages,
    hasPrev: parseInt(page) > 1,
    limit: parseInt(limit)
  };
};

/**
 * Sanitize search query
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  
  // Remove special regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generate barcode for medicine
 * @param {Object} medicine - Medicine object
 * @returns {string} Barcode string
 */
const generateMedicineBarcode = (medicine) => {
  // Simple barcode generation based on medicine data
  const prefix = '8901'; // Medicine product prefix
  const manufacturerCode = String(Math.abs(medicine.manufacturer.name.hashCode())).slice(0, 3);
  const productCode = String(Math.abs(medicine.name.hashCode())).slice(0, 4);
  const batchCode = medicine.batchInfo.batchNumber.slice(-3);
  
  return `${prefix}${manufacturerCode}${productCode}${batchCode}`;
};

/**
 * Hash code function for strings
 */
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Convert string to slug
 * @param {string} text - Text to convert
 * @returns {string} Slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Check if medicine is expired
 * @param {Date} expiryDate - Expiry date
 * @returns {boolean} True if expired
 */
const isMedicineExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

/**
 * Check if medicine is expiring soon
 * @param {Date} expiryDate - Expiry date
 * @param {number} days - Days threshold (default: 30)
 * @returns {boolean} True if expiring soon
 */
const isMedicineExpiringSoon = (expiryDate, days = 30) => {
  const expiry = new Date(expiryDate);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  
  return expiry >= new Date() && expiry <= threshold;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted date
 */
const formatDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate inventory value
 * @param {Array} medicines - Array of medicines
 * @returns {number} Total inventory value
 */
const calculateInventoryValue = (medicines) => {
  return medicines.reduce((total, medicine) => {
    return total + (medicine.batchInfo.quantity * medicine.pricing.costPrice);
  }, 0);
};

module.exports = {
  generateRandomString,
  generateMedicineQRCode,
  getDaysUntilExpiry,
  formatCurrency,
  generateOrderNumber,
  isValidEmail,
  calculateAge,
  getPaginationInfo,
  sanitizeSearchQuery,
  generateMedicineBarcode,
  slugify,
  isMedicineExpired,
  isMedicineExpiringSoon,
  formatDate,
  calculateInventoryValue
};
