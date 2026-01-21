const Cycles = require('../models/Cycles');
const Users = require('../models/Users');
const { throwError } = require('../utils/functionHandlers');
const { normalizeCycle, normalizeCycles } = require('../utils/normalizeResponses');
const { createDateInTimezone } = require('../utils/hebrewDateTime');
const { logDatabase } = require('../utils/logHelpers');

/**
 * Create a new cycle (timezone-aware)
 * Service orchestrates: fetches dependencies, calls model methods, constructs complete object
 * @param {String} userId - User ID
 * @param {Object} cycleData - { dateString, timeString, onah?, notes?, privateNotes? }
 * @returns {Object} - Created cycle
 */
const createCycle = async (userId, cycleData) => {
  const { dateString, timeString, onah, notes, privateNotes } = cycleData;

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
    console.warn(`User ${userId} missing lat/lng - vest onot calculations will be skipped`);
  }

  // STEP 2: Convert user's local time to UTC
  const niddahStartDate = createDateInTimezone(dateString, timeString, timezone);

  // STEP 3: Determine niddah start info (onah, sunset, timezone)
  let niddahStartInfo;
  if (hasCompleteLocation) {
    const location = {
      lat: user.location.lat,
      lng: user.location.lng,
      timezone: user.location.timezone
    };
    niddahStartInfo = Cycles.determineNiddahStartInfo(niddahStartDate, location);
  } else {
    // Safe defaults when location incomplete
    niddahStartInfo = {
      calculatedInTimezone: timezone,
      niddahStartSunset: null,
      niddahStartOnah: 'day' // Safe default
    };
  }

  // STEP 4: Fetch previous cycles for calculations
  let previousCycles = [];
  if (hasCompleteLocation) {
    previousCycles = await Cycles.find({
      userId: userId,
      status: 'completed',
      niddahStartDate: { $lt: niddahStartDate }
    })
      .sort({ niddahStartDate: -1 })
      .limit(3)
      .select('niddahStartDate cycleLength');
  }

  // STEP 5: Calculate cycle metrics
  const lastCycle = previousCycles.length > 0 ? previousCycles[0] : null;
  const metrics = Cycles.calculateCycleMetrics(
    niddahStartDate,
    null, // mikvahDate not set yet
    lastCycle
  );

  // STEP 6: Create cycle object with ALL required fields
  const cycle = new Cycles({
    userId,
    niddahStartDate,
    status: 'niddah',
    notes: notes || '',
    privateNotes: privateNotes || '',
    // Required fields that were previously set in pre-save hook
    calculatedInTimezone: niddahStartInfo.calculatedInTimezone,
    niddahStartOnah: niddahStartInfo.niddahStartOnah,
    niddahStartSunset: niddahStartInfo.niddahStartSunset,
    // Optional metrics
    haflagah: metrics.haflagah,
    cycleLength: metrics.cycleLength,
    // Halachic preferences applied to this cycle
    appliedChumras: halachicPreferences
  });

  // STEP 7: Calculate vest onot (if location complete)
  if (hasCompleteLocation) {
    const location = {
      lat: user.location.lat,
      lng: user.location.lng,
      timezone: user.location.timezone
    };
    cycle.calculateVestOnot(previousCycles, location, halachicPreferences);
  }

  // STEP 8: Save (validation only, no business logic in hook)
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
    .sort({ niddahStartDate: -1 })
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
    // 1. Period Start Event (Niddah Start)
    if (cycle.niddahStartDate) {
      const onahIcon = cycle.niddahStartOnah === 'day' ? '☀️' : '🌙';
      events.push({
        id: `${cycle._id}-niddah`,
        title: `🩸 Period Start (${onahIcon})`,
        start: cycle.niddahStartDate,
        className: `niddah-start ${cycle.niddahStartOnah}`,
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

    // 5. Vest Onot Events
    if (cycle.vestOnot) {
      if (cycle.vestOnot.vesetHachodesh?.date) {
        const onahIcon = cycle.vestOnot.vesetHachodesh.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-veset`,
          title: `📅 Veset HaChodesh (${onahIcon})`,
          start: cycle.vestOnot.vesetHachodesh.date,
          className: `vest-onah veset-hachodesh ${cycle.vestOnot.vesetHachodesh.onah}`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.haflagah?.date) {
        const onahIcon = cycle.vestOnot.haflagah.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-haflagah`,
          title: `⏱️ Haflagah (${onahIcon})`,
          start: cycle.vestOnot.haflagah.date,
          className: `vest-onah haflagah ${cycle.vestOnot.haflagah.onah}`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.onahBeinonit?.date) {
        const onahIcon = cycle.vestOnot.onahBeinonit.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-beinonit`,
          title: `🔄 Onah Beinonit (${onahIcon})`,
          start: cycle.vestOnot.onahBeinonit.date,
          className: `vest-onah onah-beinonit ${cycle.vestOnot.onahBeinonit.onah}`,
          groupID: cycle._id,
        });

        // Kreisi Upleisi - Opposite onah on day 30
        if (cycle.vestOnot.onahBeinonit.kreisiUpleisi?.date) {
          const kreisiIcon = cycle.vestOnot.onahBeinonit.kreisiUpleisi.onah === 'day' ? '☀️' : '🌙';
          events.push({
            id: `${cycle._id}-beinonit-kreisi`,
            title: `🔄 Onah Beinonit - Kreisi U'Pleisi (${kreisiIcon})`,
            start: cycle.vestOnot.onahBeinonit.kreisiUpleisi.date,
            className: `vest-onah onah-beinonit-kreisi ${cycle.vestOnot.onahBeinonit.kreisiUpleisi.onah}`,
            groupID: cycle._id,
          });
        }

        // Chasam Sofer - Day 31
        if (cycle.vestOnot.onahBeinonit.chasamSofer?.date) {
          const soferIcon = cycle.vestOnot.onahBeinonit.chasamSofer.onah === 'day' ? '☀️' : '🌙';
          events.push({
            id: `${cycle._id}-beinonit-sofer`,
            title: `🔄 Onah Beinonit - Chasam Sofer Day 31 (${soferIcon})`,
            start: cycle.vestOnot.onahBeinonit.chasamSofer.date,
            className: `vest-onah onah-beinonit-sofer ${cycle.vestOnot.onahBeinonit.chasamSofer.onah}`,
            groupID: cycle._id,
          });
        }
      }

      // Ohr Zaruah events - Preceding onah for all vesetim
      if (cycle.vestOnot.vesetHachodesh?.ohrZaruah?.date) {
        const ohrIcon = cycle.vestOnot.vesetHachodesh.ohrZaruah.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-veset-ohr`,
          title: `Ohr Zaruah - Veset HaChodesh (${ohrIcon})`,
          start: cycle.vestOnot.vesetHachodesh.ohrZaruah.date,
          className: `vest-onah ohr-zaruah ${cycle.vestOnot.vesetHachodesh.ohrZaruah.onah}`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.haflagah?.ohrZaruah?.date) {
        const ohrIcon = cycle.vestOnot.haflagah.ohrZaruah.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-haflagah-ohr`,
          title: `Ohr Zaruah - Haflagah (${ohrIcon})`,
          start: cycle.vestOnot.haflagah.ohrZaruah.date,
          className: `vest-onah ohr-zaruah ${cycle.vestOnot.haflagah.ohrZaruah.onah}`,
          groupID: cycle._id,
        });
      }

      if (cycle.vestOnot.onahBeinonit?.ohrZaruah?.date) {
        const ohrIcon = cycle.vestOnot.onahBeinonit.ohrZaruah.onah === 'day' ? '☀️' : '🌙';
        events.push({
          id: `${cycle._id}-beinonit-ohr`,
          title: `Ohr Zaruah - Onah Beinonit (${ohrIcon})`,
          start: cycle.vestOnot.onahBeinonit.ohrZaruah.date,
          className: `vest-onah ohr-zaruah ${cycle.vestOnot.onahBeinonit.ohrZaruah.onah}`,
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
  getCalendarEvents
};
