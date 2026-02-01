const bcrypt = require('bcryptjs');
const Auths = require('./models/auth.model');
const Profiles = require('../user-profile/models/profile.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logAuth } = require('../../shared/utils/log-helpers');

/**
 * Login user (used with Passport)
 * Note: Password verification is handled by Passport local strategy
 * This service is for additional login logic if needed
 */
const login = async (userId) => {
  const auth = await Auths.findOne({ userId });

  if (!auth) {
    throwError(404, 'Auth record not found');
  }

  if (!auth.isActive) {
    throwError(403, 'Account is inactive');
  }

  // Update last login
  auth.lastLogin = new Date();
  await auth.save();

  logAuth('login', userId, { email: auth.email });

  // Return combined user data (auth + profile)
  const profile = await Profiles.findById(userId);
  return normalizeUser({ ...profile?.toObject(), ...auth.toObject(), _id: userId });
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const profile = await Profiles.findById(userId);
  const auth = await Auths.findOne({ userId });

  if (!profile || !auth) {
    throwError(404, 'User not found');
  }

  return normalizeUser({ ...profile.toObject(), ...auth.toObject(), _id: userId });
};

/**
 * Verify password (for password change, etc.)
 */
const verifyPassword = async (userId, password) => {
  const auth = await Auths.findOne({ userId }).select('+password');

  if (!auth) {
    throwError(404, 'Auth record not found');
  }

  const isMatch = await bcrypt.compare(password, auth.password);
  return isMatch;
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const auth = await Auths.findOne({ userId }).select('+password');

  if (!auth) {
    throwError(404, 'Auth record not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, auth.password);
  if (!isMatch) {
    throwError(401, 'Current password is incorrect');
  }

  // Set new password (will be hashed by pre-save hook)
  auth.password = newPassword;

  await auth.save();

  logAuth('password_change', userId);

  return { message: 'Password changed successfully' };
};

module.exports = {
  login,
  getUserById,
  verifyPassword,
  changePassword
};
