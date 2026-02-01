const mongoose = require('mongoose');
const { Schema } = mongoose;

const bedikahSchema = new Schema({
  // References
  periodId: {
    type: Schema.Types.ObjectId,
    ref: 'Periods',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true,
    index: true
  },

  // Bedikah Details
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
  notes: { type: String, maxlength: 200 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
bedikahSchema.index({ periodId: 1, date: 1 });
bedikahSchema.index({ userId: 1, date: -1 });

// Update timestamp on save
bedikahSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validation: Bedikah must be within shiva nekiyim period
// NOTE: This validation will be moved to service layer in future refactor
bedikahSchema.pre('validate', async function(next) {
  if (!this.isNew && !this.isModified('date') && !this.isModified('periodId')) {
    return next();
  }

  try {
    const Period = mongoose.model('Periods');
    const period = await Period.findById(this.periodId);

    if (!period) {
      return next(new Error('Associated period not found'));
    }

    if (period.shivaNekiyimStartDate && period.mikvahDate) {
      const shivaNekiyimEnd = new Date(period.mikvahDate);

      if (this.date < period.shivaNekiyimStartDate || this.date > shivaNekiyimEnd) {
        return next(new Error(
          `Bedikah date must be within the Shiva Nekiyim period (${period.shivaNekiyimStartDate.toLocaleDateString()} - ${shivaNekiyimEnd.toLocaleDateString()})`
        ));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Bedikahs', bedikahSchema);
