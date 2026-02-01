/**
 * Cycle Metrics Calculator Service
 *
 * Pure calculation functions for cycle measurements.
 * No database dependencies - easy to test and reuse.
 */

/**
 * Calculate cycle length (days from niddah start to mikvah)
 *
 * @param {Date} niddahOnahStart - Start of niddah onah
 * @param {Date} mikvahDate - Mikvah date
 * @returns {Number|null} Cycle length in days, or null if mikvah date not set
 */
function calculateCycleLength(niddahOnahStart, mikvahDate) {
  if (!mikvahDate) {
    return null;
  }

  return Math.ceil(
    (mikvahDate - niddahOnahStart) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calculate haflagah (interval from last cycle)
 *
 * @param {Date} niddahOnahStart - Current cycle start
 * @param {Date} lastCycleStart - Previous cycle start
 * @returns {Number|null} Haflagah in days, or null if no previous cycle
 */
function calculateHaflagah(niddahOnahStart, lastCycleStart) {
  if (!lastCycleStart) {
    return null;
  }

  return Math.ceil(
    (niddahOnahStart - lastCycleStart) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Calculate both cycle metrics from period and last period
 *
 * @param {Object} period - Current period with niddahOnah and mikvahDate
 * @param {Object} lastPeriod - Previous period (optional)
 * @returns {Object} { cycleLength, haflagah }
 */
function calculateCycleMetrics(period, lastPeriod = null) {
  const metrics = {
    cycleLength: null,
    haflagah: null
  };

  // Calculate cycle length
  if (period.mikvahDate) {
    metrics.cycleLength = calculateCycleLength(
      period.niddahOnah.start,
      period.mikvahDate
    );
  }

  // Calculate haflagah (interval from last cycle)
  if (lastPeriod && lastPeriod.niddahOnah && lastPeriod.niddahOnah.start) {
    metrics.haflagah = calculateHaflagah(
      period.niddahOnah.start,
      lastPeriod.niddahOnah.start
    );
  }

  return metrics;
}

module.exports = {
  calculateCycleLength,
  calculateHaflagah,
  calculateCycleMetrics
};
