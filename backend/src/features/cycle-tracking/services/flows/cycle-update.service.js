const Periods = require('../../models/period.model');
const Bedikahs = require('../../models/bedikah.model');
const Vestos = require('../../models/vestos.model');
const Profiles = require('../../../user-profile/models/profile.model');
const { throwError } = require('../../../../shared/utils/error-handlers');
const { normalizeCycle } = require('../../../../shared/utils/normalize-responses');
const { createDateInTimezone } = require('../../../../shared/utils/hebrew-datetime');
const { Location, Zmanim } = require('@hebcal/core');
const { logDatabase, logBusiness } = require('../../../../shared/utils/log-helpers');
const { calculateAllVestOnot } = require('../vest-calculator.service');
const { calculateCycleMetrics } = require('../cycle-metrics.service');

/**
 * Update period lifecycle dates and optionally recalculate vest data.
 */
const updateCycle = async (userId, cycleId, updateData) => {
  const period = await Periods.findOne({ _id: cycleId, userId });
  if (!period) throwError(404, 'Cycle not found');

  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }

  const timezone = profile.location.timezone;
  const hasCompleteLocation = profile.location.lat != null && profile.location.lng != null;
  const minimumNiddahDays = profile.halachicPreferences?.minimumNiddahDays || 5;
  let needsVestRecalculation = false;

  if (updateData.hefsekTaharaDate) {
    let timeString = updateData.hefsekTaharaDate.timeString;
    if (!timeString && hasCompleteLocation) {
      try {
        const hefsekDateOnly = new Date(`${updateData.hefsekTaharaDate.dateString}T12:00:00`);
        const loc = new Location(profile.location.lat, profile.location.lng, false, timezone);
        const sunset = new Zmanim(loc, hefsekDateOnly, false).sunset();
        timeString = sunset.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: timezone });
        logBusiness('hefsek_sunset_calculated', { userId, cycleId, date: updateData.hefsekTaharaDate.dateString, calculatedSunset: timeString });
      } catch (_) {
        throwError(400, 'Unable to calculate sunset for this date/location. Please enter an explicit Hefsek time.');
      }
    } else if (!timeString) {
      throwError(400, 'Time is required when location data is incomplete. Please enter Hefsek time.');
    }

    const proposedHefsekDate = createDateInTimezone(updateData.hefsekTaharaDate.dateString, timeString, timezone);
    const daysSincePeriod = Math.ceil((proposedHefsekDate - period.niddahOnah.start) / (1000 * 60 * 60 * 24));
    if (daysSincePeriod < minimumNiddahDays) {
      logBusiness('hefsek_early_warning', { userId, cycleId, daysSincePeriod, minimumNiddahDays, hefsekDate: proposedHefsekDate });
    }
    if (daysSincePeriod > 30) {
      logDatabase('warning', 'Periods', { userId, periodId: cycleId, message: `Hefsek set ${daysSincePeriod} days after period start` });
    }

    period.hefsekTaharaDate = proposedHefsekDate;
    const shivaNekiyimStart = new Date(period.hefsekTaharaDate);
    shivaNekiyimStart.setDate(shivaNekiyimStart.getDate() + 1);
    period.shivaNekiyimStartDate = shivaNekiyimStart;

    const mikvahDate = new Date(shivaNekiyimStart);
    mikvahDate.setDate(mikvahDate.getDate() + 6);
    period.mikvahDate = mikvahDate;
    period.status = 'shiva_nekiyim';
  }

  if (updateData.shivaNekiyimStartDate) {
    period.shivaNekiyimStartDate = createDateInTimezone(updateData.shivaNekiyimStartDate.dateString, updateData.shivaNekiyimStartDate.timeString, timezone);
  }

  if (updateData.mikvahDate) {
    period.mikvahDate = createDateInTimezone(updateData.mikvahDate.dateString, updateData.mikvahDate.timeString, timezone);
    needsVestRecalculation = true;
    period.cycleLength = calculateCycleMetrics(period, null).cycleLength;
  }

  if (updateData.status) period.status = updateData.status;
  if (updateData.notes !== undefined) period.notes = updateData.notes;
  if (updateData.privateNotes !== undefined) period.privateNotes = updateData.privateNotes;

  if (!period.niddahOnah || !period.niddahOnah.start || !period.niddahOnah.end) {
    throwError(400, 'Invalid period data: niddahOnah fields are required');
  }

  if (needsVestRecalculation && hasCompleteLocation) {
    const location = { lat: profile.location.lat, lng: profile.location.lng, timezone: profile.location.timezone };
    const previousPeriods = await Periods.find({ userId, _id: { $ne: period._id }, status: 'completed', 'niddahOnah.start': { $lt: period.niddahOnah.start } })
      .sort({ 'niddahOnah.start': -1 }).limit(3).select('niddahOnah cycleLength haflagah');
    const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, profile.halachicPreferences);
    await Vestos.findOneAndUpdate({ periodId: period._id }, { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras });
  }

  await period.save();
  logDatabase('update', 'Periods', { userId, periodId: cycleId, fields: Object.keys(updateData) });

  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });
  return normalizeCycle({ ...period.toObject(), vestOnot: vestos?.vestOnot, bedikot: bedikahs.map((b) => b.toObject()) });
};

/**
 * Add a bedikah and handle hefsek voiding side-effects.
 */
const addBedika = async (userId, cycleId, bedikaData) => {
  const period = await Periods.findOne({ _id: cycleId, userId });
  if (!period) throwError(404, 'Cycle not found');

  const profile = await Profiles.findById(userId).select('location');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = profile.location.timezone;

  const bedikahDate = createDateInTimezone(bedikaData.date.dateString, bedikaData.date.timeString, timezone);
  const bedikah = new Bedikahs({ periodId: period._id, userId, date: bedikahDate, dayNumber: bedikaData.dayNumber, timeOfDay: bedikaData.timeOfDay, results: bedikaData.results, notes: bedikaData.notes || '' });
  await bedikah.save();

  const hasNotCleanResult = bedikaData.results.morning === 'not_clean' || bedikaData.results.evening === 'not_clean';
  if (hasNotCleanResult && period.status !== 'completed') {
    period.periodVoidedInfo = {
      isVoided: true,
      originalNiddahOnah: { start: period.niddahOnah.start, end: period.niddahOnah.end },
      voidedHefsekTaharaDate: period.hefsekTaharaDate || null,
      voidedDate: new Date(),
      voidedByBedikaId: bedikah._id,
      notes: `Hefsek voided due to not clean bedikah result on Day ${bedikaData.dayNumber}`
    };
    period.status = 'niddah';
    period.hefsekTaharaDate = null;
    period.shivaNekiyimStartDate = null;
    period.mikvahDate = null;
    await period.save();

    logDatabase('update', 'Periods', { userId, periodId: cycleId, action: 'hefsek_voided', voidedByBedikaId: bedikah._id, reason: 'unclean_bedikah' });
  }

  logDatabase('create', 'Bedikahs', { userId, periodId: cycleId, bedikaId: bedikah._id, voided: hasNotCleanResult });
  return normalizeCycle(bedikah.toObject());
};

module.exports = { updateCycle, addBedika };
