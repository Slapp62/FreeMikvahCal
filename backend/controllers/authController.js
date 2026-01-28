const authService = require('../services/authService');
const sendVerificationEmail = require('../services/brevoService');
const { normalizeUser } = require('../utils/normalizeResponses');
const passport = require('passport');
const Users = require('../models/Users');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    // authService.register should now return a 6-digit 'code' instead of a 'verificationToken'
    const { user, code } = await authService.register(req.body, metadata);

    try {
      await sendVerificationEmail(user.email, user.firstName, code);
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    res.status(201).json({
      message: 'Registration successful. Please enter the code sent to your email.',
      email: user.email // Helpful for the frontend modal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 6-digit PIN
 */
const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await Users.findOne({
      email: email.toLowerCase(),
      'emailVerification.code': code,
      'emailVerification.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    user.emailVerified = true;
    user.emailVerification = undefined;
    await user.save();

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

/**
 * Resend 6-digit PIN
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await Users.findOne({ email: email.toLowerCase() });

    // Security best practice: don't reveal if user exists
    if (!user || user.emailVerified) {
      return res.status(200).json({ message: 'If an account exists, a new code has been sent.' });
    }

    // Generate NEW 6-digit PIN
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailVerification = {
      code: newCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minute expiry
      sentAt: new Date()
    };
    await user.save();

    await sendVerificationEmail(user.email, user.firstName, newCode);

    res.status(200).json({ message: 'Verification code resent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Profile (Step 2 of Registration)
 * PATCH /api/auth/complete-profile
 */
const completeProfile = async (req, res, next) => {
  try {
    // req.user is available because the user verified their PIN and logged in
    const userId = req.user._id; 
    const { firstName, lastName, location, halachicPreferences, ethnicity } = req.body;

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName,
          lastName,
          location,
          halachicPreferences,
          ethnicity,
          profileCompleted: true // Useful flag to track if they finished setup
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile completed successfully',
      user: normalizeUser(updatedUser)
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
  completeProfile,
  login,
  logout,
  verifyCode,
  resendVerification,
  getSession,
  changePassword
};
