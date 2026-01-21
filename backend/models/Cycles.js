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
  hefsekTaharaDate: { type: Date },
  shivaNekiyimStartDate: { type: Date },
  mikvahDate: { type: Date },

  // Niddah Start Onah - Time range representing the actual onah period
  niddahOnah: {
    start: { type: Date, required: true },  // Sunrise (day) or Sunset (night)
    end: { type: Date, required: true },    // Sunset (day) or Sunrise (night)
    _id: false
  },

  // Timezone info (CRITICAL for calculations)
  calculatedInTimezone: {
    type: String,
    required: true  // IANA timezone name at time of creation
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

  // Vest Onot - Time ranges for each vest calculation
  vestOnot: {
    vesetHachodesh: {
      start: Date,
      end: Date,
      ohrZaruah: {
        start: Date,
        end: Date,
        _id: false
      },
      hebrewDate: String,
      dayOfWeek: Number,
      _id: false
    },
    haflagah: {
      start: Date,
      end: Date,
      ohrZaruah: {
        start: Date,
        end: Date,
        _id: false
      },
      interval: Number,
      hebrewDate: String,
      dayOfWeek: Number,
      _id: false
    },
    onahBeinonit: {
      start: Date,
      end: Date,
      ohrZaruah: {
        start: Date,
        end: Date,
        _id: false
      },
      kreisiUpleisi: {
        start: Date,
        end: Date,
        _id: false
      },
      chasamSofer: {
        start: Date,
        end: Date,
        _id: false
      },
      calculatedFrom: Number,
      averageLength: Number,
      hebrewDate: String,
      dayOfWeek: Number,
      _id: false
    },
    _id: false
  },

  // Applied Chumras (Halachic Stringencies)
  appliedChumras: {
    ohrZaruah: { type: Boolean, default: false },
    kreisiUpleisi: { type: Boolean, default: false },
    chasamSofer: { type: Boolean, default: false },
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
      vesetHachodesh: { type: Boolean, default: false },
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
cycleSchema.index({ userId: 1, 'niddahOnah.start': -1 });
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
  if (this.hefsekTaharaDate && this.niddahOnah && this.niddahOnah.start) {
    if (this.hefsekTaharaDate < this.niddahOnah.start) {
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
cycleSchema.statics.calculateCycleMetrics = function(niddahOnahStart, mikvahDate, lastCycle) {
  const metrics = {
    cycleLength: null,
    haflagah: null
  };

  // Calculate cycle length
  if (mikvahDate) {
    metrics.cycleLength = Math.ceil(
      (mikvahDate - niddahOnahStart) / (1000 * 60 * 60 * 24)
    );
  }

  // Calculate haflagah (interval from last cycle)
  if (lastCycle && lastCycle.niddahOnah && lastCycle.niddahOnah.start) {
    metrics.haflagah = Math.ceil(
      (niddahOnahStart - lastCycle.niddahOnah.start) / (1000 * 60 * 60 * 24)
    );
  }

  return metrics;
};

// METHOD: Calculate vest onot with timezone awareness using time ranges
// Pure calculation - requires previousCycles to be passed in (no database queries)
cycleSchema.methods.calculateVestOnot = function(previousCycles, location, halachicPreferences = {}) {
  const { HDate, Location, Zmanim } = require('@hebcal/core');
  const { getOnahTimeRange } = require('../utils/hebrewDateTime');

  // Determine if original onah was day or night based on time range
  // Day onah: start and end on same Gregorian day (sunrise to sunset)
  // Night onah: spans two Gregorian days (sunset to next sunrise)
  const startDate = new Date(this.niddahOnah.start).toDateString();
  const endDate = new Date(this.niddahOnah.end).toDateString();
  const isDayOnah = startDate === endDate;

  // 1. Veset Hachodesh - Same Hebrew date next month
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const startHDate = Zmanim.makeSunsetAwareHDate(loc, this.niddahOnah.start, false);
  const day = startHDate.getDate();
  const month = startHDate.getMonth();
  const year = startHDate.getFullYear();

  // Create new date with same day number, next Hebrew month
  const vesetHachodeshshDate = new HDate(day, month + 1, year);
  const vesetDate = vesetHachodeshshDate.greg();
  const vesetRange = getOnahTimeRange(vesetDate, location, isDayOnah);

  this.vestOnot.vesetHachodesh = {
    start: vesetRange.start,
    end: vesetRange.end,
    hebrewDate: vesetRange.hebrewDate,
    dayOfWeek: vesetRange.dayOfWeek
  };

  // Ohr Zaruah for Veset HaChodesh (preceding onah)
  if (halachicPreferences.ohrZaruah) {
    if (isDayOnah) {
      // If original was day, Ohr Zaruah is night before
      const nightBefore = new Date(vesetDate);
      nightBefore.setDate(nightBefore.getDate() - 1);
      const ozRange = getOnahTimeRange(nightBefore, location, false);
      this.vestOnot.vesetHachodesh.ohrZaruah = {
        start: ozRange.start,
        end: ozRange.end
      };
    } else {
      // If original was night, Ohr Zaruah is day before (same Gregorian date)
      const ozRange = getOnahTimeRange(vesetDate, location, true);
      this.vestOnot.vesetHachodesh.ohrZaruah = {
        start: ozRange.start,
        end: ozRange.end
      };
    }
  }

  // 2. Haflagah - Based on interval from last cycle
  if (this.haflagah && previousCycles.length > 0) {
    const haflagahDate = new Date(this.niddahOnah.start);
    haflagahDate.setDate(haflagahDate.getDate() + this.haflagah);
    const haflagahRange = getOnahTimeRange(haflagahDate, location, isDayOnah);

    this.vestOnot.haflagah = {
      start: haflagahRange.start,
      end: haflagahRange.end,
      interval: this.haflagah,
      hebrewDate: haflagahRange.hebrewDate,
      dayOfWeek: haflagahRange.dayOfWeek
    };

    // Ohr Zaruah for Haflagah (preceding onah)
    if (halachicPreferences.ohrZaruah) {
      if (isDayOnah) {
        const nightBefore = new Date(haflagahDate);
        nightBefore.setDate(nightBefore.getDate() - 1);
        const ozRange = getOnahTimeRange(nightBefore, location, false);
        this.vestOnot.haflagah.ohrZaruah = {
          start: ozRange.start,
          end: ozRange.end
        };
      } else {
        const ozRange = getOnahTimeRange(haflagahDate, location, true);
        this.vestOnot.haflagah.ohrZaruah = {
          start: ozRange.start,
          end: ozRange.end
        };
      }
    }
  }

  // 3. Onah Beinonit - Fixed 29-day calculation
  const beinonitDate = new Date(this.niddahOnah.start);
  beinonitDate.setDate(beinonitDate.getDate() + 29);
  const beinonitRange = getOnahTimeRange(beinonitDate, location, isDayOnah);

  this.vestOnot.onahBeinonit = {
    start: beinonitRange.start,
    end: beinonitRange.end,
    calculatedFrom: 29,
    hebrewDate: beinonitRange.hebrewDate,
    dayOfWeek: beinonitRange.dayOfWeek
  };

  // Kreisi Upleisi - Opposite onah same Hebrew day
  if (halachicPreferences.kreisiUpleisi) {
    const kreisiRange = getOnahTimeRange(beinonitDate, location, !isDayOnah);
    this.vestOnot.onahBeinonit.kreisiUpleisi = {
      start: kreisiRange.start,
      end: kreisiRange.end
    };
  }

  // Ohr Zaruah for Onah Beinonit (preceding onah)
  if (halachicPreferences.ohrZaruah) {
    if (isDayOnah) {
      const nightBefore = new Date(beinonitDate);
      nightBefore.setDate(nightBefore.getDate() - 1);
      const ozRange = getOnahTimeRange(nightBefore, location, false);
      this.vestOnot.onahBeinonit.ohrZaruah = {
        start: ozRange.start,
        end: ozRange.end
      };
    } else {
      const ozRange = getOnahTimeRange(beinonitDate, location, true);
      this.vestOnot.onahBeinonit.ohrZaruah = {
        start: ozRange.start,
        end: ozRange.end
      };
    }
  }

  // Chasam Sofer - Day 30 with matching onah
  if (halachicPreferences.chasamSofer) {
    const chasamSoferDate = new Date(this.niddahOnah.start);
    chasamSoferDate.setDate(chasamSoferDate.getDate() + 30);
    const chasamRange = getOnahTimeRange(chasamSoferDate, location, isDayOnah);
    this.vestOnot.onahBeinonit.chasamSofer = {
      start: chasamRange.start,
      end: chasamRange.end
    };
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
