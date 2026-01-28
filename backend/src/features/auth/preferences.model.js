const mongoose = require('mongoose');
const { Schema } = mongoose;

const preferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true
  },

  // Calendar Preferences
  hebrewCalendar: { type: Boolean, default: true },
  defaultCycleLength: { type: Number, default: 28, min: 20, max: 40 },

  // Notifications
  notifications: {
    enabled: { type: Boolean, default: true },
    hefsekTaharaReminder: { type: Boolean, default: true },
    shivaNekiyimReminder: { type: Boolean, default: true },
    mikvahReminder: { type: Boolean, default: true },
    vestOnotReminder: { type: Boolean, default: true },
    reminderTime: { type: String, default: '09:00' },
    _id: false
  },

  // Privacy
  privacyMode: { type: Boolean, default: false },

  // Display
  language: {
    type: String,
    enum: ['he', 'en'],
    default: 'he'
  },

  // Data Retention
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

preferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Preferences', preferencesSchema);
