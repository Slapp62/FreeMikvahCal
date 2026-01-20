require('dotenv').config();
const { validateEnv } = require('./utils/validateEnv');
const app = require('./app');
const { connectDB } = require('./database/dbService');
const logger = require('./config/logger');
const { scheduleCycleCleanup } = require('./cronJobs/cycleCleanup');

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed', {
    type: 'error',
    error: error.message
  });
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to database first
connectDB()
  .then(() => {
    // Start server after DB connection
    app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });

      // Start cron jobs
      scheduleCycleCleanup();
      logger.info('Cron jobs initialized', { jobs: ['cycleCleanup'] });
    });
  })
  .catch((error) => {
    logger.error('Failed to start server', {
      type: 'error',
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', {
    type: 'error',
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});
