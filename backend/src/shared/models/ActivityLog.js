const mongoose = require('mongoose');
const { Schema } = mongoose;

const activityLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    index: true
  },

  action: {
    type: String,
    enum: [
      'cycle_created',
      'cycle_updated',
      'cycle_deleted',
      'bedika_added',
      'mikvah_marked',
      'reminder_sent',
      'settings_changed',
      'login',
      'logout'
    ],
    required: true
  },

  entityType: {
    type: String,
    enum: ['cycle', 'user', 'preference', 'bedika', 'auth']
  },

  entityId: { type: Schema.Types.ObjectId },

  changes: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    _id: false
  },

  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    _id: false
  },

  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 90);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  }
});

activityLogSchema.index({ userId: 1, 'metadata.timestamp': -1 });

module.exports = mongoose.model('ActivityLogs', activityLogSchema);
