const bcrypt = require('bcryptjs');
const Users = require('../models/Users');
const Preferences = require('../models/Preferences');
const { throwError } = require('../utils/functionHandlers');
const { normalizeUser } = require('../utils/normalizeResponses');
const { logAuth } = require('../utils/logHelpers');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {Object} metadata - Request metadata (IP, user agent)
 * @returns {Object} - Created user (normalized)
 */
const register = async (userData, metadata = {}) => {
  const {
    email,
    password,
    firstName,
    lastName,
    location,
    consents,
    ethnicity,
    halachicPreferences,
  } = userData;

  // Check if user already exists
  const existingUser = await Users.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throwError(400, 'Email already registered');
  }

  // Add consent metadata
  const consentData = {
    dataProcessing: {
      granted: consents.dataProcessing.granted,
      timestamp: new Date(),
      ipAddress: metadata.ipAddress || metadata.ip,
      userAgent: metadata.userAgent,
    },
  };

  // Create user (password will be hashed by pre-save hook)
  const user = new Users({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    location,
    consents: consentData,
    ethnicity,
    halachicPreferences,
    emailVerified: false,
    profileComplete: false,
    onboardingCompleted: false,
  });

  await user.save();

  // Create default preferences
  await Preferences.create({
    userId: user._id,
  });

  logAuth('register', user._id, { email: user.email });

  return normalizeUser(user);
};

/**
 * Login user (used with Passport)
 * Note: Password verification is handled by Passport local strategy
 * This service is for additional login logic if needed
 */
const login = async (userId) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  if (user.isDeleted) {
    throwError(403, 'Account has been deleted');
  }

  if (!user.isActive) {
    throwError(403, 'Account is inactive');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  logAuth('login', user._id, { email: user.email });

  return normalizeUser(user);
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await Users.findById(userId);

  if (!user || user.isDeleted) {
    throwError(404, 'User not found');
  }

  return normalizeUser(user);
};

/**
 * Verify password (for password change, etc.)
 */
const verifyPassword = async (userId, password) => {
  const user = await Users.findById(userId).select('+password');

  if (!user) {
    throwError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await Users.findById(userId).select('+password');

  if (!user) {
    throwError(404, 'User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throwError(401, 'Current password is incorrect');
  }

  // Set new password (will be hashed by pre-save hook)
  user.password = newPassword;

  await user.save();

  logAuth('password_change', user._id);

  return { message: 'Password changed successfully' };
};

module.exports = {
  register,
  login,
  getUserById,
  verifyPassword,
  changePassword,
};
