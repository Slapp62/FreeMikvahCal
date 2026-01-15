const { nextError } = require('../utils/functionHandlers');

/**
 * Ensure user is authenticated
 */
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  nextError(next, 401, 'Authentication required');
};

/**
 * Check if user owns the resource
 */
const userOwnsResource = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (req.user._id.toString() === resourceUserId) {
    return next();
  }

  nextError(next, 403, 'Access denied');
};

module.exports = {
  authenticateUser,
  userOwnsResource
};
