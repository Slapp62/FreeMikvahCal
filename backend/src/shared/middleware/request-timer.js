/**
 * Request timing middleware
 * Adds start time to request object for duration calculation in logging
 * Also logs slow requests as performance warnings
 */
const { logPerformance } = require('../utils/log-helpers');

const SLOW_REQUEST_THRESHOLD = 1000; // 1 second

const requestTimer = (req, res, next) => {
  // Record start time
  req.startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override end to log request completion
  res.end = function (...args) {
    const duration = Date.now() - req.startTime;

    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      logPerformance('slow_request', duration, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userId: req.user?._id,
        correlationId: req.correlationId,
        userAgent: req.get('user-agent')
      });
    }

    // Call original end
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = requestTimer;
