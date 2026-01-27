const authService = require('../services/authService');
const sendVerificationEmail = require('../services/brevoService');
const { normalizeUser } = require('../utils/normalizeResponses');
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
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({ status: 'failed', reason: 'no-token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await Users.findOne({
      'emailVerification.tokenHash': tokenHash,
      'emailVerification.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: 'failed', reason: 'invalid-token' });
    }

    // IMPORTANT: Save the verification status FIRST
    user.emailVerified = true;
    user.emailVerification = undefined;
    await user.save();

    // Now log them in
    req.login(user, (err) => {
      if (err) return next(err);
      
      return res.status(200).json({ 
        status: 'success',
        user: normalizeUser(user) 
      });
    });

  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email: email.toLowerCase() });

    // If no user or already verified, just return success (security best practice)
    if (!user || user.emailVerified) {
      return res.status(200).json({ message: 'If an account exists, a new link has been sent.' });
    }

    // Generate NEW token and hash
    const newToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(newToken).digest('hex');

    // Update user with new token and new expiry
    user.emailVerification = {
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sentAt: new Date()
    };
    await user.save();

    // Send the email
    await sendVerificationEmail(user.email, user.firstName, newToken);

    res.status(200).json({ message: 'Verification email resent.' });
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
  verifyEmail,
  resendVerification,
  getSession,
  changePassword
};
