const cron = require('node-cron');
const Cycles = require('../models/Cycles');
const { logDatabase } = require('../utils/logHelpers');

const cleanupOldCycles = async () => {
  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const result = await Cycles.deleteMany({
      createdAt: { $lt: twoYearsAgo },
      isDeleted: false
    });

    logDatabase('delete_many', 'Cycles', {
      deletedCount: result.deletedCount,
      olderThan: twoYearsAgo,
      reason: 'automatic_retention_policy'
    });

    console.log(`Cleaned up ${result.deletedCount} cycles older than 2 years`);
  } catch (error) {
    console.error('Error in cycle cleanup cron:', error);
  }
};

const scheduleCycleCleanup = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', cleanupOldCycles);
  console.log('Cycle cleanup cron job scheduled (2:00 AM daily)');
};

module.exports = { scheduleCycleCleanup };
