const Cycles = require('../models/Cycles');
const Users = require('../models/Users');
const { throwError } = require('../utils/functionHandlers');
const { normalizeCycle, normalizeCycles } = require('../utils/normalizeResponses');
const { createDateInTimezone } = require('../utils/hebrewDateTime');
const { logDatabase } = require('../utils/logHelpers');

/**
 * Create a new cycle (timezone-aware)
 * @param {String} userId - User ID
 * @param {Object} cycleData - { dateString, timeString, onah?, notes?, privateNotes? }
 * @returns {Object} - Created cycle
 */
const createCycle = async (userId, cycleData) => {
  const { dateString, timeString, onah, notes, privateNotes } = cycleData;

  // Get user's timezone
  const user = await Users.findById(userId).select('location');
  if (!user || !user.location || !user.location.timezone) {
    throwError(400, 'User timezone not set. Please update your profile location.');
  }

  const timezone = user.location.timezone;

  // Convert user's local time to UTC
  const niddahStartDate = createDateInTimezone(dateString, timeString, timezone);

  // Create cycle (pre-save hook will calculate Hebrew dates and vest onot)
  const cycle = new Cycles({
    userId,
    niddahStartDate,
    status: 'niddah',
    notes: notes || '',
    privateNotes: privateNotes || ''
  });

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

  // Update dates (convert from user's timezone to UTC)
  if (updateData.hefsekTaharaDate) {
    cycle.hefsekTaharaDate = createDateInTimezone(
      updateData.hefsekTaharaDate.dateString,
      updateData.hefsekTaharaDate.timeString,
      timezone
    );
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
      ['yomHachodesh', 'ohrHachodesh', 'haflagah', 'onahBeinonit'].forEach(type => {
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

module.exports = {
  createCycle,
  getUserCycles,
  getCycle,
  updateCycle,
  deleteCycle,
  addBedika,
  getActiveCycle,
  getUpcomingVestOnot
};
