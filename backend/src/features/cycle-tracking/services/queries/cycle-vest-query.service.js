const Periods = require('../../models/period.model');
const Vestos = require('../../models/vestos.model');
const Profiles = require('../../../user-profile/models/profile.model');
const { throwError } = require('../../../../shared/utils/error-handlers');
const { logDatabase } = require('../../../../shared/utils/log-helpers');
const { calculateAllVestOnot } = require('../vest-calculator.service');

/**
 * Return upcoming vest windows in a date range, excluding superseded haflagah entries.
 */
const getUpcomingVestOnot = async (userId, daysAhead = 30) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  const allPeriods = await Periods.find({ userId }).select('_id niddahOnah.start').sort({ 'niddahOnah.start': 1 });
  const nextCycleStartById = new Map();
  for (let i = 0; i < allPeriods.length; i++) {
    const nextPeriod = allPeriods[i + 1];
    nextCycleStartById.set(String(allPeriods[i]._id), nextPeriod?.niddahOnah?.start ? new Date(nextPeriod.niddahOnah.start) : null);
  }

  const upcomingVestos = await Vestos.find({
    userId,
    $or: [
      { 'vestOnot.vesetHachodesh.0.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.vesetHachodesh.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.haflagah.0.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.haflagah.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.onahBeinonit.start': { $gte: new Date(), $lte: endDate } }
    ]
  }).populate('periodId');

  const upcomingVestOnotList = [];
  upcomingVestos.forEach((vestos) => {
    ['vesetHachodesh', 'haflagah', 'onahBeinonit'].forEach((type) => {
      const vestOnah = vestos.vestOnot[type];
      const entries = Array.isArray(vestOnah) ? vestOnah : vestOnah ? [vestOnah] : [];
      const periodId = String(vestos.periodId?._id || vestos.periodId);
      const nextCycleStart = nextCycleStartById.get(periodId);

      entries.forEach((entry) => {
        if (!entry?.start) return;
        const vestDate = new Date(entry.start);
        if (type === 'haflagah' && nextCycleStart && vestDate.getTime() >= nextCycleStart.getTime()) return;
        if (vestDate >= new Date() && vestDate <= endDate) {
          upcomingVestOnotList.push({ type, start: entry.start, end: entry.end, hebrewDate: entry.hebrewDate, periodId: vestos.periodId });
        }
      });
    });
  });

  upcomingVestOnotList.sort((a, b) => new Date(a.start) - new Date(b.start));
  return upcomingVestOnotList;
};

/**
 * Rebuild all vest documents after global halachic preference changes.
 */
const recalculateAllPeriodVestOnot = async (userId, newHalachicPreferences) => {
  const profile = await Profiles.findById(userId).select('location');
  if (!profile || !profile.location || !profile.location.timezone) throwError(400, 'User location not set. Please update your profile.');
  if (profile.location.lat == null || profile.location.lng == null) throwError(400, 'Complete location (latitude, longitude, timezone) required.');

  const location = { lat: profile.location.lat, lng: profile.location.lng, timezone: profile.location.timezone };
  const allPeriods = await Periods.find({ userId }).sort({ 'niddahOnah.start': 1 });

  let updatedCount = 0;
  for (let i = 0; i < allPeriods.length; i++) {
    const period = allPeriods[i];
    const previousPeriods = allPeriods.slice(0, i);
    const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, newHalachicPreferences);
    await Vestos.findOneAndUpdate({ periodId: period._id }, { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras });
    updatedCount++;
  }

  logDatabase('recalculate_vest_onot', 'Vestos', { userId, periodsUpdated: updatedCount });
  return updatedCount;
};

module.exports = {
  getUpcomingVestOnot,
  recalculateAllPeriodVestOnot
};
