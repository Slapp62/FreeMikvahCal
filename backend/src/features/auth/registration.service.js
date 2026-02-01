const Auths = require('./models/auth.model');
const Profiles = require('../user-profile/models/profile.model');
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

  // Check if email already exists
  const existingAuth = await Auths.findOne({ email: email.toLowerCase() });
  if (existingAuth) {
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

  // 1. Create Profile FIRST (to get profile ID)
  const profile = new Profiles({
    location,
    consents: consentData,
    halachicCustom,
    halachicPreferences,
    profileComplete: false,
    onboardingCompleted: false,
    // Merge default preferences (no separate Preferences model)
    hebrewCalendar: true,
    defaultCycleLength: 28,
    notifications: {
      enabled: true,
      hefsekTaharaReminder: true,
      shivaNekiyimReminder: true,
      mikvahReminder: true,
      vestOnotReminder: true,
      reminderTime: '09:00'
    },
    privacyMode: false,
    language: 'he',
    dataRetention: {
      keepCycles: 24,
      autoDelete: true
    },
    emailPreferences: {
      verificationEmails: true,
      reminders: {
        enabled: true,
        advanceNoticeHours: 48
      }
    }
  });

  await profile.save();

  // 2. Create Auth with userId reference
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const auth = new Auths({
    userId: profile._id,
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save hook
    emailVerified: false,
    emailVerification: {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Shorter expiry (10 mins)
      sentAt: new Date()
    },
    isActive: true
  });

  await auth.save();

  logAuth('register', profile._id, { email: auth.email });

  // Return normalized user (combine profile + auth)
  return {
    user: normalizeUser({ ...profile.toObject(), ...auth.toObject(), _id: profile._id }),
    code: verificationCode // plain token to send in email
  };
};

module.exports = {
  register
};
