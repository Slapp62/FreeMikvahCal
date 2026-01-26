const authService = require('../services/authService');
const sendVerificationEmail = require('../services/brevoService');
const passport = require('passport');
const crypto = require('crypto');
const Users = require('../models/Users');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const { user, verificationToken } = await authService.register(req.body, metadata);

    try {
      await sendVerificationEmail(user.email, user.firstName, verificationToken);
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    // Log the user in after registration
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user
      });
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await Users.findOne({
      'emailVerification.tokenHash': tokenHash,
      'emailVerification.expiresAt': { $gt: new Date() }
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // set this in .env

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/verify?status=failed`);
    }

    user.emailVerified = true;
    user.emailVerification = undefined;
    await user.save();

    res.redirect(`${FRONTEND_URL}/verify?status=success`);
  } catch (err) {
    next(err);
  }
};


/**
 * Login user
 * POST /api/auth/login
 */
const login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        message: info.message || 'Invalid credentials'
      });
    }

    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        // Get full user data
        const userData = await authService.login(user._id);

        res.status(200).json({
          message: 'Login successful',
          user: userData
        });
      } catch (error) {
        next(error);
      }
    });
  })(req, res, next);
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie('connect.sid');
      res.status(200).json({
        message: 'Logout successful'
      });
    });
  });
};

/**
 * Get current session
 * GET /api/auth/session
 */
const getSession = async (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      const user = await authService.getUserById(req.user._id);
      res.status(200).json({
        authenticated: true,
        user
      });
    } else {
      res.status(200).json({
        authenticated: false,
        user: null
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  getSession,
  changePassword
};
