/**
 * Centralized halachic preset configurations
 *
 * Each halachic custom has default preferences that are automatically applied
 * when the user selects that custom during registration or profile update.
 *
 * To add a new custom:
 * 1. Add to HALACHIC_CUSTOMS array
 * 2. Add entry to HALACHIC_PRESETS object with default values
 * 3. Update frontend schema enum validation
 */

const HALACHIC_CUSTOMS = ['ashkenazi', 'sephardi', 'chabad', 'manual'];

const HALACHIC_PRESETS = {
  ashkenazi: {
    minimumNiddahDays: 5,
    beinonit_24hr: true,     // Kreisi U'Pleisi - 24-hour onah beinonit (day 30)
    beinonit_31: true,       // Also observe day 31
    ohrZaruah: false,        // Separate on preceding onah for all vesetim
  },
  sephardi: {
    minimumNiddahDays: 4,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
  },
  chabad: {
    minimumNiddahDays: 5,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
  },
  manual: {
    minimumNiddahDays: 5,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
  },
};

/**
 * Apply halachic preset for given custom
 * Falls back to 'manual' preset if custom is invalid
 *
 * @param {string} custom - Halachic custom name ('ashkenazi', 'sephardi', 'chabad', 'manual')
 * @returns {object} Preset configuration object
 */
function applyHalachicPreset(custom) {
  return HALACHIC_PRESETS[custom] || HALACHIC_PRESETS.manual;
}

/**
 * Validate if a custom name is valid
 *
 * @param {string} custom - Halachic custom name to validate
 * @returns {boolean} True if valid
 */
function isValidHalachicCustom(custom) {
  return HALACHIC_CUSTOMS.includes(custom);
}

module.exports = {
  HALACHIC_CUSTOMS,
  HALACHIC_PRESETS,
  applyHalachicPreset,
  isValidHalachicCustom,
};
