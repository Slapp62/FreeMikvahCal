/**
 * Migration Script: Add Timezone Support to Existing Data
 *
 * This script backfills timezone information for existing users and cycles.
 * Run this ONCE after deploying the timezone updates.
 *
 * Usage:
 *   node scripts/migrateTimezones.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../database/dbService');
const Users = require('../models/Users');
const Cycles = require('../models/Cycles');
const { getHebrewDateForTimestamp } = require('../utils/hebrewDateTime');
const logger = require('../config/logger');

// Default timezone for existing users (CHANGE THIS based on your user base)
const DEFAULT_TIMEZONE = 'Asia/Jerusalem'; // Most users likely in Israel

/**
 * Migrate users: Add default timezone if missing
 */
const migrateUsers = async () => {
  console.log('Starting user migration...');

  const usersWithoutTimezone = await Users.find({
    $or: [
      { 'location.timezone': { $exists: false } },
      { 'location.timezone': null },
      { 'location.timezone': '' },
    ],
  });

  console.log(`Found ${usersWithoutTimezone.length} users without timezone`);

  let updated = 0;
  for (const user of usersWithoutTimezone) {
    // Initialize location if it doesn't exist
    if (!user.location) {
      user.location = {};
    }

    // Set default timezone
    user.location.timezone = DEFAULT_TIMEZONE;

    // If user has no lat/lng, set default (Jerusalem)
    if (!user.location.lat || !user.location.lng) {
      user.location.lat = 31.7683;
      user.location.lng = 35.2137;
      user.location.city = user.location.city || 'Jerusalem';
    }

    try {
      await user.save();
      updated++;
      console.log(`Updated user ${user._id} with timezone: ${DEFAULT_TIMEZONE}`);
    } catch (error) {
      console.error(`Failed to update user ${user._id}:`, error.message);
    }
  }

  console.log(`Successfully updated ${updated} users`);
  return updated;
};

/**
 * Migrate cycles: Backfill timezone fields
 */
const migrateCycles = async () => {
  console.log('Starting cycle migration...');

  const cyclesWithoutTimezone = await Cycles.find({
    calculatedInTimezone: { $exists: false },
  }).populate('userId', 'location');

  console.log(`Found ${cyclesWithoutTimezone.length} cycles without timezone info`);

  let updated = 0;
  let failed = 0;

  for (const cycle of cyclesWithoutTimezone) {
    try {
      // Get user's location
      const user = cycle.userId;

      if (!user || !user.location || !user.location.timezone) {
        console.error(`Cycle ${cycle._id}: User has no timezone. Skipping.`);
        failed++;
        continue;
      }

      const location = {
        lat: user.location.lat,
        lng: user.location.lng,
        timezone: user.location.timezone,
      };

      // Calculate Hebrew date info for niddah start
      const hebrewInfo = getHebrewDateForTimestamp(cycle.niddahStartDate, location);

      // Update timezone fields
      cycle.calculatedInTimezone = location.timezone;
      cycle.niddahStartSunset = hebrewInfo.sunset;
      cycle.niddahStartOnah = hebrewInfo.onah;

      // Save without triggering pre-save hook recursively
      await Cycles.updateOne(
        { _id: cycle._id },
        {
          $set: {
            calculatedInTimezone: location.timezone,
            niddahStartSunset: hebrewInfo.sunset,
            niddahStartOnah: hebrewInfo.onah,
          },
        }
      );

      updated++;
      if (updated % 10 === 0) {
        console.log(`Migrated ${updated} cycles...`);
      }
    } catch (error) {
      console.error(`Failed to migrate cycle ${cycle._id}:`, error.message);
      failed++;
    }
  }

  console.log(`Successfully migrated ${updated} cycles`);
  console.log(`Failed to migrate ${failed} cycles`);
  return { updated, failed };
};

/**
 * Main migration function
 */
const runMigration = async () => {
  try {
    console.log('='.repeat(50));
    console.log('TIMEZONE MIGRATION SCRIPT');
    console.log('='.repeat(50));
    console.log(`Default timezone: ${DEFAULT_TIMEZONE}`);
    console.log('');

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Migrate users first
    const usersUpdated = await migrateUsers();
    console.log('');

    // Migrate cycles
    const { updated, failed } = await migrateCycles();
    console.log('');

    // Summary
    console.log('='.repeat(50));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Users updated: ${usersUpdated}`);
    console.log(`Cycles updated: ${updated}`);
    console.log(`Cycles failed: ${failed}`);
    console.log('');

    if (failed > 0) {
      console.log('WARNING: Some cycles failed to migrate. Check logs above.');
    }

    // Log to Winston
    logger.info('Timezone migration completed', {
      usersUpdated,
      cyclesUpdated: updated,
      cyclesFailed: failed,
    });
  } catch (error) {
    console.error('Migration failed:', error);
    logger.error('Timezone migration failed', { error: error.message });
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, migrateUsers, migrateCycles };
