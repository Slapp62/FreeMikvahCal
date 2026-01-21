const logger = require('../../config/logger');

const errorLogger = (error, req, res, next) => {
  logger.error('Request error', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
    body: req.body,
    params: req.params,
  });

  next(error);
};

module.exports = errorLogger;
