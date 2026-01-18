const { searchLocations } = require('../data/locations');

/**
 * Search locations
 * GET /api/locations/search?q=term
 */
const getLocations = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = searchLocations(q);

    res.status(200).json({
      count: results.length,
      locations: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations
};
