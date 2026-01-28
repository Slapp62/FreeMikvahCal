const Joi = require('joi');

/**
 * Registration schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),

  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),

  // Location with timezone (CRITICAL)
  location: Joi.object({
    city: Joi.string().allow(''),
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
    timezone: Joi.string().required().messages({
      'any.required': 'Timezone is required for accurate calculations'
    }),
    geonameId: Joi.number()
  }).required(),

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

  ethnicity: Joi.string().valid('ashkenazi', 'sephardi', 'teimani', 'other', null),
  
  halachicPreferences: Joi.object({
    ohrZaruah: Joi.boolean().optional(),
    kreisiUpleisi: Joi.boolean().optional(),
    chasamSofer: Joi.boolean().optional(),
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

/**
 * Password reset schema
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
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
  resetPasswordSchema,
  changePasswordSchema
};
