const userService = require('../services/userService');

/**
 * Get current user
 * GET /api/users/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user
 * PUT /api/users/me
 */
const updateCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user._id, req.body);
    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user preferences
 * GET /api/users/preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    const preferences = await userService.getPreferences(req.user._id);
    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 * PUT /api/users/preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await userService.updatePreferences(req.user._id, req.body);
    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/users/me
 */
const deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.user._id);

    // Logout after deletion
    req.logout((err) => {
      if (err) {
        return next(err);
      }

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        res.clearCookie('connect.sid');
        res.status(200).json(result);
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete onboarding
 * POST /api/users/complete-onboarding
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const user = await userService.completeOnboarding(req.user._id);
    res.status(200).json({
      message: 'Onboarding completed',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getPreferences,
  updatePreferences,
  deleteAccount,
  completeOnboarding,
};
