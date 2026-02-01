const oauthService = require('./oauth.service');
const authenticationService = require('./authentication.service');
const passport = require('passport');
const { logError, logSecurity, logAuth } = require('../../shared/utils/log-helpers');

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
const initiateGoogleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback
 */
const handleGoogleCallback = (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      logError(err, {
        context: 'oauth.controller.handleGoogleCallback',
        authProvider: 'google',
        stage: 'authentication'
      });
      logSecurity('oauth_failure', {
        provider: 'google',
        error: err.message,
        ip: req.ip
      });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed&message=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }

    if (!user) {
      const errorMessage = info?.message || 'Authentication failed';
      logSecurity('oauth_no_user', {
        provider: 'google',
        reason: errorMessage,
        ip: req.ip
      });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`
      );
    }

    // Log the user in
    req.login(user, async (err) => {
      if (err) {
        logError(err, {
          context: 'oauth.controller.handleGoogleCallback',
          userId: user._id,
          stage: 'session_creation'
        });
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=session_failed&message=${encodeURIComponent('Failed to create session. Please try again.')}`
        );
      }

      try {
        // Get full user data
        const userData = await authenticationService.getUserById(user._id);

        logAuth('oauth_login_success', user._id, {
          provider: 'google',
          profileComplete: userData.profileComplete,
          ip: req.ip
        });

        // Redirect based on profile completion status
        if (!userData.profileComplete) {
          return res.redirect(`${process.env.FRONTEND_URL}/complete-profile`);
        } else {
          return res.redirect(`${process.env.FRONTEND_URL}/calendar`);
        }
      } catch (error) {
        logError(error, {
          context: 'oauth.controller.handleGoogleCallback',
          userId: user._id,
          stage: 'user_data_fetch'
        });
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=user_fetch_failed&message=${encodeURIComponent('Failed to retrieve user data.')}`
        );
      }
    });
  })(req, res, next);
};

/**
 * Link Google account to existing authenticated user
 * POST /api/auth/link-google
 */
const linkGoogleAccount = async (req, res, next) => {
  try {
    // This route should be protected - user must be authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { googleId } = req.body;

    if (!googleId) {
      return res.status(400).json({ message: 'Google ID is required' });
    }

    const updatedUser = await oauthService.linkGoogleToUser(req.user._id, googleId);

    res.status(200).json({
      message: 'Google account linked successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateGoogleAuth,
  handleGoogleCallback,
  linkGoogleAccount
};
