const authService = require('../services/authService');
const passport = require('passport');

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

    const user = await authService.register(req.body, metadata);

    // Log the user in after registration
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      res.status(201).json({
        message: 'Registration successful',
        user
      });
    });
  } catch (error) {
    next(error);
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
  getSession,
  changePassword
};
