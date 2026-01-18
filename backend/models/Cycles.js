const mongoose = require('mongoose');
const { Schema } = mongoose;

const cycleSchema = new Schema({
  // User Reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    index: true
  },

  // Cycle Dates (all stored as UTC)
  niddahStartDate: { type: Date, required: true },
  hefsekTaharaDate: { type: Date },
  shivaNekiyimStartDate: { type: Date },
  mikvahDate: { type: Date },

  // Onah tracking (day/night boundary at sunset)
  niddahStartOnah: {
    type: String,
    enum: ['day', 'night'],
    required: true
  },

  // Timezone info (CRITICAL for calculations)
  calculatedInTimezone: {
    type: String,
    required: true  // IANA timezone name at time of creation
  },

  // Sunset time on niddahStartDate (for reference)
  niddahStartSunset: {
    type: Date  // Sunset time on niddahStartDate in user's location
  },

  // Cycle Status
  status: {
    type: String,
    enum: ['niddah', 'shiva_nekiyim', 'completed'],
    default: 'niddah',
    index: true
  },

  // Cycle Measurements
  cycleLength: { type: Number },
  haflagah: { type: Number },

  // Vest Onot - Computed in pre-save hook with timezone awareness
  vestOnot: {
    yomHachodesh: {
      date: Date,
      onah: { type: String, enum: ['day', 'night'] },
      hebrewDate: String,
      dayOfWeek: Number,
      sunset: Date,
      sunrise: Date,
      _id: false
    },
    ohrHachodesh: {
      date: Date,
      onah: { type: String, enum: ['day', 'night'] },
      hebrewDate: String,
      dayOfWeek: Number,
      sunset: Date,
      sunrise: Date,
      _id: false
    },
    haflagah: {
      date: Date,
      onah: { type: String, enum: ['day', 'night'] },
      interval: Number,
      hebrewDate: String,
      dayOfWeek: Number,
      sunset: Date,
      sunrise: Date,
      _id: false
    },
    onahBeinonit: {
      date: Date,
      onah: { type: String, enum: ['day', 'night'] },
      calculatedFrom: Number,
      averageLength: Number,
      hebrewDate: String,
      dayOfWeek: Number,
      sunset: Date,
      sunrise: Date,
      _id: false
    },
    _id: false
  },

  // Bedikot tracking
  bedikot: [{
    date: { type: Date, required: true },
    dayNumber: { type: Number, min: 1, max: 7 },
    timeOfDay: {
      type: String,
      enum: ['morning', 'evening', 'both']
    },
    results: {
      morning: {
        type: String,
        enum: ['clean', 'questionable', 'not_clean']
      },
      evening: {
        type: String,
        enum: ['clean', 'questionable', 'not_clean']
      },
      _id: false
    },
    notes: { type: String, maxlength: 200 }
  }],

  // Notes
  notes: { type: String, maxlength: 500 },
  privateNotes: { type: String, maxlength: 500 },

  // Reminders tracking
  remindersSent: {
    hefsekTahara: { type: Boolean, default: false },
    shivaNekiyim: { type: Boolean, default: false },
    mikvah: { type: Boolean, default: false },
    vestOnot: {
      yomHachodesh: { type: Boolean, default: false },
      ohrHachodesh: { type: Boolean, default: false },
      haflagah: { type: Boolean, default: false },
      onahBeinonit: { type: Boolean, default: false },
      _id: false
    },
    _id: false
  },

  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  // Auto-expire after 2 years
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 2);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
cycleSchema.index({ userId: 1, niddahStartDate: -1 });
cycleSchema.index({ userId: 1, status: 1 });
cycleSchema.index({ userId: 1, 'vestOnot.onahBeinonit': 1 });

// PRE-SAVE HOOK: Update timestamp
// NOTE: Business logic has been moved to service layer for better separation of concerns
cycleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// PRE-VALIDATE HOOK: Ensure dates are logical
cycleSchema.pre('validate', function(next) {
  if (this.hefsekTaharaDate && this.niddahStartDate) {
    if (this.hefsekTaharaDate < this.niddahStartDate) {
      this.invalidate('hefsekTaharaDate',
        'Hefsek Tahara cannot be before Niddah start');
    }
  }

  if (this.shivaNekiyimStartDate && this.hefsekTaharaDate) {
    if (this.shivaNekiyimStartDate < this.hefsekTaharaDate) {
      this.invalidate('shivaNekiyimStartDate',
        'Shiva Nekiyim cannot start before Hefsek Tahara');
    }
  }

  if (this.mikvahDate && this.shivaNekiyimStartDate) {
    const daysDiff = Math.ceil(
      (this.mikvahDate - this.shivaNekiyimStartDate) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7) {
      this.invalidate('mikvahDate',
        'Mikvah must be at least 7 days after Shiva Nekiyim start');
    }
  }

  next();
});

// STATIC METHOD: Calculate cycle metrics (cycle length, haflagah)
// Pure calculation - no database queries
cycleSchema.statics.calculateCycleMetrics = function(niddahStartDate, mikvahDate, lastCycle) {
  const metrics = {
    cycleLength: null,
    haflagah: null
  };

  // Calculate cycle length
  if (mikvahDate) {
    metrics.cycleLength = Math.ceil(
      (mikvahDate - niddahStartDate) / (1000 * 60 * 60 * 24)
    );
  }

  // Calculate haflagah (interval from last cycle)
  if (lastCycle && lastCycle.niddahStartDate) {
    metrics.haflagah = Math.ceil(
      (niddahStartDate - lastCycle.niddahStartDate) / (1000 * 60 * 60 * 24)
    );
  }

  return metrics;
};

// STATIC METHOD: Determine niddah start onah and related info
// Pure calculation - no database queries
cycleSchema.statics.determineNiddahStartInfo = function(niddahStartDate, location) {
  const { getHebrewDateForTimestamp } = require('../utils/hebrewDateTime');

  const hebrewInfo = getHebrewDateForTimestamp(niddahStartDate, location);

  return {
    calculatedInTimezone: location.timezone,
    niddahStartSunset: hebrewInfo.sunset,
    niddahStartOnah: hebrewInfo.onah
  };
};

// METHOD: Calculate vest onot with timezone awareness
// Pure calculation - requires previousCycles to be passed in (no database queries)
cycleSchema.methods.calculateVestOnot = function(previousCycles, location) {
  const { HDate } = require('@hebcal/core');
  const { getVestInfo } = require('../utils/hebrewDateTime');

  // Get the matching onah from the niddah start
  const matchingOnah = this.niddahStartOnah;

  // 1. Ohr Hachodesh - 30 days from niddah start
  const ohrDate = new Date(this.niddahStartDate);
  ohrDate.setDate(ohrDate.getDate() + 30);
  this.vestOnot.ohrHachodesh = getVestInfo(ohrDate, location, matchingOnah);

  // 2. Yom Hachodesh - Same Hebrew date next month
  const startHDate = new HDate(this.niddahStartDate);
  const day = startHDate.getDate();
  const month = startHDate.getMonth();
  const year = startHDate.getFullYear();

  // Create new date with same day number, next Hebrew month
  const yomHachodeshshDate = new HDate(day, month + 1, year);
  const yomDate = yomHachodeshshDate.greg();
  this.vestOnot.yomHachodesh = getVestInfo(yomDate, location, matchingOnah);

  // 3. Haflagah - Based on interval from last cycle
  if (this.haflagah && previousCycles.length > 0) {
    const haflagahDate = new Date(this.niddahStartDate);
    haflagahDate.setDate(haflagahDate.getDate() + this.haflagah);
    this.vestOnot.haflagah = getVestInfo(haflagahDate, location, matchingOnah);
    this.vestOnot.haflagah.interval = this.haflagah;
  }

  // 4. Onah Beinonit - Average cycle length
  if (previousCycles.length >= 3) {
    const completedCycles = previousCycles.filter(c => c.cycleLength);
    if (completedCycles.length >= 3) {
      const sum = completedCycles.reduce((acc, c) => acc + c.cycleLength, 0);
      const average = Math.round(sum / completedCycles.length);

      const beinonitDate = new Date(this.niddahStartDate);
      beinonitDate.setDate(beinonitDate.getDate() + average);
      this.vestOnot.onahBeinonit = getVestInfo(beinonitDate, location, matchingOnah);
      this.vestOnot.onahBeinonit.calculatedFrom = completedCycles.length;
      this.vestOnot.onahBeinonit.averageLength = average;
    }
  }
};

// METHOD: Check if in shiva nekiyim period
cycleSchema.methods.isInShivaNekiyim = function() {
  if (!this.shivaNekiyimStartDate || this.status === 'completed') {
    return false;
  }

  const now = new Date();
  const sevenDaysLater = new Date(this.shivaNekiyimStartDate);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  return now >= this.shivaNekiyimStartDate && now <= sevenDaysLater;
};

module.exports = mongoose.model('Cycles', cycleSchema);
