import { STORAGE_SCHEMA_VERSION } from '@/constants';
import type { StoredPayload } from '@/types';

/**
 * Placeholder for future schema migrations.
 * Keep storage reads flowing through this helper so version bumps stay centralized.
 */
export function migrateStoredPayload<T>(
  payload: StoredPayload<T>,
): StoredPayload<T> {
  if (payload.schemaVersion === STORAGE_SCHEMA_VERSION) {
    return payload;
  }

  // Future migrations: transform payload.data step-by-step up to STORAGE_SCHEMA_VERSION.
  return {
    ...payload,
    schemaVersion: STORAGE_SCHEMA_VERSION,
  };
}
