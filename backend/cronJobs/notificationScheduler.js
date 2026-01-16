const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');

/**
 * Process pending notifications
 * This would integrate with email/SMS service in production
 */
const processPendingNotifications = async () => {
  try {
    const Notifications = require('../models/Notifications');

    // Get all pending notifications that are due
    const pendingNotifications = await Notifications.find({
      status: 'pending',
      scheduledFor: { $lte: new Date() }
    }).limit(100); // Process in batches

    logger.info(`Processing ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      try {
        // TODO: In production, integrate with email/SMS service here
        // Example:
        // await emailService.send({
        //   to: user.email,
        //   subject: notification.title,
        //   body: notification.message
        // });

        // For now, just log and mark as sent
        logger.info('Notification sent', {
          userId: notification.userId,
          type: notification.type,
          title: notification.title
        });

        await notificationService.markAsSent(notification._id, 'email');
      } catch (error) {
        logger.error('Failed to send notification', {
          notificationId: notification._id,
          error: error.message
        });

        await notificationService.markAsFailed(notification._id, error.message);
      }
    }

    if (pendingNotifications.length > 0) {
      logger.info(`Notification processing complete: ${pendingNotifications.length} notifications processed`);
    }
  } catch (error) {
    logger.error('Error in notification scheduler', {
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Schedule notification processing
 * Runs every 15 minutes
 */
const scheduleNotificationProcessing = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', processPendingNotifications);
  logger.info('Notification scheduler started (runs every 15 minutes)');
  console.log('Notification scheduler started (runs every 15 minutes)');
};

module.exports = { scheduleNotificationProcessing, processPendingNotifications };
