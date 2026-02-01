const mongoose = require('mongoose');
const { Schema } = mongoose;

const vestosSchema = new Schema({
  // References
  periodId: {
    type: Schema.Types.ObjectId,
    ref: 'Periods',
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true,
    index: true
  },

  // Calculation Metadata
  calculatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },

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

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
vestosSchema.index({ userId: 1, calculatedAt: -1 });
vestosSchema.index({ userId: 1, 'vestOnot.onahBeinonit.start': 1 });

// Update timestamp on save
vestosSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// METHOD: Calculate vest onot with timezone awareness using time ranges
// Pure calculation - requires previousCycles to be passed in (no database queries)
// NOTE: This will be moved to service layer in future refactor
vestosSchema.methods.calculateVestOnot = function(period, previousCycles, location, halachicPreferences = {}) {
  const { HDate, Location, Zmanim } = require('@hebcal/core');
  const { getOnahTimeRange } = require('../../../shared/utils/hebrew-datetime');

  // Determine if original onah was day or night based on time range
  // Day onah: start and end on same Gregorian day (sunrise to sunset)
  // Night onah: spans two Gregorian days (sunset to next sunrise)
  const startDate = new Date(period.niddahOnah.start).toDateString();
  const endDate = new Date(period.niddahOnah.end).toDateString();
  const isDayOnah = startDate === endDate;

  // 1. Veset Hachodesh - Same Hebrew date next month
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const startHDate = Zmanim.makeSunsetAwareHDate(loc, period.niddahOnah.start, false);
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
  if (period.haflagah && previousCycles.length > 0) {
    const haflagahDate = new Date(period.niddahOnah.start);
    haflagahDate.setDate(haflagahDate.getDate() + period.haflagah);
    const haflagahRange = getOnahTimeRange(haflagahDate, location, isDayOnah);

    this.vestOnot.haflagah = {
      start: haflagahRange.start,
      end: haflagahRange.end,
      interval: period.haflagah,
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
  const beinonitDate = new Date(period.niddahOnah.start);
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
    const chasamSoferDate = new Date(period.niddahOnah.start);
    chasamSoferDate.setDate(chasamSoferDate.getDate() + 30);
    const chasamRange = getOnahTimeRange(chasamSoferDate, location, isDayOnah);
    this.vestOnot.onahBeinonit.chasamSofer = {
      start: chasamRange.start,
      end: chasamRange.end
    };
  }

  // Store which chumras were applied
  this.appliedChumras = {
    ohrZaruah: halachicPreferences.ohrZaruah || false,
    kreisiUpleisi: halachicPreferences.kreisiUpleisi || false,
    chasamSofer: halachicPreferences.chasamSofer || false
  };
};

module.exports = mongoose.model('Vestos', vestosSchema);
