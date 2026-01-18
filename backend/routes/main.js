const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cycleRoutes = require('./cycleRoutes');
const notificationRoutes = require('./notificationRoutes');
const locationRoutes = require('./locationRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cycles', cycleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/locations', locationRoutes);

module.exports = router;
