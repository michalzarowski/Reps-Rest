import type { TimerPreset } from '@/types';
import {
  mergePresetLists,
  removeCustomPreset,
  upsertCustomPreset,
} from '@/utils/timerPresets';

import { StorageError, getItem, setItem, storageKeys } from './storage';

export async function loadCustomTimerPresets(): Promise<TimerPreset[]> {
  try {
    const stored = await getItem<TimerPreset[]>(storageKeys.timerPresets);
    if (!Array.isArray(stored)) {
      return [];
    }
    return stored.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.rounds === 'number' &&
        typeof item.workSeconds === 'number' &&
        typeof item.restSeconds === 'number',
    );
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Nie udało się wczytać presetów timera', error);
  }
}

export async function saveCustomTimerPresets(
  presets: readonly TimerPreset[],
): Promise<void> {
  await setItem(storageKeys.timerPresets, [...presets]);
}

export async function listAllTimerPresets(): Promise<TimerPreset[]> {
  const custom = await loadCustomTimerPresets();
  return mergePresetLists(custom);
}

export async function persistCustomPreset(
  preset: TimerPreset,
): Promise<TimerPreset[]> {
  const custom = await loadCustomTimerPresets();
  const next = upsertCustomPreset(custom, preset);
  await saveCustomTimerPresets(next);
  return mergePresetLists(next);
}

export async function deleteCustomPreset(id: string): Promise<TimerPreset[]> {
  const custom = await loadCustomTimerPresets();
  const next = removeCustomPreset(custom, id);
  await saveCustomTimerPresets(next);
  return mergePresetLists(next);
}
