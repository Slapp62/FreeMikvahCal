const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Auths = require('./models/auth.model');
const Profiles = require('../user-profile/models/profile.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logAuth } = require('../../shared/utils/log-helpers');
const { sendPasswordResetEmail } = require('../../shared/services/email.service');

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

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

const requestPasswordReset = async (email) => {
  const auth = await Auths.findOne({ email: email.toLowerCase(), isActive: true });

  if (!auth || !auth.password) {
    return { message: 'If an account exists for that email, a code has been sent.' };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  auth.passwordReset = {
    codeHash: hashValue(code),
    codeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    attempts: 0,
    verifiedTokenHash: undefined,
    verifiedTokenExpiresAt: undefined
  };
  await auth.save();

  await sendPasswordResetEmail(auth.email, 'User', code);
  logAuth('password_reset_requested', auth.userId, { email: auth.email });

  return { message: 'If an account exists for that email, a code has been sent.' };
};

const verifyResetCode = async (email, code) => {
  const auth = await Auths.findOne({ email: email.toLowerCase(), isActive: true });
  if (!auth || !auth.passwordReset || !auth.passwordReset.codeHash) {
    throwError(400, 'Invalid or expired code');
  }

  if (!auth.passwordReset.codeExpiresAt || auth.passwordReset.codeExpiresAt < new Date()) {
    throwError(400, 'Invalid or expired code');
  }

  if ((auth.passwordReset.attempts || 0) >= 5) {
    throwError(429, 'Too many invalid attempts. Request a new code.');
  }

  const isValidCode = hashValue(code) === auth.passwordReset.codeHash;
  if (!isValidCode) {
    auth.passwordReset.attempts = (auth.passwordReset.attempts || 0) + 1;
    await auth.save();
    throwError(400, 'Invalid or expired code');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  auth.passwordReset.verifiedTokenHash = hashValue(resetToken);
  auth.passwordReset.verifiedTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await auth.save();

  return { message: 'Code verified', resetToken };
};

const resetPasswordWithToken = async (resetToken, newPassword) => {
  const tokenHash = hashValue(resetToken);
  const auth = await Auths.findOne({
    isActive: true,
    'passwordReset.verifiedTokenHash': tokenHash,
    'passwordReset.verifiedTokenExpiresAt': { $gt: new Date() }
  }).select('+password');

  if (!auth) {
    throwError(400, 'Invalid or expired reset token');
  }

  auth.password = newPassword;
  auth.passwordReset = undefined;
  await auth.save();
  logAuth('password_reset_completed', auth.userId, { email: auth.email });

  return { message: 'Password reset successfully' };
};

module.exports = {
  login,
  getUserById,
  verifyPassword,
  changePassword,
  requestPasswordReset,
  verifyResetCode,
  resetPasswordWithToken
};
