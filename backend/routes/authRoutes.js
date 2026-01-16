const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin, validateChangePassword } = require('../middleware/authValidation');

// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/session
router.get('/session', authController.getSession);

// POST /api/auth/change-password
router.post('/change-password', authenticateUser, validateChangePassword, authController.changePassword);

module.exports = router;
