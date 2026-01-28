const express = require('express');
const router = express.Router();
const registrationController = require('./registration.controller');
const authenticationController = require('./authentication.controller');
const oauthController = require('./oauth.controller');
const { authLimiter } = require('../../shared/middleware/rate-limiter');
const { authenticateUser } = require('../../shared/middleware/authenticate');
const { validateRegister, validateLogin, validateChangePassword } = require('./auth.validation');

// === REGISTRATION ROUTES ===
// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, registrationController.register);

// POST /api/auth/verify-code
router.post('/verify-code', registrationController.verifyCode);

// POST /api/auth/resend-verification
router.post('/resend-verification', registrationController.resendVerification);

// PATCH /api/auth/complete-profile
router.patch('/complete-profile', authenticateUser, registrationController.completeProfile);

// === AUTHENTICATION ROUTES ===
// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, authenticationController.login);

// POST /api/auth/logout
router.post('/logout', authenticationController.logout);

// GET /api/auth/session
router.get('/session', authenticationController.getSession);

// POST /api/auth/change-password
router.post('/change-password', authenticateUser, validateChangePassword, authenticationController.changePassword);

// === GOOGLE OAUTH ROUTES ===
// GET /api/auth/google - Initiate Google OAuth flow
router.get('/google', oauthController.initiateGoogleAuth);

// GET /api/auth/google/callback - Handle Google OAuth callback
router.get('/google/callback', oauthController.handleGoogleCallback);

// POST /api/auth/link-google - Link Google account to existing user
router.post('/link-google', authenticateUser, oauthController.linkGoogleAccount);

module.exports = router;
