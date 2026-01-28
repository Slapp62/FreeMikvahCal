const Users = require('./auth.model');
const Preferences = require('./preferences.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logAuth } = require('../../shared/utils/log-helpers');

/**
 * Link Google account to existing user
 * @param {String} userId - User ID
 * @param {String} googleId - Google profile ID
 * @returns {Object} - Updated user (normalized)
 */
const linkGoogleToUser = async (userId, googleId) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  if (user.googleId) {
    throwError(400, 'Google account already linked to this user');
  }

  // Check if googleId is already linked to another user
  const existingGoogleUser = await Users.findOne({ googleId });
  if (existingGoogleUser) {
    throwError(400, 'This Google account is already linked to another user');
  }

  user.googleId = googleId;
  user.emailVerified = true; // Google verified the email
  await user.save();

  logAuth('google_account_linked', user._id, {
    email: user.email,
    method: 'manual_link'
  });

  return normalizeUser(user);
};

/**
 * Create new user from Google profile
 * @param {Object} profile - Google profile data
 * @param {Object} metadata - Request metadata
 * @returns {Object} - Created user (normalized)
 */
const createGoogleUser = async (profile, metadata = {}) => {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throwError(400, 'Email is required from Google profile');
  }

  // Check if user already exists
  const existingUser = await Users.findOne({
    $or: [
      { email: email.toLowerCase() },
      { googleId: profile.id }
    ]
  });

  if (existingUser) {
    throwError(400, 'User with this email or Google account already exists');
  }

  // Create new user
  const user = new Users({
    email: email.toLowerCase(),
    googleId: profile.id,
    emailVerified: true,
    profileComplete: false,
    onboardingCompleted: false,
    location: {
      city: '',
      timezone: 'UTC'
    },
    consents: {
      dataProcessing: {
        granted: true,
        timestamp: new Date(),
        ipAddress: metadata.ipAddress || metadata.ip,
        userAgent: metadata.userAgent
      }
    }
  });

  await user.save();

  // Create default preferences
  await Preferences.create({
    userId: user._id
  });

  logAuth('register_google', user._id, {
    email: user.email
  });

  return normalizeUser(user);
};

module.exports = {
  linkGoogleToUser,
  createGoogleUser
};
