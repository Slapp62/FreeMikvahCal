import Joi from 'joi';

/**
 * Login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
});

/**
 * Registration validation schema
 * Matches the RegisterValues form type
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Please confirm your password',
    }),
  halachicCustom: Joi.string()
    .valid('ashkenazi_EY', 'ashkenazi_CL', 'sephardi_ROY', 'sephard_RME', 'manual')
    .optional()
    .allow(null, ''),
  location: Joi.string()
    .optional()
    .allow(''),
  preferences: Joi.object({
    reminders: Joi.boolean().optional(),
  }).optional(),
  halachicPreferences: Joi.object({
    ohrZaruah: Joi.boolean().optional(),
    beinonit_24hr: Joi.boolean().optional(),
    beinonit_31: Joi.boolean().optional(),
    vesetHachodesh30thSkip29: Joi.boolean().optional(),
    haflagahDualMode: Joi.string().valid('latest_only', 'keep_both').optional(),
  }).optional(),
}).unknown(true);

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

export const verifyResetCodeSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'Code must be 6 digits',
      'string.pattern.base': 'Code must be 6 digits',
      'any.required': 'Code is required',
    }),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Please confirm your password',
    }),
});

export default {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
};
