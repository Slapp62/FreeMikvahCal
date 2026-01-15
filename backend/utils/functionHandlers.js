/**
 * Throw error with status code (for services)
 */
const throwError = (statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;
  throw error;
};

/**
 * Pass error to next middleware (for controllers)
 */
const nextError = (next, statusCode, message) => {
  const error = new Error(message);
  error.status = statusCode;
  next(error);
};

/**
 * Handle error response (for global error handler)
 */
const handleError = (res, statusCode, message) => {
  res.status(statusCode).json({
    error: true,
    message: message || 'An error occurred'
  });
};

module.exports = {
  throwError,
  nextError,
  handleError
};
