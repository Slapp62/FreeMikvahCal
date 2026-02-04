const Periods = require('../../models/period.model');
const Vestos = require('../../models/vestos.model');
const Profiles = require('../../../user-profile/models/profile.model');
const { throwError } = require('../../../../shared/utils/error-handlers');
const { normalizeCycle } = require('../../../../shared/utils/normalize-responses');
const { createDateInTimezone, getOnahTimeRange } = require('../../../../shared/utils/hebrew-datetime');
const { logDatabase, logBusiness } = require('../../../../shared/utils/log-helpers');
const { calculateAllVestOnot } = require('../vest-calculator.service');
const { calculateCycleMetrics } = require('../cycle-metrics.service');
const { normalizeVestEntries } = require('../core/cycle-shared.service');

const removeSupersededHaflagahVestos = async (userId, currentPeriodId, newPeriodStart) => {
  const candidateVestos = await Vestos.find({
    userId,
    periodId: { $ne: currentPeriodId },
    $or: [
      { 'vestOnot.haflagah.start': { $gte: newPeriodStart } },
      { 'vestOnot.haflagah.0.start': { $gte: newPeriodStart } }
    ]
  });

  for (const vestos of candidateVestos) {
    const existingEntries = normalizeVestEntries(vestos.vestOnot?.haflagah);
    const filteredEntries = existingEntries.filter((entry) => entry?.start && new Date(entry.start).getTime() < newPeriodStart.getTime());
    if (filteredEntries.length !== existingEntries.length) {
      vestos.vestOnot.haflagah = filteredEntries;
      vestos.markModified('vestOnot.haflagah');
      await vestos.save();
    }
  }
};

/** Create a period and vest bundle while preserving timezone context. */
const createCycle = async (userId, cycleData) => {
  const { startTime, endTime, dateString, onah, notes, privateNotes } = cycleData;
  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile) throwError(404, 'User not found');
  if (!profile.location || !profile.location.timezone) throwError(400, 'Location not set. Please update your profile with city and timezone in Settings.');
  if (profile.location.lat == null || profile.location.lng == null) throwError(400, 'Complete location (latitude, longitude, timezone) required. Please update your profile in Settings.');

  const timezone = profile.location.timezone;
  const halachicPreferences = profile.halachicPreferences || { ohrZaruah: false, beinonit_24hr: false, beinonit_31: false, vesetHachodesh30thSkip29: false, haflagahDualMode: 'latest_only' };

  let niddahOnahStart;
  let niddahOnahEnd;
  if (dateString && onah) {
    const anchorDate = createDateInTimezone(dateString, '12:00', timezone);
    const onahRange = getOnahTimeRange(anchorDate, { lat: profile.location.lat, lng: profile.location.lng, timezone }, onah === 'day');
    niddahOnahStart = onahRange.start;
    niddahOnahEnd = onahRange.end;
  } else {
    niddahOnahStart = new Date(startTime);
    niddahOnahEnd = new Date(endTime);
  }

  const existingPeriod = await Periods.findOne({ userId, $or: [
    { 'niddahOnah.start': { $lte: niddahOnahStart }, 'niddahOnah.end': { $gte: niddahOnahStart } },
    { 'niddahOnah.start': { $lte: niddahOnahEnd }, 'niddahOnah.end': { $gte: niddahOnahEnd } },
    { 'niddahOnah.start': { $gte: niddahOnahStart }, 'niddahOnah.end': { $lte: niddahOnahEnd } }
  ] });
  if (existingPeriod) {
    const existingStart = new Date(existingPeriod.niddahOnah.start).toLocaleString('en-US', { timeZone: timezone, dateStyle: 'medium', timeStyle: 'short' });
    throwError(400, `A period already exists for this time. Existing period started at ${existingStart}. Please delete the existing period first if you want to replace it.`);
  }

  const previousPeriods = await Periods.find({ userId, status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] }, 'niddahOnah.start': { $lt: niddahOnahStart } })
    .sort({ 'niddahOnah.start': -1 }).limit(3).select('niddahOnah cycleLength haflagah');

  const metrics = calculateCycleMetrics({ niddahOnah: { start: niddahOnahStart }, mikvahDate: null }, previousPeriods[0] || null);
  const period = new Periods({ userId, niddahOnah: { start: niddahOnahStart, end: niddahOnahEnd }, status: 'niddah', notes: notes || '', privateNotes: privateNotes || '', calculatedInTimezone: timezone, calculatedAtLat: profile.location.lat, calculatedAtLng: profile.location.lng, haflagah: metrics.haflagah, cycleLength: metrics.cycleLength });
  await period.save();

  const location = { lat: profile.location.lat, lng: profile.location.lng, timezone: profile.location.timezone };
  const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, halachicPreferences);
  const vestos = new Vestos({ periodId: period._id, userId, vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras });
  await vestos.save();
  await removeSupersededHaflagahVestos(userId, period._id, period.niddahOnah.start);

  logDatabase('create', 'Periods', { userId, periodId: period._id });
  logBusiness('period_created', { userId, periodId: period._id, status: period.status, hasPreviousPeriods: previousPeriods.length > 0, haflagah: metrics.haflagah });
  return normalizeCycle({ ...period.toObject(), vestOnot: vestos.vestOnot });
};

module.exports = { createCycle, removeSupersededHaflagahVestos };
