const { updateUserSchema, updatePreferencesSchema } = require('./user-profile.schemas');

/**
 * Validate user profile update
 */
const validateUserUpdate = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

/**
 * Validate preferences update
 */
const validatePreferencesUpdate = (req, res, next) => {
  const { error } = updatePreferencesSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

module.exports = {
  validateUserUpdate,
  validatePreferencesUpdate
};
