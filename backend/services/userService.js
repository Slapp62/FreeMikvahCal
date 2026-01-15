const Users = require('../models/Users');
const Preferences = require('../models/Preferences');
const { throwError } = require('../utils/functionHandlers');
const { normalizeUser } = require('../utils/normalizeResponses');
const { logDatabase } = require('../utils/logHelpers');

/**
 * Get user by ID
 */
const getUser = async (userId) => {
  const user = await Users.findById(userId);

  if (!user || user.isDeleted) {
    throwError(404, 'User not found');
  }

  return normalizeUser(user);
};

/**
 * Update user profile
 */
const updateUser = async (userId, updateData) => {
  const user = await Users.findById(userId);

  if (!user || user.isDeleted) {
    throwError(404, 'User not found');
  }

  // Update allowed fields
  const allowedFields = [
    'firstName',
    'lastName',
    'phoneNumber',
    'dateOfBirth',
    'location',
    'ethnicity',
    'specialOnahs'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'location' || field === 'specialOnahs') {
        // Merge nested objects
        user[field] = { ...user[field], ...updateData[field] };
      } else {
        user[field] = updateData[field];
      }
    }
  });

  // Check if profile is complete
  if (user.firstName && user.lastName && user.location && user.location.timezone) {
    user.profileComplete = true;
  }

  await user.save();

  logDatabase('update', 'Users', { userId, fields: Object.keys(updateData) });

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
 * Soft delete user
 */
const deleteUser = async (userId) => {
  const user = await Users.findById(userId);

  if (!user || user.isDeleted) {
    throwError(404, 'User not found');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;

  await user.save();

  logDatabase('soft_delete', 'Users', { userId });

  return { message: 'User account deleted successfully' };
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
