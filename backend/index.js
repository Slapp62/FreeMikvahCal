require('dotenv').config();
const { validateEnv } = require('./utils/validateEnv');
const app = require('./app');
const { connectDB } = require('./database/dbService');
const logger = require('./config/logger');
const { scheduleCycleCleanup } = require('./cronJobs/cycleCleanup');
const { scheduleNotificationProcessing } = require('./cronJobs/notificationScheduler');

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to database first
connectDB()
  .then(() => {
    // Start server after DB connection
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

      // Start cron jobs
      scheduleCycleCleanup();
      scheduleNotificationProcessing();
    });
  })
  .catch((error) => {
    logger.error('Failed to start server', { error: error.message });
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message });
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});
