const express = require('express');
const router = express.Router();
const userProfileController = require('./user-profile.controller');
const { authenticateUser } = require('../../shared/middleware/authenticate');
const { apiLimiter } = require('../../shared/middleware/rate-limiter');
const { validateUserUpdate, validatePreferencesUpdate } = require('./user-profile.validation');

// Apply rate limiting and authentication to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/users/me
router.get('/me', userProfileController.getCurrentUser);

// PUT /api/users/me
router.put('/me', validateUserUpdate, userProfileController.updateCurrentUser);

// DELETE /api/users/me
router.delete('/me', userProfileController.deleteAccount);

// GET /api/users/preferences
router.get('/preferences', userProfileController.getPreferences);

// PUT /api/users/preferences
router.put('/preferences', validatePreferencesUpdate, userProfileController.updatePreferences);

// POST /api/users/complete-onboarding
router.post('/complete-onboarding', userProfileController.completeOnboarding);

module.exports = router;
