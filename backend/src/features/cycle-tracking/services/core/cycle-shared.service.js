/**
 * Shared helpers for cycle services.
 *
 * These helpers are intentionally side-effect free so they can be reused
 * by create/update/delete/query services without pulling in DB dependencies.
 */

/**
 * Normalize vest storage shape into a uniform array.
 *
 * Historical documents may store a single object while newer records store arrays.
 * This guard lets business logic treat both cases consistently.
 */
const normalizeVestEntries = (vestField) => {
  if (Array.isArray(vestField)) return vestField;
  if (vestField && typeof vestField === 'object') return [vestField];
  return [];
};

/**
 * Resolve the location context used for a period's original calculations.
 *
 * Priority order:
 * 1) Per-period stored coordinates/timezone (preserves historical accuracy)
 * 2) Current profile location (fallback for legacy periods)
 */
const getPeriodCalculationLocation = (period, profileLocation) => ({
  lat: period.calculatedAtLat ?? profileLocation?.lat,
  lng: period.calculatedAtLng ?? profileLocation?.lng,
  timezone: period.calculatedInTimezone || profileLocation?.timezone
});

module.exports = {
  normalizeVestEntries,
  getPeriodCalculationLocation
};
