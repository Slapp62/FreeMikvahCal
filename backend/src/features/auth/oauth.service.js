const Auths = require('./models/auth.model');
const Profiles = require('../user-profile/models/profile.model');
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
  const auth = await Auths.findOne({ userId });

  if (!auth) {
    throwError(404, 'Auth record not found');
  }

  if (auth.googleId) {
    throwError(400, 'Google account already linked to this user');
  }

  // Check if googleId is already linked to another user
  const existingGoogleAuth = await Auths.findOne({ googleId });
  if (existingGoogleAuth) {
    throwError(400, 'This Google account is already linked to another user');
  }

  auth.googleId = googleId;
  auth.emailVerified = true; // Google verified the email
  await auth.save();

  logAuth('google_account_linked', userId, {
    email: auth.email,
    method: 'manual_link'
  });

  // Return combined user data
  const profile = await Profiles.findById(userId);
  return normalizeUser({ ...profile.toObject(), ...auth.toObject(), _id: userId });
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
  const existingAuth = await Auths.findOne({
    $or: [
      { email: email.toLowerCase() },
      { googleId: profile.id }
    ]
  });

  if (existingAuth) {
    throwError(400, 'User with this email or Google account already exists');
  }

  // 1. Create Profile FIRST (to get profile ID)
  const userProfile = new Profiles({
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
    },
    // Merge default preferences
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

  await userProfile.save();

  // 2. Create Auth with userId reference
  const auth = new Auths({
    userId: userProfile._id,
    email: email.toLowerCase(),
    googleId: profile.id,
    emailVerified: true, // Google verified the email
    isActive: true
  });

  await auth.save();

  logAuth('register_google', userProfile._id, {
    email: auth.email
  });

  return normalizeUser({ ...userProfile.toObject(), ...auth.toObject(), _id: userProfile._id });
};

module.exports = {
  linkGoogleToUser,
  createGoogleUser
};
