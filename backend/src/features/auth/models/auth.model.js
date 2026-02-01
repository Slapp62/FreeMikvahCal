const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const authSchema = new Schema({
  // Reference to Profile
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true,
    unique: true,
    index: true
  },

  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: 8
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Security
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  lastLogin: { type: Date },

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Email Verification
  emailVerified: { type: Boolean, default: false },
  emailVerification: {
    code: String,          // verification code
    expiresAt: Date,       // expiration time
    sentAt: Date,          // last time verification email was sent
    _id: false
  },

  // Account Status
  isActive: { type: Boolean, default: true },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
authSchema.index({ email: 1, isActive: 1 });

// Hash password before saving (if modified)
authSchema.pre('save', async function(next) {
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
authSchema.pre('validate', function(next) {
  if (!this.password && !this.googleId) {
    next(new Error('User must have either password or Google account'));
  }
  next();
});

// Instance method to link Google account
authSchema.methods.linkGoogle = async function(googleId) {
  if (this.googleId) {
    throw new Error('Google account already linked');
  }

  // Check if googleId is already used by another user
  const existingAuth = await mongoose.model('Auths').findOne({ googleId });
  if (existingAuth && !existingAuth._id.equals(this._id)) {
    throw new Error('This Google account is already linked to another user');
  }

  this.googleId = googleId;
  this.emailVerified = true;

  return this.save();
};

module.exports = mongoose.model('Auths', authSchema);
