const registrationService = require('./registration.service');
const sendVerificationEmail = require('../../shared/services/email.service');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const Users = require('./auth.model');

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

    // registrationService.register returns a 6-digit 'code'
    const { user, code } = await registrationService.register(req.body, metadata);

    try {
      await sendVerificationEmail(user.email, 'User', code);
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
 * POST /api/auth/verify-code
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
 * POST /api/auth/resend-verification
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

    await sendVerificationEmail(user.email, 'User', newCode);

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
    const { location, halachicPreferences, halachicCustom } = req.body;

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          location,
          halachicPreferences,
          halachicCustom,
          profileComplete: true // Useful flag to track if they finished setup
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

module.exports = {
  register,
  verifyCode,
  resendVerification,
  completeProfile
};
