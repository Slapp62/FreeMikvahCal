const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const cycleRoutes = require('./cycleRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cycles', cycleRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
