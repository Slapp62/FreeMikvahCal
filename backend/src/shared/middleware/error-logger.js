const logger = require('../config/logger');

/**
 * Error logging middleware
 * Captures comprehensive error context including request details, user info, and timing
 */
const errorLogger = (error, req, res, next) => {
  // Calculate request duration if available
  const duration = req.startTime ? Date.now() - req.startTime : undefined;

  logger.error('Request error', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,

    // Request details
    url: req.originalUrl,
    method: req.method,
    correlationId: req.correlationId,

    // User context
    userId: req.user?._id,
    userAgent: req.get('user-agent'),
    ip: req.ip,

    // Request data (sanitized in production)
    body: process.env.NODE_ENV === 'production' ? '[REDACTED]' : req.body,
    params: req.params,
    query: req.query,

    // Performance metrics
    duration,

    // Error type classification
    isOperational: error.isOperational !== false, // Assume operational unless explicitly set
    type: 'error'
  });

  next(error);
};

module.exports = errorLogger;
