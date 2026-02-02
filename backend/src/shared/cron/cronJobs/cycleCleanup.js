const cron = require('node-cron');
const Periods = require('../../../features/cycle-tracking/models/period.model');
const Bedikahs = require('../../../features/cycle-tracking/models/bedikah.model');
const Vestos = require('../../../features/cycle-tracking/models/vestos.model');
const logger = require('../../config/logger');
const { logDatabase, logError } = require('../../utils/log-helpers');

const cleanupOldCycles = async () => {
  const startTime = Date.now();

  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    logger.info('Starting cycle cleanup job', {
      type: 'business',
      job: 'cycle_cleanup',
      cutoffDate: twoYearsAgo
    });

    // Delete old periods (Periods model has TTL index, but this provides explicit cleanup)
    const periodsResult = await Periods.deleteMany({
      createdAt: { $lt: twoYearsAgo }
    });

    // Delete associated bedikot for deleted periods
    const bedikaResult = await Bedikahs.deleteMany({
      createdAt: { $lt: twoYearsAgo }
    });

    // Delete associated vestos for deleted periods
    const vestosResult = await Vestos.deleteMany({
      createdAt: { $lt: twoYearsAgo }
    });

    const duration = Date.now() - startTime;

    logDatabase('delete_many', 'Periods', {
      deletedCount: periodsResult.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy',
      duration
    });

    logDatabase('delete_many', 'Bedikahs', {
      deletedCount: bedikaResult.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy'
    });

    logDatabase('delete_many', 'Vestos', {
      deletedCount: vestosResult.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy'
    });

    logger.info('Cycle cleanup job completed', {
      type: 'business',
      job: 'cycle_cleanup',
      deletedPeriods: periodsResult.deletedCount,
      deletedBedikahs: bedikaResult.deletedCount,
      deletedVestos: vestosResult.deletedCount,
      duration
    });
  } catch (error) {
    logError(error, {
      operation: 'cycle_cleanup_cron',
      job: 'cycle_cleanup'
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
    description: 'Daily at 2:00 AM'
  });
};

module.exports = { scheduleCycleCleanup };
