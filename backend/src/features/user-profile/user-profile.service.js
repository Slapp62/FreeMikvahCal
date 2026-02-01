const Auths = require('../auth/models/auth.model');
const Profiles = require('./models/profile.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logDatabase, logError, logBusiness } = require('../../shared/utils/log-helpers');
// Cross-feature import: allowed per user's preference (Option A)
const { recalculateAllPeriodVestOnot } = require('../cycle-tracking/cycle.service');

/**
 * Get user by ID
 */
const getUser = async (userId) => {
  const profile = await Profiles.findById(userId);
  const auth = await Auths.findOne({ userId });

  if (!profile) {
    throwError(404, 'User not found');
  }

  // Combine profile + auth data (preferences now merged in profile)
  return normalizeUser({ ...profile.toObject(), ...auth?.toObject(), _id: userId });
};

/**
 * Update user profile
 */
const updateUser = async (userId, updateData) => {
  const profile = await Profiles.findById(userId);

  if (!profile) {
    throwError(404, 'User not found');
  }

  // Track if halachic preferences changed for cycle recalculation
  let halachicPreferencesChanged = false;
  if (updateData.halachicPreferences) {
    const oldPrefs = profile.halachicPreferences || {};
    const newPrefs = updateData.halachicPreferences;

    // Check if any preference value actually changed
    halachicPreferencesChanged =
      (newPrefs.ohrZaruah !== undefined && newPrefs.ohrZaruah !== oldPrefs.ohrZaruah) ||
      (newPrefs.kreisiUpleisi !== undefined && newPrefs.kreisiUpleisi !== oldPrefs.kreisiUpleisi) ||
      (newPrefs.chasamSofer !== undefined && newPrefs.chasamSofer !== oldPrefs.chasamSofer);
  }

  // Update allowed fields (includes merged preference fields)
  const allowedFields = [
    'phoneNumber',
    'dateOfBirth',
    'location',
    'halachicCustom',
    'halachicPreferences',
    // Preferences fields (merged into Profile)
    'hebrewCalendar',
    'defaultCycleLength',
    'notifications',
    'privacyMode',
    'language',
    'dataRetention',
    'emailPreferences'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'location' || field === 'halachicPreferences' || field === 'notifications' || field === 'dataRetention' || field === 'emailPreferences') {
        // Merge nested objects
        profile[field] = { ...profile[field], ...updateData[field] };
      } else {
        profile[field] = updateData[field];
      }
    }
  });

  // Check if profile is complete
  if (profile.location && profile.location.timezone) {
    profile.profileComplete = true;
  }

  await profile.save();

  // If halachic preferences changed, recalculate vest onot for all existing periods
  if (halachicPreferencesChanged) {
    try {
      await recalculateAllPeriodVestOnot(userId, profile.halachicPreferences);
      logDatabase('update', 'Profiles', { userId, fields: Object.keys(updateData), periodsRecalculated: true });
    } catch (error) {
      // Log error but don't fail the user update
      logError(error, {
        context: 'user-profile.service.updateUser',
        userId,
        operation: 'recalculateAllPeriodVestOnot',
        halachicPreferencesChanged: true
      });
      logDatabase('update', 'Profiles', { userId, fields: Object.keys(updateData), periodsRecalculationFailed: true });
    }
  } else {
    logDatabase('update', 'Profiles', { userId, fields: Object.keys(updateData) });
  }

  return normalizeUser(profile.toObject());
};

/**
 * Get user preferences (DEPRECATED - now merged into Profile)
 * Use getUser() instead - preferences are included in profile
 */
const getPreferences = async (userId) => {
  const profile = await Profiles.findById(userId);

  if (!profile) {
    throwError(404, 'User not found');
  }

  // Return only preference fields for backwards compatibility
  return {
    userId: profile._id,
    hebrewCalendar: profile.hebrewCalendar,
    defaultCycleLength: profile.defaultCycleLength,
    notifications: profile.notifications,
    privacyMode: profile.privacyMode,
    language: profile.language,
    dataRetention: profile.dataRetention
  };
};

/**
 * Update user preferences (DEPRECATED - now merged into Profile)
 * Use updateUser() instead - preferences are included in profile
 */
const updatePreferences = async (userId, updateData) => {
  // Delegate to updateUser since preferences are now merged
  await updateUser(userId, updateData);

  // Return preference fields for backwards compatibility
  return getPreferences(userId);
};

/**
 * Hard delete user and all associated data
 * Creates an analytics log entry without personal information
 */
const deleteUser = async (userId) => {
  const profile = await Profiles.findById(userId);
  const auth = await Auths.findOne({ userId });

  if (!profile) {
    throwError(404, 'User not found');
  }

  // Import models for cascade delete
  const Periods = require('../cycle-tracking/models/period.model');
  const Bedikahs = require('../cycle-tracking/models/bedikah.model');
  const Vestos = require('../cycle-tracking/models/vestos.model');
  const DeletedUserLog = require('./deletedUserLog.model');

  // Calculate account age for analytics
  const accountAgeInDays = Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24));

  // Count periods for analytics
  const periodCount = await Periods.countDocuments({ userId });

  // Create analytics log entry (NO personal information)
  await DeletedUserLog.create({
    deletedAt: new Date(),
    userCreatedAt: profile.createdAt,
    deletionMethod: 'manual',
    metadata: {
      hadGoogleAccount: !!auth?.googleId,
      totalCycles: periodCount,
      accountAgeInDays
    }
  });

  // Cascade delete all related data
  await Periods.deleteMany({ userId });
  await Bedikahs.deleteMany({ userId });
  await Vestos.deleteMany({ userId });

  // Hard delete the auth and profile
  await Auths.deleteOne({ userId });
  await Profiles.findByIdAndDelete(userId);

  logDatabase('hard_delete', 'Profiles', { userId });
  logBusiness('user_account_deleted', {
    userId,
    accountAgeInDays,
    periodCount,
    hadGoogleAccount: !!auth?.googleId,
    profileComplete: profile.profileComplete
  });

  return { message: 'User account and all data permanently deleted' };
};

/**
 * Complete onboarding
 */
const completeOnboarding = async (userId) => {
  const profile = await Profiles.findById(userId);

  if (!profile) {
    throwError(404, 'User not found');
  }

  profile.onboardingCompleted = true;
  await profile.save();

  return normalizeUser(profile.toObject());
};

module.exports = {
  getUser,
  updateUser,
  getPreferences,
  updatePreferences,
  deleteUser,
  completeOnboarding
};
