export type HalachicCustom = 'ashkenazi' | 'sephardi' | 'chabad' | 'manual';

export interface HalachicPresetConfig {
  minimumNiddahDays: number;
  ohrZaruah: boolean;
  beinonit_24hr: boolean;
  beinonit_31: boolean;
}

/**
 * Centralized halachic preset configurations
 *
 * Each halachic custom has default preferences that are automatically applied
 * when the user selects that custom.
 *
 * To add a new custom:
 * 1. Add to HalachicCustom type
 * 2. Add entry to HALACHIC_PRESETS object with default values
 * 3. Update backend schema enum validation
 */
export const HALACHIC_PRESETS: Record<HalachicCustom, HalachicPresetConfig> = {
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
 */
export function applyHalachicPreset(custom: HalachicCustom): HalachicPresetConfig {
  return HALACHIC_PRESETS[custom] || HALACHIC_PRESETS.manual;
}
