const registrationService = require('./registration.service');
const sendVerificationEmail = require('../../shared/services/email.service');
const { normalizeUser } = require('../../shared/utils/normalize-responses');
const Auths = require('./models/auth.model');
const Profiles = require('../user-profile/models/profile.model');
const { logError } = require('../../shared/utils/log-helpers');

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
      logError(err, {
        context: 'registration.controller.register',
        email: user.email,
        stage: 'email_sending',
        emailType: 'verification'
      });
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

    // Query Auth model for email verification
    const auth = await Auths.findOne({
      email: email.toLowerCase(),
      'emailVerification.code': code,
      'emailVerification.expiresAt': { $gt: new Date() },
    });

    if (!auth) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Update email verification status
    auth.emailVerified = true;
    auth.emailVerification = undefined;
    await auth.save();

    // Fetch profile for combined user data
    const profile = await Profiles.findById(auth.userId);

    // Create user object for session (use Profile._id as user._id)
    const userForSession = {
      _id: profile._id, // Profile ID is the user ID
      ...profile.toObject(),
      ...auth.toObject()
    };

    // Login with profile ID (not auth ID)
    req.login(userForSession, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        status: 'success',
        user: normalizeUser(userForSession)
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

    // Query Auth model for email
    const auth = await Auths.findOne({ email: email.toLowerCase() });

    // Security best practice: don't reveal if user exists
    if (!auth || auth.emailVerified) {
      return res.status(200).json({ message: 'If an account exists, a new code has been sent.' });
    }

    // Generate NEW 6-digit PIN
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    auth.emailVerification = {
      code: newCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minute expiry
      sentAt: new Date()
    };
    await auth.save();

    await sendVerificationEmail(auth.email, 'User', newCode);

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
    const userId = req.user._id; // This is the Profile._id
    const { location, halachicPreferences, halachicCustom } = req.body;

    // Update Profile model (not Users model)
    const updatedProfile = await Profiles.findByIdAndUpdate(
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

    // Fetch auth data for combined response
    const auth = await Auths.findOne({ userId });

    // Combine profile + auth for response
    const combinedUser = {
      ...updatedProfile.toObject(),
      ...auth?.toObject(),
      _id: userId
    };

    res.status(200).json({
      message: 'Profile completed successfully',
      user: normalizeUser(combinedUser)
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
