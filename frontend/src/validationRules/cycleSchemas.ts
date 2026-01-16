import Joi from 'joi';

/**
 * Create cycle validation schema
 */
export const createCycleSchema = Joi.object({
  dateString: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Niddah start date is required',
    }),
  timeString: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format (24-hour)',
      'any.required': 'Niddah start time is required',
    }),
  notes: Joi.string().max(500).allow('').optional(),
  privateNotes: Joi.string().max(500).allow('').optional(),
});

/**
 * Update cycle validation schema
 */
export const updateCycleSchema = Joi.object({
  hefsekTaharaDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).optional(),
  shivaNekiyimStartDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).optional(),
  mikvahDate: Joi.object({
    dateString: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    timeString: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).optional(),
  status: Joi.string().valid('niddah', 'shiva_nekiyim', 'completed').optional(),
  notes: Joi.string().max(500).allow('').optional(),
  privateNotes: Joi.string().max(500).allow('').optional(),
}).min(1);

export default {
  createCycleSchema,
  updateCycleSchema,
};
