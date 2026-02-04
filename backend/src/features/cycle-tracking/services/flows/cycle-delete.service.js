const Periods = require('../../models/period.model');
const Bedikahs = require('../../models/bedikah.model');
const Vestos = require('../../models/vestos.model');
const Profiles = require('../../../user-profile/models/profile.model');
const { throwError } = require('../../../../shared/utils/error-handlers');
const { logDatabase, logBusiness } = require('../../../../shared/utils/log-helpers');
const { calculateAllVestOnot } = require('../vest-calculator.service');
const { calculateCycleMetrics } = require('../cycle-metrics.service');

/**
 * Delete a period and recalculate dependent future data.
 */
const deleteCycle = async (userId, cycleId) => {
  const period = await Periods.findOne({ _id: cycleId, userId });
  if (!period) throwError(404, 'Cycle not found');

  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile || !profile.location || !profile.location.timezone) throwError(400, 'User location not found');

  const location = { lat: profile.location.lat, lng: profile.location.lng, timezone: profile.location.timezone };
  const halachicPreferences = profile.halachicPreferences || { ohrZaruah: false, beinonit_24hr: false, beinonit_31: false, vesetHachodesh30thSkip29: false, haflagahDualMode: 'latest_only' };

  const deletedPeriodStartDate = period.niddahOnah.start;
  const futurePeriods = await Periods.find({ userId, 'niddahOnah.start': { $gt: deletedPeriodStartDate } }).sort({ 'niddahOnah.start': 1 });

  await Periods.deleteOne({ _id: cycleId, userId });
  await Bedikahs.deleteMany({ periodId: cycleId });
  await Vestos.deleteOne({ periodId: cycleId });

  logDatabase('delete', 'Periods', { userId, periodId: cycleId });
  logBusiness('period_deleted', { userId, periodId: cycleId, periodStartDate: deletedPeriodStartDate, futurePeriodsToRecalculate: futurePeriods.length });

  let recalculatedCount = 0;
  for (const futurePeriod of futurePeriods) {
    const previousPeriods = await Periods.find({ userId, status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] }, 'niddahOnah.start': { $lt: futurePeriod.niddahOnah.start } })
      .sort({ 'niddahOnah.start': -1 }).limit(3).select('niddahOnah cycleLength haflagah');

    futurePeriod.haflagah = calculateCycleMetrics(futurePeriod, previousPeriods[0] || null).haflagah;
    await futurePeriod.save();

    const vestOnotData = calculateAllVestOnot(futurePeriod, previousPeriods, location, halachicPreferences);
    await Vestos.findOneAndUpdate({ periodId: futurePeriod._id }, { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras });
    recalculatedCount++;
  }

  return { message: 'Cycle deleted successfully', recalculatedCycles: recalculatedCount };
};

module.exports = { deleteCycle };
