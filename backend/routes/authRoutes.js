const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateUser } = require('../middleware/authMiddleware');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validation/Joi/authSchemas');

/**
 * Validation middleware for registration
 */
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validation middleware for login
 */
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validation middleware for password change
 */
const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

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
