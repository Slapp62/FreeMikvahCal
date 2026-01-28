/**
 * Feature Routes Aggregator
 * Consolidates all feature routes into a single export
 */
const express = require('express');
const authRoutes = require('./auth/auth.routes');
const userProfileRoutes = require('./user-profile/user-profile.routes');
const cycleRoutes = require('./cycle-tracking/cycle.routes');
const locationRoutes = require('./locations/locations.routes');

const router = express.Router();

// Mount feature routes
router.use('/auth', authRoutes);
router.use('/users', userProfileRoutes);
router.use('/cycles', cycleRoutes);
router.use('/locations', locationRoutes);

module.exports = router;
