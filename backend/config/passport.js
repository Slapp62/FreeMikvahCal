const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../models/Users');
const { logSecurity, logAuth, logError } = require('../utils/logHelpers');

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
      userId: id,
    });
    done(error, null);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Find user
        const user = await Users.findOne({
          email: email.toLowerCase(),
          isDeleted: false,
        });

        if (!user) {
          logSecurity('login_failed', {
            email: email.toLowerCase(),
            reason: 'user_not_found',
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            correlationId: req.correlationId,
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
            correlationId: req.correlationId,
          });
          return done(null, false, {
            message: 'Account locked. Try again later.',
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
              correlationId: req.correlationId,
            });
          } else {
            logSecurity('login_failed', {
              email: email.toLowerCase(),
              userId: user._id,
              reason: 'invalid_password',
              loginAttempts: user.loginAttempts,
              ip: req.ip,
              correlationId: req.correlationId,
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
          correlationId: req.correlationId,
        });

        return done(null, user);
      } catch (error) {
        logError(error, {
          operation: 'passport_local_auth',
          email: email.toLowerCase(),
          correlationId: req.correlationId,
        });
        return done(error);
      }
    }
  )
);

module.exports = passport;
