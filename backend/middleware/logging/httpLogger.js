const morgan = require('morgan');
const logger = require('../../config/logger');

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom token for correlation ID
morgan.token('correlation-id', (req) => {
  return req.correlationId || 'none';
});

// Create custom format with correlation ID
const format =
  ':method :url :status :res[content-length] - :response-time ms - user::user-id - correlation::correlation-id';

// Stream to Winston
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

const httpLogger = morgan(format, { stream });

module.exports = httpLogger;
