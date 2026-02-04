const Joi = require('joi');

/**
 * Registration schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),

  // Optional during step-1 signup; required when completing profile
  location: Joi.object({
    city: Joi.string().allow(''),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    timezone: Joi.string().messages({
      'any.required': 'Timezone is required for accurate calculations'
    }),
    geonameId: Joi.number()
  }).optional(),

  // Consent (GDPR)
  consents: Joi.object({
    dataProcessing: Joi.object({
      granted: Joi.boolean().valid(true).required().messages({
        'any.only': 'You must consent to data processing to use this service'
      }),
      ipAddress: Joi.string(),
      userAgent: Joi.string()
    }).required()
  }).required(),

  halachicCustom: Joi.string().valid('ashkenazi_EY', 'ashkenazi_CL', 'sephardi_ROY', 'sephard_RME', 'manual', null),

  halachicPreferences: Joi.object({
    ohrZaruah: Joi.boolean().optional(),
    beinonit_24hr: Joi.boolean().optional(),
    beinonit_31: Joi.boolean().optional(),
    haflagahDualMode: Joi.string().valid('latest_only', 'keep_both').optional(),
    minimumNiddahDays: Joi.number().min(4).max(10).optional(),
  }).optional()
});

/**
 * Login schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Password reset request schema
 */
const resetPasswordRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const verifyResetCodeSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Code must be 6 digits',
      'string.pattern.base': 'Code must be 6 digits',
      'any.required': 'Code is required'
    })
});

/**
 * Password reset schema
 */
const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

/**
 * Change password schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'New password must be different from current password'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordRequestSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  changePasswordSchema
};
