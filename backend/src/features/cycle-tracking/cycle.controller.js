const cycleService = require('./cycle.service');

/**
 * Get all user cycles
 * GET /api/cycles
 */
const getUserCycles = async (req, res, next) => {
  try {
    const { limit, skip, status } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
      skip: skip ? parseInt(skip) : 0,
      status
    };

    const cycles = await cycleService.getUserCycles(req.user._id, options);

    res.status(200).json({
      count: cycles.length,
      cycles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new cycle
 * POST /api/cycles
 */
const createCycle = async (req, res, next) => {
  try {
    const cycle = await cycleService.createCycle(req.user._id, req.body);

    res.status(201).json({
      message: 'Cycle created successfully',
      cycle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific cycle
 * GET /api/cycles/:id
 */
const getCycle = async (req, res, next) => {
  try {
    const cycle = await cycleService.getCycle(req.user._id, req.params.id);
    res.status(200).json(cycle);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a cycle
 * PUT /api/cycles/:id
 */
const updateCycle = async (req, res, next) => {
  try {
    const cycle = await cycleService.updateCycle(req.user._id, req.params.id, req.body);

    res.status(200).json({
      message: 'Cycle updated successfully',
      cycle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a cycle
 * DELETE /api/cycles/:id
 */
const deleteCycle = async (req, res, next) => {
  try {
    const result = await cycleService.deleteCycle(req.user._id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a bedika to a cycle
 * POST /api/cycles/:id/bedikot
 */
const addBedika = async (req, res, next) => {
  try {
    const cycle = await cycleService.addBedika(req.user._id, req.params.id, req.body);

    res.status(201).json({
      message: 'Bedika added successfully',
      cycle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active cycle
 * GET /api/cycles/active
 */
const getActiveCycle = async (req, res, next) => {
  try {
    const cycle = await cycleService.getActiveCycle(req.user._id);

    if (cycle) {
      res.status(200).json(cycle);
    } else {
      res.status(200).json({
        message: 'No active cycle',
        cycle: null
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming vest onot
 * GET /api/cycles/vest-onot/upcoming
 */
const getUpcomingVestOnot = async (req, res, next) => {
  try {
    const { days } = req.query;
    const daysAhead = days ? parseInt(days) : 30;

    const vestOnot = await cycleService.getUpcomingVestOnot(req.user._id, daysAhead);

    res.status(200).json({
      count: vestOnot.length,
      vestOnot
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calendar events
 * GET /api/cycles/calendar-events
 */
const getCalendarEvents = async (req, res, next) => {
  try {
    const { limit, skip, status } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
      skip: skip ? parseInt(skip) : 0,
      status
    };

    const events = await cycleService.getCalendarEvents(req.user._id, options);

    res.status(200).json({
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserCycles,
  createCycle,
  getCycle,
  updateCycle,
  deleteCycle,
  addBedika,
  getActiveCycle,
  getUpcomingVestOnot,
  getCalendarEvents
};
