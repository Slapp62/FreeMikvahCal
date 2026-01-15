const mongoose = require('mongoose');

/**
 * Middleware to validate MongoDB ObjectId in route params
 * @param {String} paramName - The name of the param to validate (defaults to 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

module.exports = { validateObjectId };
