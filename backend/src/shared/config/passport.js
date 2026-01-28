const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../../features/auth/auth.model');
const Preferences = require('../../features/auth/preferences.model');
const logger = require('./logger');
const { logSecurity, logAuth, logError } = require('../utils/log-helpers');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    logError(error, {
      operation: 'passport_deserialize_user',
      userId: id
    });
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    try {
      // Find user
      const user = await Users.findOne({
        email: email.toLowerCase(),
        isDeleted: false
      });

      if (!user) {
        logSecurity('login_failed', {
          email: email.toLowerCase(),
          reason: 'user_not_found',
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          correlationId: req.correlationId
        });
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Check account lockout
      if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
        logSecurity('login_blocked', {
          email: email.toLowerCase(),
          userId: user._id,
          reason: 'account_locked',
          lockoutUntil: user.lockoutUntil,
          ip: req.ip,
          correlationId: req.correlationId
        });
        return done(null, false, {
          message: 'Account locked. Try again later.'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // Increment login attempts
        user.loginAttempts += 1;

        if (user.loginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

          logSecurity('account_locked', {
            email: email.toLowerCase(),
            userId: user._id,
            reason: 'too_many_failed_attempts',
            loginAttempts: user.loginAttempts,
            lockoutUntil: user.lockoutUntil,
            ip: req.ip,
            correlationId: req.correlationId
          });
        } else {
          logSecurity('login_failed', {
            email: email.toLowerCase(),
            userId: user._id,
            reason: 'invalid_password',
            loginAttempts: user.loginAttempts,
            ip: req.ip,
            correlationId: req.correlationId
          });
        }

        await user.save();
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Reset login attempts on success
      user.loginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLogin = Date.now();
      await user.save();

      logAuth('login_success', user._id, {
        email: email.toLowerCase(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId
      });

      return done(null, user);
    } catch (error) {
      logError(error, {
        operation: 'passport_local_auth',
        email: email.toLowerCase(),
        correlationId: req.correlationId
      });
      return done(error);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        logError(new Error('No email provided by Google'), {
          operation: 'google_oauth',
          profileId: profile.id,
          correlationId: req.correlationId
        });
        return done(null, false, { message: 'Email is required from Google profile' });
      }

      // Step 1: Search for user by googleId
      let user = await Users.findOne({
        googleId: profile.id,
        isDeleted: false
      });

      if (user) {
        // Existing Google user - update last login
        user.lastLogin = Date.now();
        await user.save();

        logAuth('google_login_success', user._id, {
          email: user.email,
          method: 'google_existing',
          ip: req.ip,
          correlationId: req.correlationId
        });

        return done(null, user);
      }

      // Step 2: Search for user by email (for account linking)
      user = await Users.findOne({
        email: email.toLowerCase(),
        isDeleted: false
      });

      if (user) {
        // Account linking: User exists with email but no googleId
        user.googleId = profile.id;
        user.emailVerified = true; // Google has verified the email
        user.lastLogin = Date.now();

        // Reset any account lockout since Google verified them
        user.loginAttempts = 0;
        user.lockoutUntil = null;

        await user.save();

        logAuth('google_account_linked', user._id, {
          email: user.email,
          method: 'google_link_existing',
          ip: req.ip,
          correlationId: req.correlationId
        });

        return done(null, user);
      }

      // Step 3: Create new user with Google account
      const newUser = new Users({
        email: email.toLowerCase(),
        googleId: profile.id,
        emailVerified: true, // Google has already verified the email
        profileComplete: false, // Still needs to complete profile
        onboardingCompleted: false,
        location: {
          city: '',
          timezone: 'UTC' // Default, will be updated in complete-profile
        },
        consents: {
          dataProcessing: {
            granted: true, // Assumed by OAuth flow
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        },
        lastLogin: Date.now()
      });

      await newUser.save();

      // Create default preferences
      await Preferences.create({
        userId: newUser._id
      });

      logAuth('google_register_success', newUser._id, {
        email: newUser.email,
        method: 'google_new',
        ip: req.ip,
        correlationId: req.correlationId
      });

      return done(null, newUser);

    } catch (error) {
      logError(error, {
        operation: 'google_oauth',
        email: profile.emails?.[0]?.value,
        correlationId: req.correlationId
      });
      return done(error);
    }
  }
));

module.exports = passport;
