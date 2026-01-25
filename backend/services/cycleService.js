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
    userId,
    isDeleted: false
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
    userId,
    isDeleted: false
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
    userId,
    isDeleted: false
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  // Get user's timezone for date conversions
  const user = await Users.findById(userId).select('location');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }
  const timezone = user.location.timezone;
  const hasCompleteLocation = user.location.lat != null && user.location.lng != null;

  // Track if we need to recalculate vest onot
  let needsVestRecalculation = false;

  // Update dates (convert from user's timezone to UTC)
  if (updateData.hefsekTaharaDate) {
    cycle.hefsekTaharaDate = createDateInTimezone(
      updateData.hefsekTaharaDate.dateString,
      updateData.hefsekTaharaDate.timeString,
      timezone
    );

    // Automatically create mikvah date 7 days after hefsek tahara
    const mikvahDate = new Date(cycle.hefsekTaharaDate);
    mikvahDate.setDate(mikvahDate.getDate() + 7);
    cycle.mikvahDate = mikvahDate;
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
 * Delete a cycle (soft delete)
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @returns {Object} - Success message
 */
const deleteCycle = async (userId, cycleId) => {
  const cycle = await Cycles.findOne({
    _id: cycleId,
    userId,
    isDeleted: false
  });

  if (!cycle) {
    throwError(404, 'Cycle not found');
  }

  cycle.isDeleted = true;
  cycle.deletedAt = new Date();

  await cycle.save();

  logDatabase('soft_delete', 'Cycles', { userId, cycleId });

  return { message: 'Cycle deleted successfully' };
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
    userId,
    isDeleted: false
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

  await cycle.save();

  logDatabase('update', 'Cycles', { userId, cycleId, action: 'add_bedika' });

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
    status: { $in: ['niddah', 'shiva_nekiyim'] },
    isDeleted: false
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
    isDeleted: false,
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
      events.push({
        id: `${cycle._id}-niddah`,
        title: `🩸 Period Start`,
        start: cycle.niddahOnah.start,
        end: cycle.niddahOnah.end,
        className: `niddah-start`,
        groupID: cycle._id,
      });
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

    // 5. Vest Onot Events - Now with time ranges
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
