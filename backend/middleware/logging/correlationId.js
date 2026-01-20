const { v4: uuidv4 } = require('uuid');

/**
 * Adds a unique correlation ID to each request for tracing
 * The ID is added to the request object and response headers
 */
const addCorrelationId = (req, res, next) => {
  // Use existing correlation ID from header if present, otherwise generate new one
  const correlationId = req.headers['x-correlation-id'] || uuidv4();

  // Attach to request object
  req.correlationId = correlationId;

  // Add to response headers for client tracking
  res.setHeader('X-Correlation-ID', correlationId);

  next();
};

module.exports = addCorrelationId;
