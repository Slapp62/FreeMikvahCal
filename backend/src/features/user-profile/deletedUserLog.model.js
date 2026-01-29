const mongoose = require('mongoose');

/**
 * DeletedUserLog Schema
 * Stores analytics about deleted users WITHOUT storing any personal information
 * Used for tracking deletion metrics while maintaining user privacy and GDPR compliance
 */
const deletedUserLogSchema = new mongoose.Schema({
  // Timestamp when user was deleted
  deletedAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },

  // When the user account was originally created (for lifecycle analytics)
  userCreatedAt: {
    type: Date,
    required: true
  },

  // Method of deletion (manual, gdpr_request, admin, etc.)
  deletionMethod: {
    type: String,
    enum: ['manual', 'gdpr_request', 'admin', 'system'],
    default: 'manual'
  },

  // Optional reason for deletion (non-personal)
  deletionReason: {
    type: String,
    maxlength: 500
  },

  // Metadata for analytics (non-personal)
  metadata: {
    hadGoogleAccount: Boolean,
    totalCycles: Number,
    accountAgeInDays: Number
  }
}, {
  timestamps: false, // We only care about deletedAt
  collection: 'deleted_user_logs'
});

// Index for analytics queries
deletedUserLogSchema.index({ deletedAt: -1 });
deletedUserLogSchema.index({ deletionMethod: 1 });

const DeletedUserLog = mongoose.model('DeletedUserLog', deletedUserLogSchema);

module.exports = DeletedUserLog;
