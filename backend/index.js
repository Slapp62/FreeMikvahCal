require('dotenv').config();
const { validateEnv } = require('./src/shared/utils/validate-env');
const app = require('./app');
const { connectDB } = require('./src/shared/services/database.service');
const logger = require('./src/shared/config/logger');
const { scheduleCycleCleanup } = require('./src/shared/cron/cronJobs/cycleCleanup');
const mongoose = require('mongoose');

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

// Store server and cron job references for graceful shutdown
let server;
let cronJobs = [];

// Connect to database first
connectDB()
  .then(() => {
    // Start server after DB connection
    server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });

      // Start cron jobs
      const cycleCleanupJob = scheduleCycleCleanup();
      if (cycleCleanupJob) {
        cronJobs.push(cycleCleanupJob);
      }
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

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received: Starting graceful shutdown`, {
    signal,
    timestamp: new Date().toISOString()
  });

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Stop cron jobs
        if (cronJobs.length > 0) {
          cronJobs.forEach(job => {
            if (job && typeof job.stop === 'function') {
              job.stop();
            }
          });
          logger.info('Cron jobs stopped', { count: cronJobs.length });
        }

        // Close database connection
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed');

        logger.info('Graceful shutdown completed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', {
          type: 'error',
          error: error.message,
          stack: error.stack
        });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Forced shutdown: Graceful shutdown timeout exceeded', {
        timeout: 30000
      });
      process.exit(1);
    }, 30000);
  } else {
    logger.info('Server not started yet, exiting immediately');
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle nodemon restarts
process.once('SIGUSR2', async () => {
  await gracefulShutdown('SIGUSR2');
  process.kill(process.pid, 'SIGUSR2');
});
