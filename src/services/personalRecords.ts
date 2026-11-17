import type { PersonalRecord } from '@/types';
import { isPersonalRecordLike } from '@/utils/records';

import { StorageError, getItem, setItem, storageKeys } from './storage';

/**
 * Load personal records from AsyncStorage.
 * Returns [] when the key is missing. Throws StorageError on I/O / parse failure
 * so callers can keep any in-memory state instead of wiping user data.
 */
export async function loadPersonalRecords(): Promise<PersonalRecord[]> {
  try {
    const stored = await getItem<unknown>(storageKeys.personalRecords);
    if (stored == null) {
      return [];
    }
    if (!Array.isArray(stored)) {
      throw new StorageError(
        'Nieprawidłowy format dziennika rekordów w pamięci lokalnej',
      );
    }

    const valid: PersonalRecord[] = [];
    for (const item of stored) {
      if (isPersonalRecordLike(item)) {
        valid.push({
          id: item.id,
          exerciseName: item.exerciseName,
          exerciseKey: item.exerciseKey,
          exerciseId: item.exerciseId ?? null,
          weightKg: item.weightKg,
          reps: item.reps,
          date: item.date,
          notes: typeof item.notes === 'string' ? item.notes : undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
    }

    // If nothing validated but payload was non-empty, treat as corrupt — do not wipe.
    if (stored.length > 0 && valid.length === 0) {
      throw new StorageError(
        'Nie udało się odczytać dziennika rekordów (uszkodzone dane)',
      );
    }

    return valid;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Nie udało się wczytać dziennika rekordów', error);
  }
}

export async function savePersonalRecords(
  records: readonly PersonalRecord[],
): Promise<void> {
  try {
    await setItem(storageKeys.personalRecords, [...records]);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Nie udało się zapisać dziennika rekordów', error);
  }
}
