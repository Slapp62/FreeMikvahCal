const { HDate, Location, Zmanim } = require('@hebcal/core');
const { getOnahTimeRange } = require('../../../shared/utils/hebrew-datetime');

/**
 * Vest Calculator Service
 *
 * Modular service for calculating vest onot (expected period times) according to halacha.
 * Extracted from model for better testability and scalability.
 */

/**
 * Apply Ohr Zaruah chumra (preceding onah)
 * If original was day onah → return night before
 * If original was night onah → return day before (same Gregorian date)
 */
function applyOhrZaruah(vestDate, location, isDayOnah) {
  if (isDayOnah) {
    // If original was day, Ohr Zaruah is night before
    const nightBefore = new Date(vestDate);
    nightBefore.setDate(nightBefore.getDate() - 1);
    const ozRange = getOnahTimeRange(nightBefore, location, false);
    return {
      start: ozRange.start,
      end: ozRange.end
    };
  } else {
    // If original was night, Ohr Zaruah is day before (same Gregorian date)
    const ozRange = getOnahTimeRange(vestDate, location, true);
    return {
      start: ozRange.start,
      end: ozRange.end
    };
  }
}

/**
 * Calculate Veset HaChodesh (monthly vest - same Hebrew date next month)
 */
function calculateVesetHachodesh(period, location, isDayOnah, applyOhrZaruahChumra = false) {
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const startHDate = Zmanim.makeSunsetAwareHDate(loc, period.niddahOnah.start, false);
  const day = startHDate.getDate();
  const month = startHDate.getMonth();
  const year = startHDate.getFullYear();

  // Create new date with same day number, next Hebrew month
  const vesetHachodeshshDate = new HDate(day, month + 1, year);
  let vesetDate = vesetHachodeshshDate.greg();

  // For night onahs, .greg() returns the Gregorian date at midnight, but the Hebrew date
  // actually started the previous evening at sunset. We need to adjust back one day
  // to get the Gregorian day when the night onah begins (at sunset).
  if (!isDayOnah) {
    vesetDate = new Date(vesetDate);
    vesetDate.setDate(vesetDate.getDate() - 1);
  }

  const vesetRange = getOnahTimeRange(vesetDate, location, isDayOnah);

  const result = {
    start: vesetRange.start,
    end: vesetRange.end,
    hebrewDate: vesetRange.hebrewDate,
    dayOfWeek: vesetRange.dayOfWeek
  };

  // Ohr Zaruah for Veset HaChodesh (preceding onah)
  if (applyOhrZaruahChumra) {
    result.ohrZaruah = applyOhrZaruah(vesetDate, location, isDayOnah);
  }

  return result;
}

/**
 * Calculate Haflagah vest (based on interval from last cycle)
 */
function calculateHaflagah(period, previousCycles, location, isDayOnah, applyOhrZaruahChumra = false) {
  if (!period.haflagah || !previousCycles || previousCycles.length === 0) {
    return null;
  }

  const haflagahDate = new Date(period.niddahOnah.start);
  haflagahDate.setDate(haflagahDate.getDate() + period.haflagah);
  const haflagahRange = getOnahTimeRange(haflagahDate, location, isDayOnah);

  const result = {
    start: haflagahRange.start,
    end: haflagahRange.end,
    interval: period.haflagah,
    hebrewDate: haflagahRange.hebrewDate,
    dayOfWeek: haflagahRange.dayOfWeek
  };

  // Ohr Zaruah for Haflagah (preceding onah)
  if (applyOhrZaruahChumra) {
    result.ohrZaruah = applyOhrZaruah(haflagahDate, location, isDayOnah);
  }

  return result;
}

/**
 * Calculate Onah Beinonit vest (fixed 29-day calculation with optional chumras)
 */
function calculateOnahBeinonit(period, location, isDayOnah, chumras = {}) {
  // Base calculation - day 29
  const beinonitDate = new Date(period.niddahOnah.start);
  beinonitDate.setDate(beinonitDate.getDate() + 29);
  const beinonitRange = getOnahTimeRange(beinonitDate, location, isDayOnah);

  const result = {
    start: beinonitRange.start,
    end: beinonitRange.end,
    calculatedFrom: 29,
    hebrewDate: beinonitRange.hebrewDate,
    dayOfWeek: beinonitRange.dayOfWeek
  };

  // Kreisi Upleisi - Opposite onah (following onah after base)
  // If base is day: following night is same date
  // If base is night: following day is NEXT date
  if (chumras.beinonit_24hr) {
    const kreisiDate = isDayOnah
      ? beinonitDate
      : new Date(beinonitDate.getTime() + 86400000); // Add 1 day if base is night
    const kreisiRange = getOnahTimeRange(kreisiDate, location, !isDayOnah);
    result.beinonit_24hr = {
      start: kreisiRange.start,
      end: kreisiRange.end
    };
  }

  // Ohr Zaruah for Onah Beinonit (preceding onah)
  if (chumras.ohrZaruah) {
    result.ohrZaruah = applyOhrZaruah(beinonitDate, location, isDayOnah);
  }

  // Beinonit 31 - Day 30 with matching onah
  if (chumras.beinonit_31) {
    const beinonit_31Date = new Date(period.niddahOnah.start);
    beinonit_31Date.setDate(beinonit_31Date.getDate() + 30);
    const chasamRange = getOnahTimeRange(beinonit_31Date, location, isDayOnah);
    result.beinonit_31 = {
      start: chasamRange.start,
      end: chasamRange.end
    };

    // Also add opposite onah for beinonit_31 (following onah after base)
    // If base is day: following night is same date
    // If base is night: following day is NEXT date
    const beinonit_31_oppositeDate = isDayOnah
      ? beinonit_31Date
      : new Date(beinonit_31Date.getTime() + 86400000); // Add 1 day if base is night
    const beinonit_31_oppositeRange = getOnahTimeRange(beinonit_31_oppositeDate, location, !isDayOnah);
    result.beinonit_31_opposite = {
      start: beinonit_31_oppositeRange.start,
      end: beinonit_31_oppositeRange.end
    };
  }

  return result;
}

/**
 * Main orchestrator: Calculate all vest onot for a period
 *
 * @param {Object} period - Period document with niddahOnah
 * @param {Array} previousCycles - Previous periods for haflagah calculation
 * @param {Object} location - User location (lat, lng, timezone)
 * @param {Object} halachicPreferences - User's chumra preferences
 * @returns {Object} vestOnot and appliedChumras
 */
function calculateAllVestOnot(period, previousCycles, location, halachicPreferences = {}) {
  // Determine if original onah was day or night based on time range
  // Day onah: start and end on same Gregorian day (sunrise to sunset)
  // Night onah: spans two Gregorian days (sunset to next sunrise)
  const startDate = new Date(period.niddahOnah.start).toDateString();
  const endDate = new Date(period.niddahOnah.end).toDateString();
  const isDayOnah = startDate === endDate;

  const vestOnot = {
    vesetHachodesh: calculateVesetHachodesh(
      period,
      location,
      isDayOnah,
      halachicPreferences.ohrZaruah
    ),
    haflagah: calculateHaflagah(
      period,
      previousCycles,
      location,
      isDayOnah,
      halachicPreferences.ohrZaruah
    ),
    onahBeinonit: calculateOnahBeinonit(
      period,
      location,
      isDayOnah,
      {
        ohrZaruah: halachicPreferences.ohrZaruah,
        beinonit_24hr: halachicPreferences.beinonit_24hr,
        beinonit_31: halachicPreferences.beinonit_31
      }
    )
  };

  const appliedChumras = {
    ohrZaruah: halachicPreferences.ohrZaruah || false,
    beinonit_24hr: halachicPreferences.beinonit_24hr || false,
    beinonit_31: halachicPreferences.beinonit_31 || false
  };

  return { vestOnot, appliedChumras };
}

module.exports = {
  calculateAllVestOnot,
  calculateVesetHachodesh,
  calculateHaflagah,
  calculateOnahBeinonit,
  applyOhrZaruah
};
