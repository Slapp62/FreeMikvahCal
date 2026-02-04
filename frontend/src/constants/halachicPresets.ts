export type HalachicCustom = 'ashkenazi_EY' | 'ashkenazi_CL' | 'sephardi_ROY' | 'sephard_RME' | 'manual';

export interface HalachicPresetConfig {
  minimumNiddahDays: number;
  ohrZaruah: boolean;
  beinonit_24hr: boolean;
  beinonit_31: boolean;
  vesetHachodesh30thSkip29: boolean;
  haflagahDualMode: 'latest_only' | 'keep_both';
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
  ashkenazi_EY: {
    minimumNiddahDays: 5,
    beinonit_24hr: true,     // Kreisi U'Pleisi - 24-hour onah beinonit (day 30)
    beinonit_31: true,       // Also observe day 31
    ohrZaruah: false,        // Separate on preceding onah for all vesetim
    vesetHachodesh30thSkip29: true,
    haflagahDualMode: 'keep_both',
  },
  ashkenazi_CL: {
    minimumNiddahDays: 5,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: true,
    vesetHachodesh30thSkip29: false,
    haflagahDualMode: 'latest_only',
  },
  sephardi_ROY: {
    minimumNiddahDays: 4,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
    vesetHachodesh30thSkip29: false,
    haflagahDualMode: 'latest_only',
  },
  sephard_RME: {
    minimumNiddahDays: 4,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
    vesetHachodesh30thSkip29: false,
    haflagahDualMode: 'latest_only',
  },
  manual: {
    minimumNiddahDays: 5,
    beinonit_24hr: false,
    beinonit_31: false,
    ohrZaruah: false,
    vesetHachodesh30thSkip29: false,
    haflagahDualMode: 'latest_only',
  },
};

/**
 * Apply halachic preset for given custom
 * Falls back to 'manual' preset if custom is invalid
 */
export function applyHalachicPreset(custom: HalachicCustom): HalachicPresetConfig {
  return HALACHIC_PRESETS[custom] || HALACHIC_PRESETS.manual;
}
