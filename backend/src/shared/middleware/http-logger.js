const logger = require('../config/logger');

/**
 * Enhanced HTTP request logger with color-coded console output
 * Logs all HTTP requests with method, URL, status, response time, and user context
 *
 * Note: Relies on request-timer middleware to set req.startTime
 */
const httpLogger = (req, res, next) => {
  // Capture the original end function
  const originalEnd = res.end;

  // Override end to log request completion
  res.end = function (...args) {
    // Calculate duration from startTime set by request-timer middleware
    const duration = req.startTime ? Date.now() - req.startTime : undefined;
    const userId = req.user ? req.user._id?.toString() : undefined;
    const correlationId = req.correlationId;

    // Construct readable message
    const message = `${req.method} ${req.originalUrl}`;

    // Log with structured metadata for better formatting
    logger.info(message, {
      type: 'http',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      contentLength: res.get('content-length'),
      duration,
      userId,
      correlationId,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });

    // Call original end
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = httpLogger;
