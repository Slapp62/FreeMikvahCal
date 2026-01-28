const Joi = require('joi');

/**
 * Create cycle schema
 * Now accepts onah time range (start and end times)
 */
const createCycleSchema = Joi.object({
  // Onah time range (calculated on frontend using Hebcal)
  startTime: Joi.date()
    .iso()
    .required()
    .max('now')
    .messages({
      'date.base': 'Period start time must be a valid date',
      'date.max': 'Period start time cannot be in the future',
      'any.required': 'Period start time is required. Please select a date and onah type.'
    }),

  endTime: Joi.date()
    .iso()
    .required()
    .greater(Joi.ref('startTime'))
    .messages({
      'date.base': 'Period end time must be a valid date',
      'date.greater': 'Period end time must be after start time',
      'any.required': 'Period end time is required. This should be automatically calculated.'
    }),

  // Optional fields
  notes: Joi.string().max(500).allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  }),
  privateNotes: Joi.string().max(500).allow('').messages({
    'string.max': 'Private notes cannot exceed 500 characters'
  })
});

/**
 * Update cycle schema
 */
const updateCycleSchema = Joi.object({
  // Update dates
  hefsekTaharaDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
      'string.pattern.base': 'Hefsek Tahara date must be in YYYY-MM-DD format'
    }),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.pattern.base': 'Hefsek Tahara time must be in HH:MM format (24-hour)'
    })
  }),

  shivaNekiyimStartDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
      'string.pattern.base': 'Shiva Nekiyim start date must be in YYYY-MM-DD format'
    }),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.pattern.base': 'Shiva Nekiyim start time must be in HH:MM format (24-hour)'
    })
  }),

  mikvahDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
      'string.pattern.base': 'Mikvah date must be in YYYY-MM-DD format'
    }),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.pattern.base': 'Mikvah time must be in HH:MM format (24-hour)'
    })
  }),

  status: Joi.string().valid('niddah', 'shiva_nekiyim', 'completed').messages({
    'any.only': 'Status must be one of: niddah, shiva_nekiyim, or completed'
  }),
  notes: Joi.string().max(500).allow('').messages({
    'string.max': 'Notes cannot exceed 500 characters'
  }),
  privateNotes: Joi.string().max(500).allow('').messages({
    'string.max': 'Private notes cannot exceed 500 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
}); // At least one field must be updated

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
