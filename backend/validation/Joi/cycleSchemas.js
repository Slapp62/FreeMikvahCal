const Joi = require('joi');

/**
 * Create cycle schema
 * Now accepts onah time range (start and end times)
 */
const createCycleSchema = Joi.object({
  // Onah time range (calculated on frontend using Hebcal)
  startTime: Joi.date().iso().required().messages({
    'date.base': 'Start time must be a valid date',
    'any.required': 'Onah start time is required',
  }),

  endTime: Joi.date().iso().required().messages({
    'date.base': 'End time must be a valid date',
    'any.required': 'Onah end time is required',
  }),

  // Optional fields
  notes: Joi.string().max(500).allow(''),
  privateNotes: Joi.string().max(500).allow(''),
});

/**
 * Update cycle schema
 */
const updateCycleSchema = Joi.object({
  // Update dates
  hefsekTaharaDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),

  shivaNekiyimStartDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),

  mikvahDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),

  status: Joi.string().valid('niddah', 'shiva_nekiyim', 'completed'),
  notes: Joi.string().max(500).allow(''),
  privateNotes: Joi.string().max(500).allow(''),
}).min(1); // At least one field must be updated

/**
 * Add bedika schema
 */
const addBedikaSchema = Joi.object({
  date: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).required(),

  dayNumber: Joi.number().min(1).max(7).required().messages({
    'number.min': 'Day number must be between 1 and 7',
    'number.max': 'Day number must be between 1 and 7',
    'any.required': 'Day number is required (1-7 for shiva nekiyim)',
  }),

  timeOfDay: Joi.string().valid('morning', 'evening', 'both').required(),

  results: Joi.object({
    morning: Joi.string().valid('clean', 'questionable', 'not_clean'),
    evening: Joi.string().valid('clean', 'questionable', 'not_clean'),
  }).when('timeOfDay', {
    is: 'both',
    then: Joi.object({
      morning: Joi.required(),
      evening: Joi.required(),
    }),
  }),

  notes: Joi.string().max(200).allow(''),
});

module.exports = {
  createCycleSchema,
  updateCycleSchema,
  addBedikaSchema,
};
