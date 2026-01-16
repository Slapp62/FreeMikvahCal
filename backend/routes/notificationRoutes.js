const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply middleware to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/notifications - Get notification history
router.get('/', notificationController.getNotifications);

// GET /api/notifications/pending - Get pending notifications
router.get('/pending', notificationController.getPendingNotifications);

module.exports = router;
