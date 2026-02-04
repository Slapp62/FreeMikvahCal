const { createCycle } = require('./services/flows/cycle-create.service');
const { updateCycle, addBedika } = require('./services/flows/cycle-update.service');
const { deleteCycle } = require('./services/flows/cycle-delete.service');
const {
  getUserCycles,
  getCycle,
  getActiveCycle
} = require('./services/queries/cycle-query.service');
const {
  getUpcomingVestOnot,
  recalculateAllPeriodVestOnot
} = require('./services/queries/cycle-vest-query.service');
const { buildCalendarEvents } = require('./services/calendar/calendar-events.service');

/**
 * Thin facade for cycle-tracking feature services.
 *
 * Keeping this file as the stable import surface avoids controller churn while
 * allowing internal implementation to stay modular and testable.
 */
const getCalendarEvents = async (userId, options = {}) => {
  const cycles = await getUserCycles(userId, options);
  return buildCalendarEvents(userId, cycles);
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
