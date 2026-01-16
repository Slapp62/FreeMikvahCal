const Notifications = require('../models/Notifications');
const Cycles = require('../models/Cycles');
const Users = require('../models/Users');
const Preferences = require('../models/Preferences');
const { throwError } = require('../utils/functionHandlers');
const { logDatabase } = require('../utils/logHelpers');

/**
 * Create notification for a cycle event
 * @param {String} userId - User ID
 * @param {String} cycleId - Cycle ID
 * @param {String} type - Notification type
 * @param {Date} scheduledFor - When to send notification
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} hebrewDate - Hebrew date string (optional)
 * @returns {Object} - Created notification
 */
const createNotification = async (userId, cycleId, type, scheduledFor, title, message, hebrewDate = null) => {
  // Check if user has notifications enabled
  const preferences = await Preferences.findOne({ userId });

  if (!preferences || !preferences.notifications || !preferences.notifications.enabled) {
    return null; // Don't create notification if disabled
  }

  // Check specific notification type preference
  const typeMap = {
    hefsek_tahara: 'hefsekTaharaReminder',
    shiva_nekiyim_start: 'shivaNekiyimReminder',
    bedika_reminder: 'shivaNekiyimReminder',
    mikvah_night: 'mikvahReminder',
    vest_onah: 'vestOnotReminder'
  };

  const preferenceKey = typeMap[type];
  if (preferenceKey && !preferences.notifications[preferenceKey]) {
    return null; // Don't create if this type is disabled
  }

  const notification = new Notifications({
    userId,
    cycleId,
    type,
    scheduledFor,
    title,
    message,
    hebrewDate,
    status: 'pending'
  });

  await notification.save();

  logDatabase('create', 'Notifications', { userId, type });

  return notification;
};

/**
 * Schedule notifications for a new cycle
 * @param {Object} cycle - Cycle document
 */
const scheduleNotificationsForCycle = async (cycle) => {
  const user = await Users.findById(cycle.userId).select('location');
  if (!user) return;

  const preferences = await Preferences.findOne({ userId: cycle.userId });
  if (!preferences || !preferences.notifications || !preferences.notifications.enabled) {
    return;
  }

  const notifications = [];

  // 1. Hefsek Tahara reminder (typically day 5)
  if (preferences.notifications.hefsekTaharaReminder) {
    const hefsekDate = new Date(cycle.niddahStartDate);
    hefsekDate.setDate(hefsekDate.getDate() + 5);

    notifications.push({
      userId: cycle.userId,
      cycleId: cycle._id,
      type: 'hefsek_tahara',
      scheduledFor: hefsekDate,
      title: 'Hefsek Tahara Reminder',
      message: 'Consider performing hefsek tahara today (typically day 5)'
    });
  }

  // 2. Vest Onot reminders
  if (preferences.notifications.vestOnotReminder && cycle.vestOnot) {
    ['yomHachodesh', 'ohrHachodesh', 'haflagah', 'onahBeinonit'].forEach(vestType => {
      const vestOnah = cycle.vestOnot[vestType];
      if (vestOnah && vestOnah.date) {
        const reminderDate = new Date(vestOnah.date);
        // Send reminder 1 day before
        reminderDate.setDate(reminderDate.getDate() - 1);

        notifications.push({
          userId: cycle.userId,
          cycleId: cycle._id,
          type: 'vest_onah',
          scheduledFor: reminderDate,
          title: `Vest Onah: ${vestType}`,
          message: `Tomorrow is your ${vestType} vest onah (${vestOnah.onah})`,
          hebrewDate: vestOnah.hebrewDate
        });
      }
    });
  }

  // Create all notifications
  for (const notifData of notifications) {
    await createNotification(
      notifData.userId,
      notifData.cycleId,
      notifData.type,
      notifData.scheduledFor,
      notifData.title,
      notifData.message,
      notifData.hebrewDate
    );
  }

  return notifications.length;
};

/**
 * Schedule mikvah night notification
 * @param {Object} cycle - Cycle document
 */
const scheduleMikvahNotification = async (cycle) => {
  if (!cycle.mikvahDate) return;

  const preferences = await Preferences.findOne({ userId: cycle.userId });
  if (!preferences || !preferences.notifications || !preferences.notifications.mikvahReminder) {
    return;
  }

  // Send notification on mikvah night
  await createNotification(
    cycle.userId,
    cycle._id,
    'mikvah_night',
    cycle.mikvahDate,
    'Mikvah Night',
    'Tonight is your scheduled mikvah night'
  );
};

/**
 * Get pending notifications for a user
 * @param {String} userId - User ID
 * @returns {Array} - Pending notifications
 */
const getPendingNotifications = async (userId) => {
  const notifications = await Notifications.find({
    userId,
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  }).sort({ scheduledFor: 1 });

  return notifications;
};

/**
 * Mark notification as sent
 * @param {String} notificationId - Notification ID
 * @param {String} deliveryMethod - How it was delivered
 */
const markAsSent = async (notificationId, deliveryMethod = 'email') => {
  const notification = await Notifications.findById(notificationId);

  if (!notification) {
    throwError(404, 'Notification not found');
  }

  notification.status = 'sent';
  notification.sentAt = new Date();
  notification.deliveryMethod = deliveryMethod;

  await notification.save();

  return notification;
};

/**
 * Mark notification as failed
 * @param {String} notificationId - Notification ID
 * @param {String} reason - Failure reason
 */
const markAsFailed = async (notificationId, reason) => {
  const notification = await Notifications.findById(notificationId);

  if (!notification) {
    throwError(404, 'Notification not found');
  }

  notification.status = 'failed';
  notification.failureReason = reason;
  notification.retryCount += 1;

  // If retries are under 3, set back to pending
  if (notification.retryCount < 3) {
    notification.status = 'pending';
    // Reschedule for 1 hour later
    notification.scheduledFor = new Date(Date.now() + 60 * 60 * 1000);
  }

  await notification.save();

  return notification;
};

/**
 * Cancel notifications for a cycle
 * @param {String} cycleId - Cycle ID
 */
const cancelNotificationsForCycle = async (cycleId) => {
  await Notifications.updateMany(
    { cycleId, status: 'pending' },
    { status: 'cancelled' }
  );

  logDatabase('update', 'Notifications', { cycleId, action: 'cancel' });
};

/**
 * Get notification history for a user
 * @param {String} userId - User ID
 * @param {Object} options - { limit, skip }
 * @returns {Array} - Notification history
 */
const getNotificationHistory = async (userId, options = {}) => {
  const { limit = 50, skip = 0 } = options;

  const notifications = await Notifications.find({ userId })
    .sort({ scheduledFor: -1 })
    .limit(limit)
    .skip(skip);

  return notifications;
};

module.exports = {
  createNotification,
  scheduleNotificationsForCycle,
  scheduleMikvahNotification,
  getPendingNotifications,
  markAsSent,
  markAsFailed,
  cancelNotificationsForCycle,
  getNotificationHistory
};
