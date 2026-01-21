const { HDate, Location, Zmanim } = require('@hebcal/core');
const { DateTime } = require('luxon');

/**
 * Get sunset time for a specific date and location
 * @param {Date} date - Date to check (UTC)
 * @param {Object} location - { lat, lng, timezone }
 * @returns {Date} - Sunset time as Date object
 */
const getSunsetTime = (date, location) => {
  const { lat, lng, timezone } = location;

  // Create location for Hebcal
  const loc = new Location(
    lat,
    lng,
    false, // Israel flag
    timezone
  );

  // Get zmanim for this date
  const zmanim = new Zmanim(loc, date, false);

  // Get sunset time
  const sunset = zmanim.sunset();

  return sunset;
};

/**
 * Get sunrise time for a specific date and location
 * @param {Date} date - Date to check (UTC)
 * @param {Object} location - { lat, lng, timezone }
 * @returns {Date} - Sunrise time as Date object
 */
const getSunriseTime = (date, location) => {
  const { lat, lng, timezone } = location;

  const loc = new Location(lat, lng, false, timezone);
  const zmanim = new Zmanim(loc, date, false);

  return zmanim.sunrise();
};

/**
 * Determine which Hebrew day a timestamp belongs to
 * considering sunset as the day boundary
 * This is the RECOMMENDED approach using Hebcal's built-in sunset-aware function
 *
 * @param {Date} timestamp - When the event occurred (UTC)
 * @param {Object} location - { lat, lng, timezone }
 * @returns {Object} - { hebrewDate, hebrewDateString, gregorianDate, onah, sunset, isAfterSunset }
 */
const getHebrewDateForTimestamp = (timestamp, location) => {
  const { lat, lng, timezone } = location;

  const loc = new Location(lat, lng, false, timezone);

  // This function automatically handles sunset!
  const hdate = Zmanim.makeSunsetAwareHDate(loc, timestamp, false);

  // Get sunset for determining onah
  const zmanim = new Zmanim(loc, timestamp, false);
  const sunset = zmanim.sunset();
  const sunrise = zmanim.sunrise();
  const isAfterSunset = timestamp >= sunset;

  return {
    hebrewDate: hdate,
    hebrewDateString: hdate.toString(),
    onah: isAfterSunset ? 'night' : 'day',
    sunset: sunset,
    sunrise: sunrise,
    isAfterSunset: isAfterSunset,
  };
};

/**
 * Convert a date from one timezone to another
 * @param {Date} date - Date in UTC
 * @param {String} toTimezone - Target IANA timezone
 * @returns {Date} - Date object representing same moment in target timezone
 */
const convertToTimezone = (date, toTimezone) => {
  // Get local time string in target timezone
  const localString = date.toLocaleString('en-US', { timeZone: toTimezone });
  return new Date(localString);
};

/**
 * Create a Date object from user input in their timezone
 * Uses Luxon for proper timezone handling
 *
 * @param {String} dateString - Date string like "2025-01-15"
 * @param {String} timeString - Time string like "22:30"
 * @param {String} timezone - IANA timezone (e.g., "Asia/Jerusalem")
 * @returns {Date} - UTC Date object
 */
const createDateInTimezone = (dateString, timeString, timezone) => {
  // Create DateTime in user's timezone
  const dt = DateTime.fromISO(`${dateString}T${timeString}`, { zone: timezone });

  // Convert to JS Date (which is always UTC)
  return dt.toJSDate();
};

/**
 * Format a UTC date to a string in user's timezone
 * @param {Date} date - UTC Date object
 * @param {String} timezone - IANA timezone
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} - Formatted date string
 */
const formatDateInTimezone = (date, timezone, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  };

  const finalOptions = { ...defaultOptions, ...options };

  return date.toLocaleString('en-US', finalOptions);
};

/**
 * Get DateTime object in specific timezone
 * @param {Date} date - UTC Date object
 * @param {String} timezone - IANA timezone
 * @returns {DateTime} - Luxon DateTime object
 */
const getDateTimeInTimezone = (date, timezone) => {
  return DateTime.fromJSDate(date, { zone: timezone });
};

/**
 * Check if a date is during daylight saving time for a timezone
 * @param {Date} date - Date to check
 * @param {String} timezone - IANA timezone
 * @returns {Boolean} - True if DST is active
 */
const isDST = (date, timezone) => {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return dt.isInDST;
};

/**
 * Get timezone offset for a specific date
 * Accounts for DST changes
 * @param {Date} date - Date to check
 * @param {String} timezone - IANA timezone
 * @returns {Number} - Offset in minutes
 */
const getTimezoneOffset = (date, timezone) => {
  const dt = DateTime.fromJSDate(date, { zone: timezone });
  return dt.offset;
};

/**
 * Validate IANA timezone name
 * @param {String} timezone - Timezone to validate
 * @returns {Boolean} - True if valid
 */
const isValidTimezone = (timezone) => {
  try {
    DateTime.local().setZone(timezone);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get complete zmanim for a date and location
 * @param {Date} date - Date to get zmanim for
 * @param {Object} location - { lat, lng, timezone }
 * @returns {Object} - Object with all zmanim times
 */
const getZmanim = (date, location) => {
  const { lat, lng, timezone } = location;

  const loc = new Location(lat, lng, false, timezone);
  const zmanim = new Zmanim(loc, date, false);

  return {
    sunrise: zmanim.sunrise(),
    sunset: zmanim.sunset(),
    dawn: zmanim.dawn(),
    dusk: zmanim.dusk(),
    chatzot: zmanim.chatzot(),
    chatzotNight: zmanim.chatzotNight(),
    alotHaShachar: zmanim.alotHaShachar(),
    misheyakir: zmanim.misheyakir(),
    sofZmanShma: zmanim.sofZmanShma(),
    sofZmanTfilla: zmanim.sofZmanTfilla(),
    minchaGedola: zmanim.minchaGedola(),
    minchaKetana: zmanim.minchaKetana(),
    plagHaMincha: zmanim.plagHaMincha(),
    tzeit: zmanim.tzeit(),
  };
};

/**
 * Get time range for a specific onah (day or night) on a given date
 * Day onah: sunrise to sunset
 * Night onah: sunset to next sunrise (spans 2 Gregorian days)
 * @param {Date} date - Reference Gregorian date
 * @param {Object} location - { lat, lng, timezone }
 * @param {Boolean} isDayOnah - True for day onah, false for night onah
 * @returns {Object} - { start, end, hebrewDate, dayOfWeek }
 */
const getOnahTimeRange = (date, location, isDayOnah) => {
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const zmanim = new Zmanim(loc, date, false);

  const sunrise = zmanim.sunrise();
  const sunset = zmanim.sunset();

  let start, end;

  if (isDayOnah) {
    // Day onah: sunrise to sunset on the same date
    start = sunrise;
    end = sunset;
  } else {
    // Night onah: sunset to next sunrise (spans to next Gregorian day)
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayZmanim = new Zmanim(loc, nextDay, false);

    start = sunset;
    end = nextDayZmanim.sunrise();
  }

  // Get Hebrew date at the start of the onah
  const hDate = Zmanim.makeSunsetAwareHDate(loc, start, false);

  return {
    start,
    end,
    hebrewDate: hDate.toString(),
    hebrewDateShort: `${hDate.getDate()} ${hDate.getMonthName()}`,
    dayOfWeek: date.getDay(),
  };
};

/**
 * Calculate vest onah info for a specific date
 * Returns date with onah information
 * @param {Date} date - Gregorian date
 * @param {Object} location - { lat, lng, timezone }
 * @param {String} matchingOnah - 'day' or 'night'
 * @returns {Object} - Vest onah information
 * @deprecated Use getOnahTimeRange instead
 */
const getVestInfo = (date, location, matchingOnah) => {
  const hDate = new HDate(date);
  const loc = new Location(location.lat, location.lng, false, location.timezone);
  const zmanim = new Zmanim(loc, date, false);

  return {
    date: date,
    onah: matchingOnah,
    hebrewDate: hDate.toString(),
    hebrewDateShort: `${hDate.getDate()} ${hDate.getMonthName()}`,
    dayOfWeek: date.getDay(),
    sunset: zmanim.sunset(),
    sunrise: zmanim.sunrise(),
  };
};

/**
 * Parse user input date and time, handling various formats
 * @param {String|Date} input - User input (could be various formats)
 * @param {String} timezone - User's IANA timezone
 * @returns {Date} - UTC Date object
 */
const parseUserDateTime = (input, timezone) => {
  if (input instanceof Date) {
    return input;
  }

  // Try parsing as ISO string in user's timezone
  try {
    const dt = DateTime.fromISO(input, { zone: timezone });
    if (dt.isValid) {
      return dt.toJSDate();
    }
  } catch {
    // Continue to other parsing methods
  }

  // Try parsing as SQL/MySQL format
  try {
    const dt = DateTime.fromSQL(input, { zone: timezone });
    if (dt.isValid) {
      return dt.toJSDate();
    }
  } catch {
    // Continue to other parsing methods
  }

  // Try parsing as HTTP format
  try {
    const dt = DateTime.fromHTTP(input, { zone: timezone });
    if (dt.isValid) {
      return dt.toJSDate();
    }
  } catch {
    // Continue to other parsing methods
  }

  // Fallback to native Date parsing (less reliable)
  return new Date(input);
};

module.exports = {
  getSunsetTime,
  getSunriseTime,
  getHebrewDateForTimestamp,
  convertToTimezone,
  createDateInTimezone,
  formatDateInTimezone,
  getDateTimeInTimezone,
  isDST,
  getTimezoneOffset,
  isValidTimezone,
  getZmanim,
  getOnahTimeRange,
  getVestInfo, // Deprecated, but kept for backward compatibility
  parseUserDateTime,
};
