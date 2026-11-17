import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_SCHEMA_VERSION } from '@/constants';
import type { StoredPayload } from '@/types';

import { migrateStoredPayload } from './migrations';
import type { StorageKey } from './keys';

export class StorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

function wrapPayload<T>(data: T): StoredPayload<T> {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
}

export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredPayload<T>;
    const migrated = migrateStoredPayload(parsed);
    return migrated.data;
  } catch (error) {
    throw new StorageError(`Failed to read key "${key}"`, error);
  }
}

export async function setItem<T>(key: StorageKey, data: T): Promise<void> {
  try {
    const payload = wrapPayload(data);
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    throw new StorageError(`Failed to write key "${key}"`, error);
  }
}

export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw new StorageError(`Failed to remove key "${key}"`, error);
  }
}
