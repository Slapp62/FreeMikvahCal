const bcrypt = require('bcryptjs');
const Users = require('./auth.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logAuth } = require('../../shared/utils/log-helpers');

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

  if (!user) {
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
  login,
  getUserById,
  verifyPassword,
  changePassword
};
