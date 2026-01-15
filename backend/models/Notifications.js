const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    index: true
  },

  cycleId: {
    type: Schema.Types.ObjectId,
    ref: 'Cycles'
  },

  type: {
    type: String,
    enum: [
      'hefsek_tahara',
      'shiva_nekiyim_start',
      'bedika_reminder',
      'mikvah_night',
      'vest_onah'
    ],
    required: true
  },

  scheduledFor: { type: Date, required: true, index: true },

  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },

  title: { type: String, required: true },
  message: { type: String, required: true },
  hebrewDate: String,

  sentAt: Date,
  deliveryMethod: {
    type: String,
    enum: ['email', 'push', 'sms']
  },

  failureReason: String,
  retryCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },

  expiresAt: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
    index: { expireAfterSeconds: 0 }
  }
});

notificationSchema.index({ userId: 1, status: 1, scheduledFor: 1 });

module.exports = mongoose.model('Notifications', notificationSchema);
