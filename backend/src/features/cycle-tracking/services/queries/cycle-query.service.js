const Periods = require('../../models/period.model');
const Bedikahs = require('../../models/bedikah.model');
const Vestos = require('../../models/vestos.model');
const { throwError } = require('../../../../shared/utils/error-handlers');
const { normalizeCycle, normalizeCycles } = require('../../../../shared/utils/normalize-responses');

/**
 * Query helpers for retrieving cycle documents and their related vest/bedikah data.
 */
const getUserCycles = async (userId, options = {}) => {
  const { limit = 50, skip = 0, status } = options;
  const query = { userId };
  if (status) query.status = status;

  const periods = await Periods.find(query)
    .sort({ 'niddahOnah.start': -1 })
    .limit(limit)
    .skip(skip);

  const periodsWithVestos = await Promise.all(periods.map(async (period) => {
    const vestos = await Vestos.findOne({ periodId: period._id });
    const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });
    return {
      ...period.toObject(),
      vestOnot: vestos?.vestOnot,
      bedikot: bedikahs.map((b) => b.toObject())
    };
  }));

  return normalizeCycles(periodsWithVestos);
};

const getCycle = async (userId, cycleId) => {
  const period = await Periods.findOne({ _id: cycleId, userId });
  if (!period) throwError(404, 'Cycle not found');

  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

  return normalizeCycle({
    ...period.toObject(),
    vestOnot: vestos?.vestOnot,
    bedikot: bedikahs.map((b) => b.toObject())
  });
};

const getActiveCycle = async (userId) => {
  const period = await Periods.findOne({ userId, status: { $in: ['niddah', 'shiva_nekiyim'] } })
    .sort({ 'niddahOnah.start': -1 });
  if (!period) return null;

  const vestos = await Vestos.findOne({ periodId: period._id });
  const bedikahs = await Bedikahs.find({ periodId: period._id }).sort({ date: 1 });

  return normalizeCycle({
    ...period.toObject(),
    vestOnot: vestos?.vestOnot,
    bedikot: bedikahs.map((b) => b.toObject())
  });
};

module.exports = {
  getUserCycles,
  getCycle,
  getActiveCycle
};
