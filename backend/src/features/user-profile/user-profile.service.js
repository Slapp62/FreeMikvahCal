const Users = require('../auth/auth.model');
const Preferences = require('../auth/preferences.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const { logDatabase } = require('../../shared/utils/log-helpers');
// Cross-feature import: allowed per user's preference (Option A)
const { recalculateAllCycleVestOnot } = require('../cycle-tracking/cycle.service');

/**
 * Get user by ID
 */
const getUser = async (userId) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  return normalizeUser(user);
};

/**
 * Update user profile
 */
const updateUser = async (userId, updateData) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  // Track if halachic preferences changed for cycle recalculation
  let halachicPreferencesChanged = false;
  if (updateData.halachicPreferences) {
    const oldPrefs = user.halachicPreferences || {};
    const newPrefs = updateData.halachicPreferences;

    // Check if any preference value actually changed
    halachicPreferencesChanged =
      (newPrefs.ohrZaruah !== undefined && newPrefs.ohrZaruah !== oldPrefs.ohrZaruah) ||
      (newPrefs.kreisiUpleisi !== undefined && newPrefs.kreisiUpleisi !== oldPrefs.kreisiUpleisi) ||
      (newPrefs.chasamSofer !== undefined && newPrefs.chasamSofer !== oldPrefs.chasamSofer);
  }

  // Update allowed fields
  const allowedFields = [
    'phoneNumber',
    'dateOfBirth',
    'location',
    'halachicCustom',
    'halachicPreferences'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'location' || field === 'halachicPreferences') {
        // Merge nested objects
        user[field] = { ...user[field], ...updateData[field] };
      } else {
        user[field] = updateData[field];
      }
    }
  });

  // Check if profile is complete
  if (user.location && user.location.timezone) {
    user.profileComplete = true;
  }

  await user.save();

  // If halachic preferences changed, recalculate vest onot for all existing cycles
  if (halachicPreferencesChanged) {
    try {
      await recalculateAllCycleVestOnot(userId, user.halachicPreferences);
      logDatabase('update', 'Users', { userId, fields: Object.keys(updateData), cyclesRecalculated: true });
    } catch (error) {
      // Log error but don't fail the user update
      console.error('Failed to recalculate cycle vest onot:', error);
      logDatabase('update', 'Users', { userId, fields: Object.keys(updateData), cyclesRecalculationFailed: true });
    }
  } else {
    logDatabase('update', 'Users', { userId, fields: Object.keys(updateData) });
  }

  return normalizeUser(user);
};

/**
 * Get user preferences
 */
const getPreferences = async (userId) => {
  let preferences = await Preferences.findOne({ userId });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await Preferences.create({ userId });
  }

  return preferences;
};

/**
 * Update user preferences
 */
const updatePreferences = async (userId, updateData) => {
  let preferences = await Preferences.findOne({ userId });

  // Create if doesn't exist
  if (!preferences) {
    preferences = new Preferences({ userId });
  }

  // Update allowed fields
  const allowedFields = [
    'hebrewCalendar',
    'defaultCycleLength',
    'notifications',
    'privacyMode',
    'language',
    'dataRetention'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'notifications' || field === 'dataRetention') {
        // Merge nested objects
        preferences[field] = { ...preferences[field].toObject(), ...updateData[field] };
      } else {
        preferences[field] = updateData[field];
      }
    }
  });

  await preferences.save();

  logDatabase('update', 'Preferences', { userId });

  return preferences;
};

/**
 * Hard delete user and all associated data
 * Creates an analytics log entry without personal information
 */
const deleteUser = async (userId) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  // Import models for cascade delete
  const Cycle = require('../cycle-tracking/cycle.model');
  const DeletedUserLog = require('./deletedUserLog.model');

  // Calculate account age for analytics
  const accountAgeInDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

  // Count cycles for analytics
  const cycleCount = await Cycle.countDocuments({ userId });

  // Create analytics log entry (NO personal information)
  await DeletedUserLog.create({
    deletedAt: new Date(),
    userCreatedAt: user.createdAt,
    deletionMethod: 'manual',
    metadata: {
      hadGoogleAccount: !!user.googleId,
      totalCycles: cycleCount,
      accountAgeInDays
    }
  });

  // Delete all user cycles
  await Cycle.deleteMany({ userId });

  // Hard delete the user
  await Users.findByIdAndDelete(userId);

  logDatabase('hard_delete', 'Users', { userId });

  return { message: 'User account and all data permanently deleted' };
};

/**
 * Complete onboarding
 */
const completeOnboarding = async (userId) => {
  const user = await Users.findById(userId);

  if (!user) {
    throwError(404, 'User not found');
  }

  user.onboardingCompleted = true;
  await user.save();

  return normalizeUser(user);
};

module.exports = {
  getUser,
  updateUser,
  getPreferences,
  updatePreferences,
  deleteUser,
  completeOnboarding
};
