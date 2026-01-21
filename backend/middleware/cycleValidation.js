const {
  createCycleSchema,
  updateCycleSchema,
  addBedikaSchema,
} = require('../validation/Joi/cycleSchemas');

/**
 * Validate cycle creation
 */
const validateCreateCycle = (req, res, next) => {
  const { error } = createCycleSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validate cycle update
 */
const validateUpdateCycle = (req, res, next) => {
  const { error } = updateCycleSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validate bedika addition
 */
const validateAddBedika = (req, res, next) => {
  const { error } = addBedikaSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

module.exports = {
  validateCreateCycle,
  validateUpdateCycle,
  validateAddBedika,
};
