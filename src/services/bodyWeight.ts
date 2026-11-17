import type { BodyWeightEntry } from '@/types';
import { isBodyWeightEntryLike, sortBodyWeightEntries } from '@/utils/bodyWeight';

import { StorageError, getItem, setItem, storageKeys } from './storage';

/**
 * Load body-weight history from AsyncStorage (newest first).
 * Returns [] when the key is missing. Throws StorageError on I/O / parse failure
 * so callers can keep in-memory state instead of wiping user data.
 */
export async function loadBodyWeightEntries(): Promise<BodyWeightEntry[]> {
  try {
    const stored = await getItem<unknown>(storageKeys.bodyWeight);
    if (stored == null) {
      return [];
    }
    if (!Array.isArray(stored)) {
      throw new StorageError('Nieprawidłowy format historii masy ciała w pamięci lokalnej');
    }

    const valid: BodyWeightEntry[] = [];
    for (const item of stored) {
      if (isBodyWeightEntryLike(item)) {
        valid.push({
          id: item.id,
          date: item.date,
          weightKg: item.weightKg,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
    }

    // Non-empty payload with nothing valid is treated as corrupt — do not wipe.
    if (stored.length > 0 && valid.length === 0) {
      throw new StorageError('Nie udało się odczytać historii masy ciała (uszkodzone dane)');
    }

    return sortBodyWeightEntries(valid);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Nie udało się wczytać historii masy ciała', error);
  }
}

export async function saveBodyWeightEntries(
  entries: readonly BodyWeightEntry[],
): Promise<void> {
  try {
    await setItem(storageKeys.bodyWeight, [...entries]);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Nie udało się zapisać historii masy ciała', error);
  }
}
