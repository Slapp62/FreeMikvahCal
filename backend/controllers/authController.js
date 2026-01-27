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

// ... (login, logout, getSession, changePassword remain the same)

module.exports = {
  register,
  login,
  logout,
  verifyCode,
  resendVerification,
  getSession,
  changePassword
};