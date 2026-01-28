const authenticationService = require('./authentication.service');
const passport = require('passport');

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
        const userData = await authenticationService.login(user._id);

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
      const user = await authenticationService.getUserById(req.user._id);
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
    const result = await authenticationService.changePassword(req.user._id, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getSession,
  changePassword
};
