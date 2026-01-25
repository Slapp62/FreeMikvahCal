const Joi = require('joi');

/**
 * Update user profile schema
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phoneNumber: Joi.string().trim().allow(''),
  dateOfBirth: Joi.date(),

  location: Joi.object({
    city: Joi.string().allow(''),
    geonameId: Joi.number(),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    timezone: Joi.string()
  }),

  ethnicity: Joi.string().valid('ashkenazi', 'sephardi', 'teimani', 'other', null),

  halachicPreferences: Joi.object({
    ohrZaruah: Joi.boolean(),
    kreisiUpleisi: Joi.boolean(),
    chasamSofer: Joi.boolean(),
    minimumNiddahDays: Joi.number().min(4).max(10).messages({
      'number.min': 'Minimum niddah days must be at least 4',
      'number.max': 'Minimum niddah days cannot exceed 10',
      'number.base': 'Minimum niddah days must be a number'
    })
  })
}).min(1); // At least one field must be updated

/**
 * Update preferences schema
 */
const updatePreferencesSchema = Joi.object({
  hebrewCalendar: Joi.boolean(),
  defaultCycleLength: Joi.number().min(20).max(40),

  notifications: Joi.object({
    enabled: Joi.boolean(),
    hefsekTaharaReminder: Joi.boolean(),
    shivaNekiyimReminder: Joi.boolean(),
    mikvahReminder: Joi.boolean(),
    vestOnotReminder: Joi.boolean(),
    reminderTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).messages({
      'string.pattern.base': 'Reminder time must be in HH:MM format (24-hour)'
    })
  }),

  privacyMode: Joi.boolean(),
  language: Joi.string().valid('he', 'en'),

  dataRetention: Joi.object({
    keepCycles: Joi.number().min(12).max(48),
    autoDelete: Joi.boolean()
  })
}).min(1); // At least one field must be updated

module.exports = {
  updateUserSchema,
  updatePreferencesSchema
};
