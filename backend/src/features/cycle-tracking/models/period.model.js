const mongoose = require('mongoose');
const { Schema } = mongoose;

const periodSchema = new Schema({
  // User Reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Profiles',
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

  // Period voided tracking
  periodVoidedInfo: {
    isVoided: { type: Boolean, default: false },
    originalNiddahOnah: {
      start: { type: Date },
      end: { type: Date },
      _id: false
    },
    voidedHefsekTaharaDate: { type: Date },
    voidedDate: { type: Date },
    voidedByBedikaId: { type: Schema.Types.ObjectId },
    notes: { type: String, maxlength: 200 },
    _id: false
  },

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
periodSchema.index({ userId: 1, 'niddahOnah.start': -1 });
periodSchema.index({ userId: 1, status: 1 });

// PRE-SAVE HOOK: Update timestamp and track status changes
// NOTE: Business logic will be moved to service layer for better separation of concerns
periodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Track previous status for validation
  if (!this.isNew && this.isModified('status')) {
    this.$locals.previousStatus = this.$locals.originalStatus;
  }

  next();
});

// POST-INIT HOOK: Store original status for comparison
periodSchema.post('init', function() {
  this.$locals.originalStatus = this.status;
});

// PRE-VALIDATE HOOK: Ensure dates are logical
periodSchema.pre('validate', function(next) {
  // Existing validation: Hefsek cannot be before Niddah start
  if (this.hefsekTaharaDate && this.niddahOnah && this.niddahOnah.start) {
    if (this.hefsekTaharaDate < this.niddahOnah.start) {
      this.invalidate('hefsekTaharaDate',
        'Hefsek Tahara cannot be before the period start date');
    }
  }

  // Existing validation: Shiva Nekiyim cannot start before Hefsek
  if (this.shivaNekiyimStartDate && this.hefsekTaharaDate) {
    if (this.shivaNekiyimStartDate < this.hefsekTaharaDate) {
      this.invalidate('shivaNekiyimStartDate',
        'Shiva Nekiyim cannot start before Hefsek Tahara');
    }
  }

  // Existing validation: Mikvah must be at least 7 days after Shiva Nekiyim start
  if (this.mikvahDate && this.shivaNekiyimStartDate) {
    const daysDiff = Math.ceil(
      (this.mikvahDate - this.shivaNekiyimStartDate) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7) {
      this.invalidate('mikvahDate',
        'Mikvah must be at least 7 days after Shiva Nekiyim start');
    }
  }

  // NEW VALIDATION: Status transitions must follow proper flow
  if (this.isModified('status')) {
    const wasNew = !this.isNew && this.$locals.previousStatus;
    const oldStatus = wasNew ? this.$locals.previousStatus : null;
    const newStatus = this.status;

    // Status can only transition in this order: niddah -> shiva_nekiyim -> completed
    if (oldStatus === 'completed' && newStatus !== 'completed') {
      this.invalidate('status',
        'Cannot change status after cycle is completed');
    }

    if (newStatus === 'shiva_nekiyim' && !this.hefsekTaharaDate) {
      this.invalidate('status',
        'Cannot change status to shiva_nekiyim without setting Hefsek Tahara date');
    }

    if (newStatus === 'completed' && !this.mikvahDate) {
      this.invalidate('status',
        'Cannot change status to completed without setting Mikvah date');
    }
  }

  next();
});

// STATIC METHOD: Calculate cycle metrics (cycle length, haflagah)
// Pure calculation - no database queries
periodSchema.statics.calculateCycleMetrics = function(niddahOnahStart, mikvahDate, lastCycle) {
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

// METHOD: Check if in shiva nekiyim period
periodSchema.methods.isInShivaNekiyim = function() {
  if (!this.shivaNekiyimStartDate || this.status === 'completed') {
    return false;
  }

  const now = new Date();
  const sevenDaysLater = new Date(this.shivaNekiyimStartDate);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  return now >= this.shivaNekiyimStartDate && now <= sevenDaysLater;
};

module.exports = mongoose.model('Periods', periodSchema);
