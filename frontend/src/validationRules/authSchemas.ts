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
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Please confirm your password',
    }),
  ethnicity: Joi.string()
    .valid('ashkenazi', 'sephardi', 'teimani', 'other')
    .optional()
    .allow(null, ''),
  location: Joi.string()
    .optional()
    .allow(''),
  preferences: Joi.object({
    reminders: Joi.boolean().optional(),
  }).optional(),
  special_onahs: Joi.object({
    beinonit_30_31: Joi.boolean().optional(),
    onat_ohr_zarua: Joi.boolean().optional(),
  }).optional(),
}).unknown(true);

export default {
  loginSchema,
  registerSchema,
};
