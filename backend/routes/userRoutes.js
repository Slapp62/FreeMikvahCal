const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateUserUpdate, validatePreferencesUpdate } = require('../middleware/userValidation');

// Apply rate limiting and authentication to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/users/me
router.get('/me', userController.getCurrentUser);

// PUT /api/users/me
router.put('/me', validateUserUpdate, userController.updateCurrentUser);

// DELETE /api/users/me
router.delete('/me', userController.deleteAccount);

// GET /api/users/preferences
router.get('/preferences', userController.getPreferences);

// PUT /api/users/preferences
router.put('/preferences', validatePreferencesUpdate, userController.updatePreferences);

// POST /api/users/complete-onboarding
router.post('/complete-onboarding', userController.completeOnboarding);

module.exports = router;
