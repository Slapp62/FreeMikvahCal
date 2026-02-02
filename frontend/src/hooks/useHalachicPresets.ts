import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { HALACHIC_PRESETS, HalachicCustom } from '../constants/halachicPresets';

/**
 * Hook to automatically apply halachic preset values when halachicCustom changes
 *
 * Usage:
 * ```typescript
 * const halachicCustom = watch('halachicCustom');
 * useHalachicPresets(halachicCustom, setValue);
 * ```
 *
 * When the user selects a halachic custom (ashkenazi, sephardi, chabad),
 * this hook automatically applies the corresponding preset values for:
 * - minimumNiddahDays
 * - ohrZaruah
 * - beinonit_24hr
 * - beinonit_31
 *
 * When 'manual' is selected, no auto-updates occur (user has full control).
 *
 * @param halachicCustom - Current halachic custom value
 * @param setValue - React Hook Form setValue function
 */
export function useHalachicPresets(
  halachicCustom: HalachicCustom | undefined | null,
  setValue: UseFormSetValue<any>
) {
  useEffect(() => {
    // Don't auto-update if no custom selected or if manual mode
    if (!halachicCustom || halachicCustom === 'manual') return;

    const preset = HALACHIC_PRESETS[halachicCustom];

    // Apply all preset values to halachicPreferences
    Object.entries(preset).forEach(([key, value]) => {
      setValue(`halachicPreferences.${key}`, value);
    });
  }, [halachicCustom, setValue]);
}
