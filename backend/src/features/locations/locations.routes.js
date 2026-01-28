const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../../shared/middleware/rate-limiter');
const locationController = require('./locations.controller');

// Apply middleware to all routes
router.use(apiLimiter);

// GET /api/locations/search - Search locations (no auth required for registration)
router.get('/search', locationController.getLocations);

module.exports = router;
