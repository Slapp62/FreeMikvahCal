const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 8,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  // Profile
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },

  // Location (CRITICAL for timezone-aware calculations)
  location: {
    city: String,
    geonameId: Number, // For Hebcal API
    lat: Number,
    lng: Number,
    timezone: {
      // IANA timezone name (e.g., "Asia/Jerusalem")
      type: String,
      required: true,
      default: 'UTC', // Must be set during registration/onboarding
    },
    _id: false,
  },

  // Jewish Community Settings
  ethnicity: {
    type: String,
    enum: ['ashkenazi', 'sephardi', 'teimani', 'other'],
    default: null,
  },

  // Halachic Stringencies (Chumras)
  halachicPreferences: {
    ohrZaruah: { type: Boolean, default: false }, // Separate on preceding onah for all vesetim
    kreisiUpleisi: { type: Boolean, default: false }, // 24-hour onah beinonit (day 30)
    chasamSofer: { type: Boolean, default: false }, // Also observe day 31
    _id: false,
  },

  // Account Status
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,

  // Security
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  lastLogin: { type: Date },

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Profile Status
  profileComplete: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false },

  // Privacy & GDPR
  consents: {
    dataProcessing: {
      granted: { type: Boolean, required: true },
      timestamp: { type: Date, required: true },
      ipAddress: String,
      userAgent: String,
      _id: false,
    },
    _id: false,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ isDeleted: 1, deletedAt: 1 });

// Hash password before saving (if modified)
userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Custom validation
userSchema.pre('validate', function (next) {
  if (!this.password && !this.googleId) {
    next(new Error('User must have either password or Google account'));
  }
  next();
});

module.exports = mongoose.model('Users', userSchema);
