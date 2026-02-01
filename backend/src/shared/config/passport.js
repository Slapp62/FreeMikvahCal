const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const Auths = require('../../features/auth/models/auth.model');
const Profiles = require('../../features/user-profile/models/profile.model');
const logger = require('./logger');
const { logSecurity, logAuth, logError } = require('../utils/log-helpers');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    // id is the Profile._id (user ID)
    const profile = await Profiles.findById(id);
    if (!profile) {
      return done(null, false);
    }

    // Optionally fetch auth data for complete user object
    const auth = await Auths.findOne({ userId: id });

    // Combine profile + auth data
    const user = {
      _id: profile._id,
      ...profile.toObject(),
      ...auth?.toObject()
    };

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
      // Find auth record (email + password in Auths model)
      const auth = await Auths.findOne({
        email: email.toLowerCase()
      }).select('+password');

      if (!auth) {
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
      if (auth.lockoutUntil && auth.lockoutUntil > Date.now()) {
        logSecurity('login_blocked', {
          email: email.toLowerCase(),
          userId: auth.userId,
          reason: 'account_locked',
          lockoutUntil: auth.lockoutUntil,
          ip: req.ip,
          correlationId: req.correlationId
        });
        return done(null, false, {
          message: 'Account locked. Try again later.'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, auth.password);

      if (!isMatch) {
        // Increment login attempts
        auth.loginAttempts += 1;

        if (auth.loginAttempts >= 5) {
          auth.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

          logSecurity('account_locked', {
            email: email.toLowerCase(),
            userId: auth.userId,
            reason: 'too_many_failed_attempts',
            loginAttempts: auth.loginAttempts,
            lockoutUntil: auth.lockoutUntil,
            ip: req.ip,
            correlationId: req.correlationId
          });
        } else {
          logSecurity('login_failed', {
            email: email.toLowerCase(),
            userId: auth.userId,
            reason: 'invalid_password',
            loginAttempts: auth.loginAttempts,
            ip: req.ip,
            correlationId: req.correlationId
          });
        }

        await auth.save();
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Reset login attempts on success
      auth.loginAttempts = 0;
      auth.lockoutUntil = null;
      auth.lastLogin = Date.now();
      await auth.save();

      // Fetch profile for combined user object
      const profile = await Profiles.findById(auth.userId);

      // Create user object for session (use Profile._id as user._id)
      const user = {
        _id: profile._id, // Profile ID is the user ID
        ...profile.toObject(),
        ...auth.toObject()
      };

      logAuth('login_success', profile._id, {
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

// Google OAuth Strategy - Only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
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

      // Step 1: Search for auth by googleId
      let auth = await Auths.findOne({
        googleId: profile.id
      });

      if (auth) {
        // Existing Google user - update last login
        auth.lastLogin = Date.now();
        await auth.save();

        // Fetch profile for combined user object
        const userProfile = await Profiles.findById(auth.userId);

        const user = {
          _id: userProfile._id,
          ...userProfile.toObject(),
          ...auth.toObject()
        };

        logAuth('google_login_success', userProfile._id, {
          email: auth.email,
          method: 'google_existing',
          ip: req.ip,
          correlationId: req.correlationId
        });

        return done(null, user);
      }

      // Step 2: Search for auth by email (for account linking)
      auth = await Auths.findOne({
        email: email.toLowerCase()
      });

      if (auth) {
        // Account linking: Auth exists with email but no googleId
        auth.googleId = profile.id;
        auth.emailVerified = true; // Google has verified the email
        auth.lastLogin = Date.now();

        // Reset any account lockout since Google verified them
        auth.loginAttempts = 0;
        auth.lockoutUntil = null;

        await auth.save();

        // Fetch profile for combined user object
        const userProfile = await Profiles.findById(auth.userId);

        const user = {
          _id: userProfile._id,
          ...userProfile.toObject(),
          ...auth.toObject()
        };

        logAuth('google_account_linked', userProfile._id, {
          email: auth.email,
          method: 'google_link_existing',
          ip: req.ip,
          correlationId: req.correlationId
        });

        return done(null, user);
      }

      // Step 3: Create new user with Google account
      // Create Profile FIRST
      const newProfile = new Profiles({
        profileComplete: false,
        onboardingCompleted: false,
        location: {
          city: '',
          timezone: 'UTC'
        },
        consents: {
          dataProcessing: {
            granted: true,
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        },
        // Merge default preferences
        hebrewCalendar: true,
        defaultCycleLength: 28,
        notifications: {
          enabled: true,
          hefsekTaharaReminder: true,
          shivaNekiyimReminder: true,
          mikvahReminder: true,
          vestOnotReminder: true,
          reminderTime: '09:00'
        },
        privacyMode: false,
        language: 'he',
        dataRetention: {
          keepCycles: 24,
          autoDelete: true
        },
        emailPreferences: {
          verificationEmails: true,
          reminders: {
            enabled: true,
            advanceNoticeHours: 48
          }
        }
      });

      await newProfile.save();

      // Create Auth with userId reference
      const newAuth = new Auths({
        userId: newProfile._id,
        email: email.toLowerCase(),
        googleId: profile.id,
        emailVerified: true,
        isActive: true,
        lastLogin: Date.now()
      });

      await newAuth.save();

      const newUser = {
        _id: newProfile._id,
        ...newProfile.toObject(),
        ...newAuth.toObject()
      };

      logAuth('google_register_success', newProfile._id, {
        email: newAuth.email,
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
} else {
  logger.warn('Google OAuth credentials not configured - Google sign-in will be disabled');
}

module.exports = passport;
