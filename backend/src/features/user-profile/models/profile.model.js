const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
  // Profile Information
  phoneNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },

  // Location (CRITICAL for timezone-aware calculations)
  location: {
    city: String,
    geonameId: Number,    // For Hebcal API
    lat: Number,
    lng: Number,
    timezone: {           // IANA timezone name (e.g., "Asia/Jerusalem")
      type: String,
      required: true,
      default: 'UTC'      // Must be set during registration/onboarding
    },
    _id: false
  },

  // Halachic Custom Settings
  halachicCustom: {
    type: String,
    enum: ['ashkenazi', 'sephardi', 'chabad', 'manual'],
    default: null
  },

  // Halachic Stringencies (Chumras)
  halachicPreferences: {
    ohrZaruah: { type: Boolean, default: false },      // Separate on preceding onah for all vesetim
    kreisiUpleisi: { type: Boolean, default: false },  // 24-hour onah beinonit (day 30)
    chasamSofer: { type: Boolean, default: false },    // Also observe day 31
    minimumNiddahDays: {                               // Minimum days before hefsek tahara allowed
      type: Number,
      default: 5,
      min: 4,                                          // Halachic minimum is typically 4-5 days
      max: 10                                          // Reasonable upper limit
    },
    _id: false
  },

  // Calendar Preferences (merged from Preferences model)
  hebrewCalendar: { type: Boolean, default: true },
  defaultCycleLength: { type: Number, default: 28, min: 20, max: 40 },

  // Notifications (merged from Preferences model)
  notifications: {
    enabled: { type: Boolean, default: true },
    hefsekTaharaReminder: { type: Boolean, default: true },
    shivaNekiyimReminder: { type: Boolean, default: true },
    mikvahReminder: { type: Boolean, default: true },
    vestOnotReminder: { type: Boolean, default: true },
    reminderTime: { type: String, default: '09:00' },
    _id: false
  },

  // Email Preferences
  emailPreferences: {
    verificationEmails: { type: Boolean, default: true },

    reminders: {
      enabled: { type: Boolean, default: true },

      advanceNoticeHours: {
        type: Number,
        default: 48,            // e.g. 2 days before
        min: 1,
        max: 168                // up to 7 days
      }
    },

    _id: false
  },
  emailMeta: {
    lastEmailSentAt: Date,
    bounced: { type: Boolean, default: false },
    _id: false
  },

  // Privacy (merged from Preferences model)
  privacyMode: { type: Boolean, default: false },

  // Display (merged from Preferences model)
  language: {
    type: String,
    enum: ['he', 'en'],
    default: 'he'
  },

  // Data Retention (merged from Preferences model)
  dataRetention: {
    keepCycles: {
      type: Number,
      default: 24,
      min: 12,
      max: 48
    },
    autoDelete: {
      type: Boolean,
      default: true
    },
    _id: false
  },

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
      _id: false
    },
    _id: false
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
profileSchema.index({ 'location.geonameId': 1 });

// Update timestamp on save
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profiles', profileSchema);
