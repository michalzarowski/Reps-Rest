import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PersonalRecord } from '@/types';

const getItem = vi.fn();
const setItem = vi.fn();

vi.mock('./storage', () => {
  class StorageError extends Error {
    constructor(
      message: string,
      readonly cause?: unknown,
    ) {
      super(message);
      this.name = 'StorageError';
    }
  }

  return {
    StorageError,
    getItem: (...args: unknown[]) => getItem(...args),
    setItem: (...args: unknown[]) => setItem(...args),
    storageKeys: {
      personalRecords: 'repsrest:personal_records',
    },
  };
});

import { StorageError } from './storage';
import { loadPersonalRecords, savePersonalRecords } from './personalRecords';

function sampleRecord(id: string): PersonalRecord {
  return {
    id,
    exerciseName: 'Squat',
    exerciseKey: 'squat',
    exerciseId: null,
    weightKg: 140,
    reps: 3,
    date: '2026-01-15',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
  };
}

describe('personalRecords storage service', () => {
  beforeEach(() => {
    getItem.mockReset();
    setItem.mockReset();
  });

  it('returns an empty list when nothing is stored', async () => {
    getItem.mockResolvedValueOnce(null);
    await expect(loadPersonalRecords()).resolves.toEqual([]);
  });

  it('loads valid records and ignores malformed items when some are valid', async () => {
    getItem.mockResolvedValueOnce([
      sampleRecord('ok'),
      { id: 'bad' },
      null,
    ]);

    const loaded = await loadPersonalRecords();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe('ok');
  });

  it('does not treat a fully corrupt payload as an empty journal', async () => {
    getItem.mockResolvedValueOnce([{ broken: true }, 42]);
    await expect(loadPersonalRecords()).rejects.toBeInstanceOf(StorageError);
  });

  it('surfaces read failures without inventing an empty list', async () => {
    getItem.mockRejectedValueOnce(new StorageError('disk failed'));
    await expect(loadPersonalRecords()).rejects.toBeInstanceOf(StorageError);
  });

  it('persists records through setItem', async () => {
    setItem.mockResolvedValueOnce(undefined);
    const records = [sampleRecord('a'), sampleRecord('b')];
    await savePersonalRecords(records);
    expect(setItem).toHaveBeenCalledWith('repsrest:personal_records', records);
  });

  it('surfaces write failures', async () => {
    setItem.mockRejectedValueOnce(new StorageError('write failed'));
    await expect(savePersonalRecords([sampleRecord('a')])).rejects.toBeInstanceOf(
      StorageError,
    );
  });
});
