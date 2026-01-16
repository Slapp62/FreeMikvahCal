const notificationService = require('../services/notificationService');

/**
 * Get notification history for user
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { limit, skip } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
      skip: skip ? parseInt(skip) : 0
    };

    const notifications = await notificationService.getNotificationHistory(req.user._id, options);

    res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending notifications for user
 * GET /api/notifications/pending
 */
const getPendingNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getPendingNotifications(req.user._id);

    res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getPendingNotifications
};
