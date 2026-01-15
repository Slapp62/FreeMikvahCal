const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../models/Users');

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
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user
      const user = await Users.findOne({
        email: email.toLowerCase(),
        isDeleted: false
      });

      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Check account lockout
      if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
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
        }

        await user.save();
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Reset login attempts on success
      user.loginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLogin = Date.now();
      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;
