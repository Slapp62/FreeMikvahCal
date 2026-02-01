const Periods = require('./models/period.model');
const Bedikahs = require('./models/bedikah.model');
const Vestos = require('./models/vestos.model');
const Profiles = require('../user-profile/models/profile.model');
const { throwError } = require('../../shared/utils/error-handlers');
const { normalizeCycle, normalizeCycles } = require('../../shared/utils/normalize-responses');
const { createDateInTimezone, getOnahTimeRange } = require('../../shared/utils/hebrew-datetime');
const { logDatabase, logBusiness } = require('../../shared/utils/log-helpers');
const { calculateAllVestOnot } = require('./services/vest-calculator.service');
const { calculateCycleMetrics } = require('./services/cycle-metrics.service');

/**
 * Create a new period with time range (timezone-aware)
 * Service orchestrates: fetches dependencies, calls vest calculator, constructs complete object
 * @param {String} userId - User ID
 * @param {Object} cycleData - { startTime, endTime, notes?, privateNotes? }
 * @returns {Object} - Created period with vestos
 */
const createCycle = async (userId, cycleData) => {
  const { startTime, endTime, notes, privateNotes } = cycleData;

  // STEP 1: Fetch profile and validate location
  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile) {
    throwError(404, 'User not found');
  }

  if (!profile.location || !profile.location.timezone) {
    throwError(400, 'Location not set. Please update your profile with city and timezone in Settings.');
  }

  const timezone = profile.location.timezone;

  // Extract user's halachic preferences (default to false if not set)
  const halachicPreferences = profile.halachicPreferences || {
    ohrZaruah: false,
    kreisiUpleisi: false,
    chasamSofer: false
  };

  // Check if user has complete location data (timezone, lat, lng)
  const hasCompleteLocation = profile.location.lat != null && profile.location.lng != null;

  if (!hasCompleteLocation) {
    throwError(400, 'Complete location (latitude, longitude, timezone) required. Please update your profile in Settings.');
  }

  // STEP 2: Convert time strings to Date objects
  const niddahOnahStart = new Date(startTime);
  const niddahOnahEnd = new Date(endTime);

  // STEP 2.5: Check for duplicate period (overlapping niddahOnah time range)
  const existingPeriod = await Periods.findOne({
    userId: userId,
    $or: [
      // Check if new period starts during existing period
      {
        'niddahOnah.start': { $lte: niddahOnahStart },
        'niddahOnah.end': { $gte: niddahOnahStart }
      },
      // Check if new period ends during existing period
      {
        'niddahOnah.start': { $lte: niddahOnahEnd },
        'niddahOnah.end': { $gte: niddahOnahEnd }
      },
      // Check if new period completely contains existing period
      {
        'niddahOnah.start': { $gte: niddahOnahStart },
        'niddahOnah.end': { $lte: niddahOnahEnd }
      }
    ]
  });

  if (existingPeriod) {
    const existingStart = new Date(existingPeriod.niddahOnah.start).toLocaleString('en-US', {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    throwError(400, `A period already exists for this time. Existing period started at ${existingStart}. Please delete the existing period first if you want to replace it.`);
  }

  // STEP 3: Fetch previous periods for calculations
  const previousPeriods = await Periods.find({
    userId: userId,
    status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] },
    'niddahOnah.start': { $lt: niddahOnahStart }
  })
    .sort({ 'niddahOnah.start': -1 })
    .limit(3)
    .select('niddahOnah cycleLength');

  // STEP 4: Calculate cycle metrics using service helper
  const lastPeriod = previousPeriods.length > 0 ? previousPeriods[0] : null;
  const metrics = calculateCycleMetrics(
    { niddahOnah: { start: niddahOnahStart }, mikvahDate: null },
    lastPeriod
  );

  // STEP 5: Create period object with time range
  const period = new Periods({
    userId,
    niddahOnah: {
      start: niddahOnahStart,
      end: niddahOnahEnd
    },
    status: 'niddah',
    notes: notes || '',
    privateNotes: privateNotes || '',
    calculatedInTimezone: timezone,
    // Optional metrics
    haflagah: metrics.haflagah,
    cycleLength: metrics.cycleLength
  });

  await period.save();

  // STEP 6: Calculate and create Vestos document
  const location = {
    lat: profile.location.lat,
    lng: profile.location.lng,
    timezone: profile.location.timezone
  };

  const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, halachicPreferences);

  const vestos = new Vestos({
    periodId: period._id,
    userId,
    vestOnot: vestOnotData.vestOnot,
    appliedChumras: vestOnotData.appliedChumras
  });

  await vestos.save();

  logDatabase('create', 'Periods', { userId, periodId: period._id });
  logBusiness('period_created', {
    userId,
    periodId: period._id,
    status: period.status,
    hasPreviousPeriods: previousPeriods.length > 0,
    haflagah: metrics.haflagah
  });

  // Return combined period + vestos data for backwards compatibility
  return normalizeCycle({ ...period.toObject(), vestOnot: vestos.vestOnot });
};

/**
 * Get all cycles for a user
 * @param {String} userId - User ID
 * @param {Object} options - { limit, skip, status }
 * @returns {Array} - Array of periods with vest onot
 */
const getUserCycles = async (userId, options = {}) => {
  const { limit = 50, skip = 0, status } = options;

  const query = {
    userId
  };

  if (status) {
    query.status = status;
  }

  const periods = await Periods.find(query)
    .sort({ 'niddahOnah.start': -1 })
    .limit(limit)
    .skip(skip);

  // Fetch vestos for each period
  const periodsWithVestos = await Promise.all(periods.map(async (period) => {
    const vestos = await Vestos.findOne({ periodId: period._id });
    const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

    return {
      ...period.toObject(),
      vestOnot: vestos?.vestOnot,
      bedikot: bedikahs.map(b => b.toObject())
    };
  }));

  return normalizeCycles(periodsWithVestos);
};

/**
 * Get a specific cycle
 * @param {String} userId - User ID
 * @param {String} cycleId - Period ID
 * @returns {Object} - Period with vestos and bedikot
 */
const getCycle = async (userId, cycleId) => {
  const period = await Periods.findOne({
    _id: cycleId,
    userId
  });

  if (!period) {
    throwError(404, 'Cycle not found');
  }

  // Fetch related data
  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

  return normalizeCycle({
    ...period.toObject(),
    vestOnot: vestos?.vestOnot,
    bedikot: bedikahs.map(b => b.toObject())
  });
};

/**
 * Update a cycle (timezone-aware for date updates)
 * Re-calculates vest onot when mikvahDate is updated
 * @param {String} userId - User ID
 * @param {String} cycleId - Period ID
 * @param {Object} updateData - Update data
 * @returns {Object} - Updated period
 */
const updateCycle = async (userId, cycleId, updateData) => {
  const period = await Periods.findOne({
    _id: cycleId,
    userId
  });

  if (!period) {
    throwError(404, 'Cycle not found');
  }

  // Get user's timezone and halachic preferences for date conversions and validation
  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = profile.location.timezone;
  const hasCompleteLocation = profile.location.lat != null && profile.location.lng != null;

  // Get user's minimum niddah days setting (default to 5 if not set)
  const minimumNiddahDays = profile.halachicPreferences?.minimumNiddahDays || 5;

  // Track if we need to recalculate vest onot
  let needsVestRecalculation = false;

  // Update dates (convert from user's timezone to UTC)
  if (updateData.hefsekTaharaDate) {
    const proposedHefsekDate = createDateInTimezone(
      updateData.hefsekTaharaDate.dateString,
      updateData.hefsekTaharaDate.timeString,
      timezone
    );

    // Validate minimum niddah days
    const daysSincePeriod = Math.ceil(
      (proposedHefsekDate - period.niddahOnah.start) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePeriod < minimumNiddahDays) {
      throwError(400, `Hefsek Tahara must be at least ${minimumNiddahDays} days after the period start. Currently ${daysSincePeriod} day${daysSincePeriod === 1 ? '' : 's'}. You can change this setting in your profile preferences.`);
    }

    // Warn if hefsek is unusually late (more than 30 days)
    if (daysSincePeriod > 30) {
      logDatabase('warning', 'Periods', {
        userId,
        periodId: cycleId,
        message: `Hefsek set ${daysSincePeriod} days after period start`
      });
    }

    period.hefsekTaharaDate = proposedHefsekDate;

    // Automatically create shiva nekiyim start (day after hefsek)
    const shivaNekiyimStart = new Date(period.hefsekTaharaDate);
    shivaNekiyimStart.setDate(shivaNekiyimStart.getDate() + 1);
    period.shivaNekiyimStartDate = shivaNekiyimStart;

    // Automatically create mikvah date 7 days after shiva nekiyim start
    const mikvahDate = new Date(shivaNekiyimStart);
    mikvahDate.setDate(mikvahDate.getDate() + 7);
    period.mikvahDate = mikvahDate;

    // Update status to shiva_nekiyim when hefsek is set
    period.status = 'shiva_nekiyim';
  }

  if (updateData.shivaNekiyimStartDate) {
    period.shivaNekiyimStartDate = createDateInTimezone(
      updateData.shivaNekiyimStartDate.dateString,
      updateData.shivaNekiyimStartDate.timeString,
      timezone
    );
  }

  if (updateData.mikvahDate) {
    period.mikvahDate = createDateInTimezone(
      updateData.mikvahDate.dateString,
      updateData.mikvahDate.timeString,
      timezone
    );
    needsVestRecalculation = true;

    // Recalculate cycle length
    const metrics = calculateCycleMetrics(period, null);
    period.cycleLength = metrics.cycleLength;
  }

  // Update status
  if (updateData.status) {
    period.status = updateData.status;
  }

  // Update notes
  if (updateData.notes !== undefined) {
    period.notes = updateData.notes;
  }

  if (updateData.privateNotes !== undefined) {
    period.privateNotes = updateData.privateNotes;
  }

  // Ensure niddahOnah is preserved (defensive check for required fields)
  if (!period.niddahOnah || !period.niddahOnah.start || !period.niddahOnah.end) {
    throwError(400, 'Invalid period data: niddahOnah fields are required');
  }

  // Recalculate vest onot if needed
  if (needsVestRecalculation && hasCompleteLocation) {
    const location = {
      lat: profile.location.lat,
      lng: profile.location.lng,
      timezone: profile.location.timezone
    };

    // Fetch previous periods again
    const previousPeriods = await Periods.find({
      userId: userId,
      _id: { $ne: period._id },
      status: 'completed',
      'niddahOnah.start': { $lt: period.niddahOnah.start }
    })
      .sort({ 'niddahOnah.start': -1 })
      .limit(3)
      .select('niddahOnah cycleLength');

    const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, profile.halachicPreferences);

    // Update existing Vestos document
    await Vestos.findOneAndUpdate(
      { periodId: period._id },
      { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras }
    );
  }

  await period.save();

  logDatabase('update', 'Periods', { userId, periodId: cycleId, fields: Object.keys(updateData) });

  // Fetch updated vestos and bedikot
  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

  return normalizeCycle({
    ...period.toObject(),
    vestOnot: vestos?.vestOnot,
    bedikot: bedikahs.map(b => b.toObject())
  });
};

/**
 * Delete a cycle (hard delete) and recalculate future periods
 * @param {String} userId - User ID
 * @param {String} cycleId - Period ID
 * @returns {Object} - Success message with recalculation count
 */
const deleteCycle = async (userId, cycleId) => {
  const period = await Periods.findOne({
    _id: cycleId,
    userId
  });

  if (!period) {
    throwError(404, 'Cycle not found');
  }

  // Get user location for recalculating vest onot
  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User location not found');
  }

  const location = {
    lat: profile.location.lat,
    lng: profile.location.lng,
    timezone: profile.location.timezone
  };

  const halachicPreferences = profile.halachicPreferences || {
    ohrZaruah: false,
    kreisiUpleisi: false,
    chasamSofer: false
  };

  const deletedPeriodStartDate = period.niddahOnah.start;

  // Find all future periods that need recalculation
  const futurePeriods = await Periods.find({
    userId,
    'niddahOnah.start': { $gt: deletedPeriodStartDate }
  }).sort({ 'niddahOnah.start': 1 });

  // Hard delete the period and related data
  await Periods.deleteOne({ _id: cycleId, userId });
  await Bedikahs.deleteMany({ periodId: cycleId });
  await Vestos.deleteOne({ periodId: cycleId });

  logDatabase('delete', 'Periods', { userId, periodId: cycleId });
  logBusiness('period_deleted', {
    userId,
    periodId: cycleId,
    periodStartDate: deletedPeriodStartDate,
    futurePeriodsToRecalculate: futurePeriods.length
  });

  // Recalculate haflagah and vest onot for each future period
  let recalculatedCount = 0;
  for (const futurePeriod of futurePeriods) {
    // Find the new previous periods for this future period (excluding the deleted one)
    const previousPeriods = await Periods.find({
      userId,
      status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] },
      'niddahOnah.start': { $lt: futurePeriod.niddahOnah.start }
    })
      .sort({ 'niddahOnah.start': -1 })
      .limit(3)
      .select('niddahOnah cycleLength');

    const lastPeriod = previousPeriods.length > 0 ? previousPeriods[0] : null;

    // Recalculate haflagah
    const metrics = calculateCycleMetrics(futurePeriod, lastPeriod);
    futurePeriod.haflagah = metrics.haflagah;

    await futurePeriod.save();

    // Recalculate vest onot
    const vestOnotData = calculateAllVestOnot(futurePeriod, previousPeriods, location, halachicPreferences);
    await Vestos.findOneAndUpdate(
      { periodId: futurePeriod._id },
      { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras }
    );

    recalculatedCount++;
  }

  return {
    message: 'Cycle deleted successfully',
    recalculatedCycles: recalculatedCount
  };
};

/**
 * Add a bedika to a period
 * @param {String} userId - User ID
 * @param {String} cycleId - Period ID
 * @param {Object} bedikaData - Bedika data
 * @returns {Object} - Created bedikah
 */
const addBedika = async (userId, cycleId, bedikaData) => {
  const period = await Periods.findOne({
    _id: cycleId,
    userId
  });

  if (!period) {
    throwError(404, 'Cycle not found');
  }

  // Get user's timezone
  const profile = await Profiles.findById(userId).select('location halachicPreferences');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = profile.location.timezone;

  // Convert bedika date to UTC
  const bedikaDate = createDateInTimezone(
    bedikaData.date.dateString,
    bedikaData.date.timeString,
    timezone
  );

  // Create Bedikah document (NOT embedded array)
  const bedikah = new Bedikahs({
    periodId: period._id,
    userId,
    date: bedikaDate,
    dayNumber: bedikaData.dayNumber,
    timeOfDay: bedikaData.timeOfDay,
    results: bedikaData.results,
    notes: bedikaData.notes || ''
  });

  await bedikah.save();

  // Check for not_clean results and void period if needed
  const hasNotCleanResult =
    (bedikaData.results.morning === 'not_clean') ||
    (bedikaData.results.evening === 'not_clean');

  if (hasNotCleanResult && period.status !== 'completed') {
    const location = profile.location;
    const halachicPreferences = profile.halachicPreferences || {};

    // Determine if original onah was day or night
    const startDate = new Date(period.niddahOnah.start).toDateString();
    const endDate = new Date(period.niddahOnah.end).toDateString();
    const isDayOnah = startDate === endDate;

    // Store original period start and hefsek for reference
    period.periodVoidedInfo = {
      isVoided: true,
      originalNiddahOnah: {
        start: period.niddahOnah.start,
        end: period.niddahOnah.end
      },
      voidedHefsekTaharaDate: period.hefsekTaharaDate || null,
      voidedDate: new Date(),
      voidedByBedikaId: bedikah._id,
      notes: `Period voided due to not clean bedikah result on Day ${bedikaData.dayNumber}`
    };

    // Get onah time range for the new period (bedikah date, same day/night as original)
    const newOnahRange = getOnahTimeRange(bedikaDate, location, isDayOnah);

    // REPLACE niddahOnah with new period start
    period.niddahOnah.start = newOnahRange.start;
    period.niddahOnah.end = newOnahRange.end;

    // Revert status to 'niddah'
    period.status = 'niddah';

    // Clear Shiva Nekiyim progress and hefsek
    period.shivaNekiyimStartDate = null;
    period.mikvahDate = null;
    period.hefsekTaharaDate = null;

    // Get previous periods for vest onot calculation
    const previousPeriods = await Periods.find({
      userId,
      'niddahOnah.start': { $lt: period.periodVoidedInfo.originalNiddahOnah.start }
    }).sort({ 'niddahOnah.start': -1 }).limit(3);

    // Recalculate haflagah based on new period start
    const metrics = calculateCycleMetrics(period, previousPeriods[0]);
    period.haflagah = metrics.haflagah;

    await period.save();

    // Recalculate THIS period's vest onot
    const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, halachicPreferences);
    await Vestos.findOneAndUpdate(
      { periodId: period._id },
      { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras }
    );

    // Recalculate vest onot for any FUTURE periods
    const futurePeriods = await Periods.find({
      userId,
      'niddahOnah.start': { $gt: period.periodVoidedInfo.originalNiddahOnah.start },
      _id: { $ne: period._id }
    }).sort({ 'niddahOnah.start': 1 });

    for (const futurePeriod of futurePeriods) {
      const prevPeriods = await Periods.find({
        userId,
        'niddahOnah.start': { $lt: futurePeriod.niddahOnah.start }
      }).sort({ 'niddahOnah.start': -1 }).limit(3);

      const futureVestOnotData = calculateAllVestOnot(futurePeriod, prevPeriods, location, halachicPreferences);
      await Vestos.findOneAndUpdate(
        { periodId: futurePeriod._id },
        { vestOnot: futureVestOnotData.vestOnot, appliedChumras: futureVestOnotData.appliedChumras }
      );
    }

    logDatabase('update', 'Periods', {
      userId,
      periodId: cycleId,
      action: 'period_voided',
      voidedByBedikaId: bedikah._id
    });
  }

  logDatabase('create', 'Bedikahs', {
    userId,
    periodId: cycleId,
    bedikaId: bedikah._id,
    voided: hasNotCleanResult
  });

  return normalizeCycle(bedikah.toObject());
};

/**
 * Get current active cycle
 * @param {String} userId - User ID
 * @returns {Object|null} - Active period or null
 */
const getActiveCycle = async (userId) => {
  const period = await Periods.findOne({
    userId,
    status: { $in: ['niddah', 'shiva_nekiyim'] }
  }).sort({ 'niddahOnah.start': -1 });

  if (!period) {
    return null;
  }

  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

  return normalizeCycle({
    ...period.toObject(),
    vestOnot: vestos?.vestOnot,
    bedikot: bedikahs.map(b => b.toObject())
  });
};

/**
 * Get vest onot for upcoming dates
 * @param {String} userId - User ID
 * @param {Number} daysAhead - Number of days to look ahead (default 30)
 * @returns {Array} - Array of upcoming vest onot
 */
const getUpcomingVestOnot = async (userId, daysAhead = 30) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  // Get upcoming vestos
  const upcomingVestos = await Vestos.find({
    userId,
    $or: [
      { 'vestOnot.vesetHachodesh.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.haflagah.start': { $gte: new Date(), $lte: endDate } },
      { 'vestOnot.onahBeinonit.start': { $gte: new Date(), $lte: endDate } }
    ]
  }).populate('periodId');

  const upcomingVestOnotList = [];

  upcomingVestos.forEach(vestos => {
    // Check each vest type
    ['vesetHachodesh', 'haflagah', 'onahBeinonit'].forEach(type => {
      const vestOnah = vestos.vestOnot[type];
      if (vestOnah && vestOnah.start) {
        const vestDate = new Date(vestOnah.start);
        if (vestDate >= new Date() && vestDate <= endDate) {
          upcomingVestOnotList.push({
            type,
            start: vestOnah.start,
            end: vestOnah.end,
            hebrewDate: vestOnah.hebrewDate,
            periodId: vestos.periodId
          });
        }
      }
    });
  });

  // Sort by date
  upcomingVestOnotList.sort((a, b) => new Date(a.start) - new Date(b.start));

  return upcomingVestOnotList;
};

/**
 * Recalculate vest onot for all periods when halachic preferences change
 * @param {String} userId - User ID
 * @param {Object} newHalachicPreferences - New halachic preferences
 * @returns {Number} - Number of periods updated
 */
const recalculateAllPeriodVestOnot = async (userId, newHalachicPreferences) => {
  // Get user's location for calculations
  const profile = await Profiles.findById(userId).select('location');
  if (!profile || !profile.location || !profile.location.timezone) {
    throwError(400, 'User location not set. Please update your profile.');
  }

  const hasCompleteLocation = profile.location.lat != null && profile.location.lng != null;
  if (!hasCompleteLocation) {
    throwError(400, 'Complete location (latitude, longitude, timezone) required.');
  }

  const location = {
    lat: profile.location.lat,
    lng: profile.location.lng,
    timezone: profile.location.timezone
  };

  // Get all periods for the user (sorted chronologically)
  const allPeriods = await Periods.find({ userId }).sort({ 'niddahOnah.start': 1 });

  let updatedCount = 0;

  // Update each period's vest onot
  for (let i = 0; i < allPeriods.length; i++) {
    const period = allPeriods[i];

    // Get previous periods for this period
    const previousPeriods = allPeriods.slice(0, i);

    // Recalculate vest onot with new preferences
    const vestOnotData = calculateAllVestOnot(period, previousPeriods, location, newHalachicPreferences);

    // Update Vestos document
    await Vestos.findOneAndUpdate(
      { periodId: period._id },
      { vestOnot: vestOnotData.vestOnot, appliedChumras: vestOnotData.appliedChumras }
    );

    updatedCount++;
  }

  logDatabase('recalculate_vest_onot', 'Vestos', { userId, periodsUpdated: updatedCount });

  return updatedCount;
};

/**
 * Get calendar events for user's cycles
 * Converts periods into pre-formatted calendar events
 * @param {String} userId - User ID
 * @param {Object} options - { limit, skip, status }
 * @returns {Array} - Array of calendar events
 */
const getCalendarEvents = async (userId, options = {}) => {
  // Reuse getUserCycles to get periods with same filtering
  const cycles = await getUserCycles(userId, options);

  const events = [];

  cycles.forEach((cycle) => {
    // 1. Period Start Event (Niddah Start) - with time range
    if (cycle.niddahOnah && cycle.niddahOnah.start) {
      const isVoided = cycle.periodVoidedInfo?.isVoided || false;

      if (!isVoided) {
        events.push({
          id: `${cycle._id}-niddah`,
          title: `🩸 Period Start`,
          start: cycle.niddahOnah.start,
          end: cycle.niddahOnah.end,
          className: `niddah-start`,
          groupID: cycle._id,
        });
      }

      // Voided Period Start Event
      if (isVoided && cycle.periodVoidedInfo.originalNiddahOnah?.start) {
        events.push({
          id: `${cycle._id}-voided-period`,
          title: '🩸 Voided Period Start',
          start: cycle.periodVoidedInfo.originalNiddahOnah.start,
          end: cycle.periodVoidedInfo.originalNiddahOnah.end,
          className: 'niddah-start voided-original',
          groupID: cycle._id,
        });
      }
    }

    // 2. Hefsek Tahara Event
    if (cycle.hefsekTaharaDate) {
      events.push({
        id: `${cycle._id}-hefsek`,
        title: '✅ Hefsek Tahara',
        start: cycle.hefsekTaharaDate,
        className: 'hefsek-tahara',
        groupID: cycle._id,
      });
    }

    // Voided Hefsek Event
    if (cycle.periodVoidedInfo?.isVoided && cycle.periodVoidedInfo.voidedHefsekTaharaDate) {
      events.push({
        id: `${cycle._id}-voided-hefsek`,
        title: '✅ Voided Hefsek',
        start: cycle.periodVoidedInfo.voidedHefsekTaharaDate,
        className: 'hefsek-tahara voided',
        groupID: cycle._id,
      });
    }

    // 3. Shiva Nekiyim Start Event
    if (cycle.shivaNekiyimStartDate) {
      events.push({
        id: `${cycle._id}-shiva`,
        title: '7️⃣ Shiva Nekiyim Start',
        start: cycle.shivaNekiyimStartDate,
        className: 'shiva-nekiyim',
        groupID: cycle._id,
      });
    }

    // 4. Mikvah Date Event
    if (cycle.mikvahDate) {
      events.push({
        id: `${cycle._id}-mikvah`,
        title: '🛁 Mikvah',
        start: cycle.mikvahDate,
        className: 'mikvah',
        groupID: cycle._id,
      });
    }

    // 5. Bedikah Events
    if (cycle.bedikot && cycle.bedikot.length > 0) {
      const isVoided = cycle.periodVoidedInfo?.isVoided || false;
      const voidedByBedikaId = cycle.periodVoidedInfo?.voidedByBedikaId;

      cycle.bedikot.forEach((bedikah, index) => {
        const timeOfDay = bedikah.timeOfDay;
        const isUncleanBedikah = isVoided && bedikah._id && bedikah._id.equals(voidedByBedikaId);

        const createMorning = timeOfDay === 'morning' || timeOfDay === 'both';
        const createEvening = timeOfDay === 'evening' || timeOfDay === 'both';

        if (createMorning) {
          const result = bedikah.results?.morning || 'clean';
          let title = `🔍 Morning Bedikah (Day ${bedikah.dayNumber})`;
          let className = `bedikah bedikah-${result}`;

          if (isUncleanBedikah && result === 'not_clean') {
            title = `🩸 New Period Start (Unclean Bedikah)`;
            className = 'niddah-start bedikah-not_clean';
          } else if (isVoided && !isUncleanBedikah) {
            title = `🔍 Voided Morning Bedikah (Day ${bedikah.dayNumber})`;
          }

          events.push({
            id: `${cycle._id}-bedikah-${index}-morning`,
            title: title,
            start: bedikah.date,
            end: bedikah.date,
            className: className,
            groupID: cycle._id,
          });
        }

        if (createEvening) {
          const result = bedikah.results?.evening || 'clean';
          let title = `🔍 Evening Bedikah (Day ${bedikah.dayNumber})`;
          let className = `bedikah bedikah-${result}`;

          if (isUncleanBedikah && result === 'not_clean') {
            title = `🩸 New Period Start (Unclean Bedikah)`;
            className = 'niddah-start bedikah-not_clean';
          } else if (isVoided && !isUncleanBedikah) {
            title = `🔍 Voided Evening Bedikah (Day ${bedikah.dayNumber})`;
          }

          events.push({
            id: `${cycle._id}-bedikah-${index}-evening`,
            title: title,
            start: bedikah.date,
            end: bedikah.date,
            className: className,
            groupID: cycle._id,
          });
        }
      });
    }

    // 6. Vest Onot Events - with time ranges
    if (cycle.vestOnot) {
      if (cycle.vestOnot.vesetHachodesh?.start) {
        events.push({
          id: `${cycle._id}-veset`,
          title: `📅 Veset HaChodesh`,
          start: cycle.vestOnot.vesetHachodesh.start,
          end: cycle.vestOnot.vesetHachodesh.end,
          className: `vest-onah veset-hachodesh`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.haflagah?.start) {
        events.push({
          id: `${cycle._id}-haflagah`,
          title: `⏱️ Haflagah`,
          start: cycle.vestOnot.haflagah.start,
          end: cycle.vestOnot.haflagah.end,
          className: `vest-onah haflagah`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.onahBeinonit?.start) {
        events.push({
          id: `${cycle._id}-beinonit`,
          title: `🔄 Onah Beinonit`,
          start: cycle.vestOnot.onahBeinonit.start,
          end: cycle.vestOnot.onahBeinonit.end,
          className: `vest-onah onah-beinonit`,
          groupID: cycle._id,
        });

        if (cycle.vestOnot.onahBeinonit.kreisiUpleisi?.start) {
          events.push({
            id: `${cycle._id}-beinonit-kreisi`,
            title: `🔄 Kreisi U'Pleisi`,
            start: cycle.vestOnot.onahBeinonit.kreisiUpleisi.start,
            end: cycle.vestOnot.onahBeinonit.kreisiUpleisi.end,
            className: `vest-onah onah-beinonit-kreisi`,
            groupID: cycle._id,
          });
        }

        if (cycle.vestOnot.onahBeinonit.chasamSofer?.start) {
          events.push({
            id: `${cycle._id}-beinonit-sofer`,
            title: `🔄 Beinonit 31`,
            start: cycle.vestOnot.onahBeinonit.chasamSofer.start,
            end: cycle.vestOnot.onahBeinonit.chasamSofer.end,
            className: `vest-onah onah-beinonit-sofer`,
            groupID: cycle._id,
          });
        }
      }

      // Ohr Zaruah events
      if (cycle.vestOnot.vesetHachodesh?.ohrZaruah?.start) {
        events.push({
          id: `${cycle._id}-veset-ohr`,
          title: `Ohr Zaruah - Veset HaChodesh`,
          start: cycle.vestOnot.vesetHachodesh.ohrZaruah.start,
          end: cycle.vestOnot.vesetHachodesh.ohrZaruah.end,
          className: `vest-onah ohr-zaruah`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.haflagah?.ohrZaruah?.start) {
        events.push({
          id: `${cycle._id}-haflagah-ohr`,
          title: `Ohr Zaruah - Haflagah`,
          start: cycle.vestOnot.haflagah.ohrZaruah.start,
          end: cycle.vestOnot.haflagah.ohrZaruah.end,
          className: `vest-onah ohr-zaruah`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.onahBeinonit?.ohrZaruah?.start) {
        events.push({
          id: `${cycle._id}-beinonit-ohr`,
          title: `Ohr Zaruah - Onah Beinonit`,
          start: cycle.vestOnot.onahBeinonit.ohrZaruah.start,
          end: cycle.vestOnot.onahBeinonit.ohrZaruah.end,
          className: `vest-onah ohr-zaruah`,
          groupID: cycle._id,
        });
      }
    }
  });

  return events;
};

module.exports = {
  createCycle,
  getUserCycles,
  getCycle,
  updateCycle,
  deleteCycle,
  addBedika,
  getActiveCycle,
  getUpcomingVestOnot,
  getCalendarEvents,
  recalculateAllPeriodVestOnot
};
