const Joi = require('joi');

/**
 * Create cycle schema
 */
const createCycleSchema = Joi.object({
  // Date and time from user (in their timezone)
  dateString: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Niddah start date is required'
    }),

  timeString: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format (24-hour)',
      'any.required': 'Niddah start time is required'
    }),

  // Optional: User can specify onah (otherwise calculated from sunset)
  onah: Joi.string().valid('day', 'night'),

  // Optional fields
  notes: Joi.string().max(500).allow(''),
  privateNotes: Joi.string().max(500).allow('')
});

/**
 * Update cycle schema
 */
const updateCycleSchema = Joi.object({
  // Update dates
  hefsekTaharaDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }),

  shivaNekiyimStartDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }),

  mikvahDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }),

  status: Joi.string().valid('niddah', 'shiva_nekiyim', 'completed'),
  notes: Joi.string().max(500).allow(''),
  privateNotes: Joi.string().max(500).allow('')
}).min(1); // At least one field must be updated

/**
 * Add bedika schema
 */
const addBedikaSchema = Joi.object({
  date: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }).required(),

  dayNumber: Joi.number().min(1).max(7).required().messages({
    'number.min': 'Day number must be between 1 and 7',
    'number.max': 'Day number must be between 1 and 7',
    'any.required': 'Day number is required (1-7 for shiva nekiyim)'
  }),

  timeOfDay: Joi.string().valid('morning', 'evening', 'both').required(),

  results: Joi.object({
    morning: Joi.string().valid('clean', 'questionable', 'not_clean'),
    evening: Joi.string().valid('clean', 'questionable', 'not_clean')
  }).when('timeOfDay', {
    is: 'both',
    then: Joi.object({
      morning: Joi.required(),
      evening: Joi.required()
    })
  }),

  notes: Joi.string().max(200).allow('')
});

module.exports = {
  createCycleSchema,
  updateCycleSchema,
  addBedikaSchema
};
