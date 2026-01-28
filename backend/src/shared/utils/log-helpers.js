const logger = require('../config/logger');

/**
 * Log authentication events
 */
const logAuth = (action, userId, metadata = {}) => {
  logger.info('Authentication event', {
    type: 'auth',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log database operations with optional timing
 */
const logDatabase = (operation, model, metadata = {}) => {
  logger.info('Database operation', {
    type: 'database',
    operation,
    model,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log security events (failed logins, rate limits, unauthorized access)
 */
const logSecurity = (eventType, metadata = {}) => {
  logger.warn('Security event', {
    type: 'security',
    eventType,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Enhanced error logging with classification
 */
const logError = (error, context = {}) => {
  logger.error('Application error', {
    type: 'error',
    message: error.message,
    stack: error.stack,
    errorType: error.constructor.name,
    statusCode: error.status || 500,
    isOperational: error.isOperational || false,
    timestamp: new Date().toISOString(),
    ...context
  });
};

/**
 * Log performance metrics for slow operations
 */
const logPerformance = (operation, duration, metadata = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level]('Performance metric', {
    type: 'performance',
    operation,
    duration,
    isSlow: duration > 1000,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log validation failures
 */
const logValidation = (validationType, errors, metadata = {}) => {
  logger.warn('Validation failed', {
    type: 'validation',
    validationType,
    errors,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log business logic events
 */
const logBusiness = (event, metadata = {}) => {
  logger.info('Business event', {
    type: 'business',
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Debug logging (only in development)
 */
const logDebug = (message, metadata = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(message, {
      type: 'debug',
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
};

module.exports = {
  logAuth,
  logDatabase,
  logSecurity,
  logError,
  logPerformance,
  logValidation,
  logBusiness,
  logDebug
};
