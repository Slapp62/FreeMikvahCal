const cron = require('node-cron');
const Cycles = require('../models/Cycles');
const logger = require('../config/logger');
const { logDatabase, logError } = require('../utils/logHelpers');

const cleanupOldCycles = async () => {
  const startTime = Date.now();

  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    logger.info('Starting cycle cleanup job', {
      type: 'business',
      job: 'cycle_cleanup',
      cutoffDate: twoYearsAgo,
    });

    const result = await Cycles.deleteMany({
      createdAt: { $lt: twoYearsAgo },
      isDeleted: false,
    });

    const duration = Date.now() - startTime;

    logDatabase('delete_many', 'Cycles', {
      deletedCount: result.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy',
      duration,
    });

    logger.info('Cycle cleanup job completed', {
      type: 'business',
      job: 'cycle_cleanup',
      deletedCount: result.deletedCount,
      duration,
    });
  } catch (error) {
    logError(error, {
      operation: 'cycle_cleanup_cron',
      job: 'cycle_cleanup',
    });
  }
};

const scheduleCycleCleanup = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', cleanupOldCycles);

  logger.info('Cron job scheduled', {
    type: 'business',
    job: 'cycle_cleanup',
    schedule: '0 2 * * *',
    description: 'Daily at 2:00 AM',
  });
};

module.exports = { scheduleCycleCleanup };
