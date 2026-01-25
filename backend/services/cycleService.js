const Cycles = require('../models/Cycles');
const Users = require('../models/Users');
const { throwError } = require('../utils/functionHandlers');
const { normalizeCycle, normalizeCycles } = require('../utils/normalizeResponses');
const { createDateInTimezone } = require('../utils/hebrewDateTime');
const { logDatabase } = require('../utils/logHelpers');

/**
 * Create a new cycle with time range (timezone-aware)
 * Service orchestrates: fetches dependencies, calls model methods, constructs complete object
 * @param {String} userId - User ID
 * @param {Object} cycleData - { startTime, endTime, notes?, privateNotes? }
 * @returns {Object} - Created cycle
 */
const createCycle = async (userId, cycleData) => {
  const { startTime, endTime, notes, privateNotes } = cycleData;

  // STEP 1: Fetch user and validate location
  const user = await Users.findById(userId).select('location halachicPreferences');
  if (!user) {
    throwError(404, 'User not found');
  }

  if (!user.location || !user.location.timezone) {
    throwError(400, 'Location not set. Please update your profile with city and timezone in Settings.');
  }

  const timezone = user.location.timezone;

  // Extract user's halachic preferences (default to false if not set)
  const halachicPreferences = user.halachicPreferences || {
    ohrZaruah: false,
    kreisiUpleisi: false,
    chasamSofer: false
  };

  // Check if user has complete location data (timezone, lat, lng)
  const hasCompleteLocation = user.location.lat != null && user.location.lng != null;

  if (!hasCompleteLocation) {
    throwError(400, 'Complete location (latitude, longitude, timezone) required. Please update your profile in Settings.');
  }

  // STEP 2: Convert time strings to Date objects
  const niddahOnahStart = new Date(startTime);
  const niddahOnahEnd = new Date(endTime);

  // STEP 2.5: Check for duplicate period (overlapping niddahOnah time range)
  const existingCycle = await Cycles.findOne({
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

  if (existingCycle) {
    const existingStart = new Date(existingCycle.niddahOnah.start).toLocaleString('en-US', {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    throwError(400, `A period already exists for this time. Existing period started at ${existingStart}. Please delete the existing period first if you want to replace it.`);
  }

  // STEP 3: Fetch previous cycles for calculations
  const previousCycles = await Cycles.find({
    userId: userId,
    status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] },
    'niddahOnah.start': { $lt: niddahOnahStart }
  })
    .sort({ 'niddahOnah.start': -1 })
    .limit(3)
    .select('niddahOnah cycleLength');

  // STEP 4: Calculate cycle metrics
  const lastCycle = previousCycles.length > 0 ? previousCycles[0] : null;
  const metrics = Cycles.calculateCycleMetrics(
    niddahOnahStart,
    null, // mikvahDate not set yet
    lastCycle
  );

  // STEP 5: Create cycle object with time range
  const cycle = new Cycles({
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
    cycleLength: metrics.cycleLength,
    // Halachic preferences applied to this cycle
    appliedChumras: halachicPreferences
  });

  // STEP 6: Calculate vest onot
  const location = {
    lat: user.location.lat,
    lng: user.location.lng,
    timezone: user.location.timezone
  };
  cycle.calculateVestOnot(previousCycles, location, halachicPreferences);

  // STEP 7: Save (validation only, no business logic in hook)
  await cycle.save();

  logDatabase('create', 'Cycles', { userId, cycleId: cycle._id });

  return normalizeCycle(cycle);
};

/**
 * Get all cycles for a user
 * @param {String} userId - User ID
 * @param {Object} options - { limit, skip, status }
 * @returns {Array} - Array of cycles
 */
const getUserCycles = async (userId, options = {}) => {
  const { limit = 50, skip = 0, status } = options;

  const query = {
    userId
  };

  if (status) {
    query.status = status;
  }

  const cycles = await Cycles.find(query)
    .sort({ 'niddahOnah.start': -1 })
    .limit(limit)
    .skip(skip);

  return normalizeCycles(cycles);
};

/**
 * Get a specific cycle
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @returns {Object} - Cycle
 */
const getCycle = async (userId, cycleId) => {
  const cycle = await Cycles.findOne({
    _id: cycleId,
    userId
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  return normalizeCycle(cycle);
};

/**
 * Update a cycle (timezone-aware for date updates)
 * Re-calculates vest onot when mikvahDate is updated
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @param {Object} updateData - Update data
 * @returns {Object} - Updated cycle
 */
const updateCycle = async (userId, cycleId, updateData) => {
  const cycle = await Cycles.findOne({
    _id: cycleId,
    userId
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  // Get user's timezone and halachic preferences for date conversions and validation
  const user = await Users.findById(userId).select('location halachicPreferences');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = user.location.timezone;
  const hasCompleteLocation = user.location.lat != null && user.location.lng != null;

  // Get user's minimum niddah days setting (default to 5 if not set)
  const minimumNiddahDays = user.halachicPreferences?.minimumNiddahDays || 5;

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
      (proposedHefsekDate - cycle.niddahOnah.start) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePeriod < minimumNiddahDays) {
      throwError(400, `Hefsek Tahara must be at least ${minimumNiddahDays} days after the period start. Currently ${daysSincePeriod} day${daysSincePeriod === 1 ? '' : 's'}. You can change this setting in your profile preferences.`);
    }

    // Warn if hefsek is unusually late (more than 30 days)
    if (daysSincePeriod > 30) {
      // Note: This is just logged, not blocked - user may have valid reasons
      logDatabase('warning', 'Cycles', {
        userId,
        cycleId,
        message: `Hefsek set ${daysSincePeriod} days after period start`
      });
    }

    cycle.hefsekTaharaDate = proposedHefsekDate;

    // Automatically create mikvah date 7 days after hefsek tahara
    const mikvahDate = new Date(cycle.hefsekTaharaDate);
    mikvahDate.setDate(mikvahDate.getDate() + 7);
    cycle.mikvahDate = mikvahDate;

    // Update status to shiva_nekiyim when hefsek is set
    cycle.status = 'shiva_nekiyim';
  }

  if (updateData.shivaNekiyimStartDate) {
    cycle.shivaNekiyimStartDate = createDateInTimezone(
      updateData.shivaNekiyimStartDate.dateString,
      updateData.shivaNekiyimStartDate.timeString,
      timezone
    );
  }

  if (updateData.mikvahDate) {
    cycle.mikvahDate = createDateInTimezone(
      updateData.mikvahDate.dateString,
      updateData.mikvahDate.timeString,
      timezone
    );
    needsVestRecalculation = true;

    // Recalculate cycle length
    const metrics = Cycles.calculateCycleMetrics(
      cycle.niddahStartDate,
      cycle.mikvahDate,
      null
    );
    cycle.cycleLength = metrics.cycleLength;
  }

  // Update status
  if (updateData.status) {
    cycle.status = updateData.status;
  }

  // Update notes
  if (updateData.notes !== undefined) {
    cycle.notes = updateData.notes;
  }

  if (updateData.privateNotes !== undefined) {
    cycle.privateNotes = updateData.privateNotes;
  }

  // Ensure niddahOnah is preserved (defensive check for required fields)
  // This should already exist from when cycle was loaded from DB, but explicit check prevents validation errors
  if (!cycle.niddahOnah || !cycle.niddahOnah.start || !cycle.niddahOnah.end) {
    throwError(400, 'Invalid cycle data: niddahOnah fields are required');
  }

  // Recalculate vest onot if needed
  if (needsVestRecalculation && hasCompleteLocation) {
    const location = {
      lat: user.location.lat,
      lng: user.location.lng,
      timezone: user.location.timezone
    };

    // Fetch previous cycles again
    const previousCycles = await Cycles.find({
      userId: userId,
      _id: { $ne: cycle._id },
      status: 'completed',
      niddahStartDate: { $lt: cycle.niddahStartDate }
    })
      .sort({ niddahStartDate: -1 })
      .limit(3)
      .select('niddahStartDate cycleLength');

    cycle.calculateVestOnot(previousCycles, location);
  }

  await cycle.save();

  logDatabase('update', 'Cycles', { userId, cycleId, fields: Object.keys(updateData) });

  return normalizeCycle(cycle);
};

/**
 * Delete a cycle (hard delete) and recalculate future cycles
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @returns {Object} - Success message with recalculation count
 */
const deleteCycle = async (userId, cycleId) => {
  const cycle = await Cycles.findOne({
    _id: cycleId,
    userId
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  // Get user location for recalculating vest onot
  const user = await Users.findById(userId).select('location halachicPreferences');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User location not found');
  }

  const location = {
    lat: user.location.lat,
    lng: user.location.lng,
    timezone: user.location.timezone
  };

  const halachicPreferences = user.halachicPreferences || {
    ohrZaruah: false,
    kreisiUpleisi: false,
    chasamSofer: false
  };

  const deletedCycleStartDate = cycle.niddahOnah.start;

  // Find all future cycles that need recalculation
  const futureCycles = await Cycles.find({
    userId,
    'niddahOnah.start': { $gt: deletedCycleStartDate }
  }).sort({ 'niddahOnah.start': 1 });

  // Hard delete the cycle
  await Cycles.deleteOne({ _id: cycleId, userId });

  logDatabase('delete', 'Cycles', { userId, cycleId });

  // Recalculate haflagah and vest onot for each future cycle
  let recalculatedCount = 0;
  for (const futureCycle of futureCycles) {
    // Find the new previous cycle for this future cycle (excluding the deleted one)
    const previousCycles = await Cycles.find({
      userId,
      status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] },
      'niddahOnah.start': { $lt: futureCycle.niddahOnah.start }
    })
      .sort({ 'niddahOnah.start': -1 })
      .limit(3)
      .select('niddahOnah cycleLength');

    const lastCycle = previousCycles.length > 0 ? previousCycles[0] : null;

    // Recalculate haflagah
    if (lastCycle && lastCycle.niddahOnah && lastCycle.niddahOnah.start) {
      futureCycle.haflagah = Math.ceil(
        (futureCycle.niddahOnah.start - lastCycle.niddahOnah.start) / (1000 * 60 * 60 * 24)
      );
    } else {
      futureCycle.haflagah = null;
    }

    // Recalculate vest onot
    futureCycle.calculateVestOnot(previousCycles, location, halachicPreferences);

    await futureCycle.save();
    recalculatedCount++;
  }

  return {
    message: 'Cycle deleted successfully',
    recalculatedCycles: recalculatedCount
  };
};

/**
 * Add a bedika to a cycle
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @param {Object} bedikaData - Bedika data
 * @returns {Object} - Updated cycle
 */
const addBedika = async (userId, cycleId, bedikaData) => {
  const cycle = await Cycles.findOne({
    _id: cycleId,
    userId
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  // Get user's timezone
  const user = await Users.findById(userId).select('location');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = user.location.timezone;

  // Convert bedika date to UTC
  const bedikaDate = createDateInTimezone(
    bedikaData.date.dateString,
    bedikaData.date.timeString,
    timezone
  );

  // Add bedika
  cycle.bedikot.push({
    date: bedikaDate,
    dayNumber: bedikaData.dayNumber,
    timeOfDay: bedikaData.timeOfDay,
    results: bedikaData.results,
    notes: bedikaData.notes || ''
  });

  // Check for not_clean results and void period if needed
  const hasNotCleanResult =
    (bedikaData.results.morning === 'not_clean') ||
    (bedikaData.results.evening === 'not_clean');

  if (hasNotCleanResult) {
    // Get the bedikah ID that was just added
    const justAddedBedika = cycle.bedikot[cycle.bedikot.length - 1];

    // Get user's location and halachic preferences
    const user = await Users.findById(userId);
    if (!user) {
      throwError(400, 'User not found');
    }

    const location = user.location || null;
    const halachicPreferences = user.halachicPreferences || {};
    const { getOnahTimeRange } = require('../utils/hebrewDateTime');

    // Determine if original onah was day or night
    const startDate = new Date(cycle.niddahOnah.start).toDateString();
    const endDate = new Date(cycle.niddahOnah.end).toDateString();
    const isDayOnah = startDate === endDate;

    // Store original period start and hefsek for reference
    cycle.periodVoidedInfo = {
      isVoided: true,
      originalNiddahOnah: {
        start: cycle.niddahOnah.start,
        end: cycle.niddahOnah.end
      },
      voidedHefsekTaharaDate: cycle.hefsekTaharaDate || null,
      voidedDate: new Date(),
      voidedByBedikaId: justAddedBedika._id,
      notes: `Period voided due to not clean bedikah result on Day ${bedikaData.dayNumber}`
    };

    // Get onah time range for the new period (bedikah date, same day/night as original)
    const newOnahRange = getOnahTimeRange(bedikaDate, location, isDayOnah);

    // REPLACE niddahOnah with new period start
    cycle.niddahOnah.start = newOnahRange.start;
    cycle.niddahOnah.end = newOnahRange.end;

    // Revert status to 'niddah'
    cycle.status = 'niddah';

    // Clear Shiva Nekiyim progress and hefsek
    cycle.shivaNekiyimStartDate = null;
    cycle.mikvahDate = null;
    cycle.hefsekTaharaDate = null;  // Clear hefsek - user will need new hefsek from new period date

    // Get previous cycles for vest onot calculation (now including voided ones)
    const previousCycles = await Cycles.find({
      userId,
      'niddahOnah.start': { $lt: cycle.periodVoidedInfo.originalNiddahOnah.start }
    }).sort({ 'niddahOnah.start': -1 });

    // Recalculate haflagah based on new period start
    if (previousCycles.length > 0) {
      const lastCycle = previousCycles[0];
      cycle.haflagah = Math.ceil(
        (newOnahRange.start - lastCycle.niddahOnah.start) / (1000 * 60 * 60 * 24)
      );
    }

    // Recalculate THIS cycle's vest onot
    cycle.calculateVestOnot(previousCycles, location, halachicPreferences);

    // Recalculate vest onot for any FUTURE cycles that depend on previous cycle history
    const futureCycles = await Cycles.find({
      userId,
      'niddahOnah.start': { $gt: cycle.periodVoidedInfo.originalNiddahOnah.start }
    }).sort({ 'niddahOnah.start': 1 });

    // Recalculate vest onot for each future cycle
    for (const futureCycle of futureCycles) {
      // Skip the current cycle (already calculated above)
      if (futureCycle._id.equals(cycle._id)) {
        continue;
      }

      // Get previous cycles for this future cycle
      const prevCycles = await Cycles.find({
        userId,
        'niddahOnah.start': { $lt: futureCycle.niddahOnah.start }
      }).sort({ 'niddahOnah.start': -1 });

      futureCycle.calculateVestOnot(prevCycles, location, halachicPreferences);
      await futureCycle.save();
    }
  }

  await cycle.save();

  logDatabase('update', 'Cycles', {
    userId,
    cycleId,
    action: 'add_bedika',
    voided: hasNotCleanResult
  });

  return normalizeCycle(cycle);
};

/**
 * Get current active cycle
 * @param {String} userId - User ID
 * @returns {Object|null} - Active cycle or null
 */
const getActiveCycle = async (userId) => {
  const cycle = await Cycles.findOne({
    userId,
    status: { $in: ['niddah', 'shiva_nekiyim'] }
  }).sort({ niddahStartDate: -1 });

  return cycle ? normalizeCycle(cycle) : null;
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

  // Get recent cycles with vest onot
  const cycles = await Cycles.find({
    userId,
    status: 'completed'
  })
    .sort({ niddahStartDate: -1 })
    .limit(3);

  const upcomingVestOnot = [];

  cycles.forEach(cycle => {
    if (cycle.vestOnot) {
      // Check each vest onah
      ['vesetHachodesh', 'haflagah', 'onahBeinonit'].forEach(type => {
        const vestOnah = cycle.vestOnot[type];
        if (vestOnah && vestOnah.date) {
          const vestDate = new Date(vestOnah.date);
          if (vestDate >= new Date() && vestDate <= endDate) {
            upcomingVestOnot.push({
              type,
              date: vestOnah.date,
              onah: vestOnah.onah,
              hebrewDate: vestOnah.hebrewDate,
              cycleId: cycle._id
            });
          }
        }
      });
    }
  });

  // Sort by date
  upcomingVestOnot.sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcomingVestOnot;
};

/**
 * Helper function to determine onah icon from time range
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {String} - Onah icon (☀️ or 🌙)
 */
const getOnahIcon = (start, end) => {
  if (!start || !end) return '';

  const startDate = new Date(start).toDateString();
  const endDate = new Date(end).toDateString();

  // Day onah: start and end on same Gregorian day (sunrise to sunset)
  // Night onah: spans two Gregorian days (sunset to next sunrise)
  if (startDate === endDate) {
    return '☀️';
  } else {
    return '🌙';
  }
};

/**
 * Recalculate vest onot for all cycles when halachic preferences change
 * Only updates onah events (vestOnot), not hefsek or other dates
 * @param {String} userId - User ID
 * @param {Object} newHalachicPreferences - New halachic preferences
 * @returns {Number} - Number of cycles updated
 */
const recalculateAllCycleVestOnot = async (userId, newHalachicPreferences) => {
  // Get user's location for calculations
  const user = await Users.findById(userId).select('location');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User location not set. Please update your profile.');
  }

  const hasCompleteLocation = user.location.lat != null && user.location.lng != null;
  if (!hasCompleteLocation) {
    throwError(400, 'Complete location (latitude, longitude, timezone) required.');
  }

  const location = {
    lat: user.location.lat,
    lng: user.location.lng,
    timezone: user.location.timezone
  };

  // Get all non-deleted cycles for the user
  const cycles = await Cycles.find({
    userId,
    isDeleted: false
  }).sort({ 'niddahOnah.start': -1 });

  let updatedCount = 0;

  // Update each cycle's appliedChumras and recalculate vestOnot
  for (const cycle of cycles) {
    // Get previous cycles for haflagah calculation
    const previousCycles = await Cycles.find({
      userId: userId,
      _id: { $ne: cycle._id },
      status: { $in: ['niddah', 'shiva_nekiyim', 'completed'] },
      'niddahOnah.start': { $lt: cycle.niddahOnah.start }
    })
      .sort({ 'niddahOnah.start': -1 })
      .limit(3)
      .select('niddahOnah cycleLength');

    // Update applied chumras
    cycle.appliedChumras = {
      ohrZaruah: newHalachicPreferences.ohrZaruah || false,
      kreisiUpleisi: newHalachicPreferences.kreisiUpleisi || false,
      chasamSofer: newHalachicPreferences.chasamSofer || false
    };

    // Recalculate vest onot with new preferences
    cycle.calculateVestOnot(previousCycles, location, newHalachicPreferences);

    await cycle.save();
    updatedCount++;
  }

  logDatabase('recalculate_vest_onot', 'Cycles', { userId, cyclesUpdated: updatedCount });

  return updatedCount;
};

/**
 * Get calendar events for user's cycles
 * Converts cycles into pre-formatted calendar events
 * @param {String} userId - User ID
 * @param {Object} options - { limit, skip, status }
 * @returns {Array} - Array of calendar events
 */
const getCalendarEvents = async (userId, options = {}) => {
  // Reuse getUserCycles to get cycles with same filtering
  const cycles = await getUserCycles(userId, options);

  const events = [];


  cycles.forEach((cycle) => {
    // 1. Period Start Event (Niddah Start) - Now with time range
    if (cycle.niddahOnah && cycle.niddahOnah.start) {
      const isVoided = cycle.periodVoidedInfo?.isVoided || false;

      // Only show current period start if NOT voided (voided periods show the unclean bedikah as the new period start)
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

      // 1a. Voided Period Start Event (if period was voided)
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

    // 2a. Voided Hefsek Event (if hefsek was voided)
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

        // Determine which events to create based on timeOfDay
        const createMorning = timeOfDay === 'morning' || timeOfDay === 'both';
        const createEvening = timeOfDay === 'evening' || timeOfDay === 'both';

        if (createMorning) {
          const result = bedikah.results?.morning || 'clean';
          let title = `🔍 Morning Bedikah (Day ${bedikah.dayNumber})`;

          // Special labeling for unclean bedikah that caused void
          if (isUncleanBedikah && result === 'not_clean') {
            title = `🔍 Unclean Bedikah - New Period Start`;
          }
          // Voided bedikot (those before the unclean bedikah)
          else if (isVoided && !isUncleanBedikah) {
            title = `🔍 Voided Morning Bedikah (Day ${bedikah.dayNumber})`;
          }

          events.push({
            id: `${cycle._id}-bedikah-${index}-morning`,
            title: title,
            start: bedikah.date,
            end: bedikah.date, // Same day event (will wrap, not overflow)
            className: `bedikah bedikah-${result}`,
            groupID: cycle._id,
          });
        }

        if (createEvening) {
          const result = bedikah.results?.evening || 'clean';
          let title = `🔍 Evening Bedikah (Day ${bedikah.dayNumber})`;

          // Special labeling for unclean bedikah that caused void
          if (isUncleanBedikah && result === 'not_clean') {
            title = `🔍 Unclean Bedikah - New Period Start`;
          }
          // Voided bedikot (those before the unclean bedikah)
          else if (isVoided && !isUncleanBedikah) {
            title = `🔍 Voided Evening Bedikah (Day ${bedikah.dayNumber})`;
          }

          events.push({
            id: `${cycle._id}-bedikah-${index}-evening`,
            title: title,
            start: bedikah.date,
            end: bedikah.date, // Same day event (will wrap, not overflow)
            className: `bedikah bedikah-${result}`,
            groupID: cycle._id,
          });
        }
      });
    }

    // 6. Vest Onot Events - Now with time ranges
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

        // Kreisi Upleisi - Opposite onah same Hebrew day
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

        // Beinonit 31 - Day 31
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

      // Ohr Zaruah events - Preceding onah for all vesetim
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
  recalculateAllCycleVestOnot
};
