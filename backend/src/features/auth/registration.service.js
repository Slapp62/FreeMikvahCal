const Users = require('./auth.model');
const Preferences = require('./preferences.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logAuth } = require('../../shared/utils/log-helpers');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {Object} metadata - Request metadata (IP, user agent)
 * @returns {Object} - Created user (normalized) + verification code
 */
const register = async (userData, metadata = {}) => {
  const { email, password, location, consents, halachicCustom, halachicPreferences } = userData;

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
      userAgent: metadata.userAgent
    }
  };

  // Create user (password will be hashed by pre-save hook)
  const user = new Users({
    email: email.toLowerCase(),
    password,
    location,
    consents: consentData,
    halachicCustom,
    halachicPreferences,
    emailVerified: false,
    profileComplete: false,
    onboardingCompleted: false
  });

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Attach to user
  user.emailVerification = {
    code: verificationCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Shorter expiry (10 mins)
    sentAt: new Date()
  };

  await user.save();

  // Create default preferences
  await Preferences.create({
    userId: user._id
  });

  logAuth('register', user._id, { email: user.email });

  // Return normalized user + verification code
  return {
    user: normalizeUser(user),
    code: verificationCode // plain token to send in email
  };
};

module.exports = {
  register
};
