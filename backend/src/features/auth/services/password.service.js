const bcrypt = require('bcryptjs');

/**
 * Password Service
 *
 * Helper functions for password operations.
 * Extracted for explicit password handling and easier testing.
 */

/**
 * Hash a plain text password using bcrypt
 *
 * @param {String} plainPassword - Plain text password
 * @returns {Promise<String>} Hashed password
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare a plain text password with a hashed password
 *
 * @param {String} plainPassword - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Validate password strength (optional enhancement)
 *
 * @param {String} password - Password to validate
 * @returns {Object} { valid: Boolean, errors: Array<String> }
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Future enhancements:
  // - Check for uppercase, lowercase, numbers, special characters
  // - Check against common password lists
  // - Check for user info (email, name) in password

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
