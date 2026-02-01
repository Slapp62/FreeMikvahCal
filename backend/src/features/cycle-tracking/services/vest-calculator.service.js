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
  const vesetDate = vesetHachodeshshDate.greg();
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

  // Kreisi Upleisi - Opposite onah same Hebrew day (day 30)
  if (chumras.kreisiUpleisi) {
    const kreisiRange = getOnahTimeRange(beinonitDate, location, !isDayOnah);
    result.kreisiUpleisi = {
      start: kreisiRange.start,
      end: kreisiRange.end
    };
  }

  // Ohr Zaruah for Onah Beinonit (preceding onah)
  if (chumras.ohrZaruah) {
    result.ohrZaruah = applyOhrZaruah(beinonitDate, location, isDayOnah);
  }

  // Chasam Sofer - Day 30 with matching onah
  if (chumras.chasamSofer) {
    const chasamSoferDate = new Date(period.niddahOnah.start);
    chasamSoferDate.setDate(chasamSoferDate.getDate() + 30);
    const chasamRange = getOnahTimeRange(chasamSoferDate, location, isDayOnah);
    result.chasamSofer = {
      start: chasamRange.start,
      end: chasamRange.end
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
        kreisiUpleisi: halachicPreferences.kreisiUpleisi,
        chasamSofer: halachicPreferences.chasamSofer
      }
    )
  };

  const appliedChumras = {
    ohrZaruah: halachicPreferences.ohrZaruah || false,
    kreisiUpleisi: halachicPreferences.kreisiUpleisi || false,
    chasamSofer: halachicPreferences.chasamSofer || false
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
