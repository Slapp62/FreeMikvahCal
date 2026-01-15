const logger = require('../config/logger');

const logAuth = (action, userId, metadata = {}) => {
  logger.info('Authentication event', {
    type: 'auth',
    action,
    userId,
    ...metadata
  });
};

const logDatabase = (operation, model, metadata = {}) => {
  logger.info('Database operation', {
    type: 'database',
    operation,
    model,
    ...metadata
  });
};

const logSecurity = (eventType, metadata = {}) => {
  logger.warn('Security event', {
    type: 'security',
    eventType,
    ...metadata
  });
};

const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

module.exports = {
  logAuth,
  logDatabase,
  logSecurity,
  logError
};
