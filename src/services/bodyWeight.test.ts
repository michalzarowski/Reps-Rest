import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BodyWeightEntry } from '@/types';

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
      bodyWeight: 'repsrest:body_weight',
    },
  };
});

import { StorageError } from './storage';
import { loadBodyWeightEntries, saveBodyWeightEntries } from './bodyWeight';

function sample(id: string, date: string, weightKg = 80): BodyWeightEntry {
  return {
    id,
    date,
    weightKg,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  };
}

describe('bodyWeight storage service', () => {
  beforeEach(() => {
    getItem.mockReset();
    setItem.mockReset();
  });

  it('returns an empty list when nothing is stored', async () => {
    getItem.mockResolvedValueOnce(null);
    await expect(loadBodyWeightEntries()).resolves.toEqual([]);
  });

  it('keeps valid entries, drops malformed ones and sorts newest first', async () => {
    getItem.mockResolvedValueOnce([
      sample('old', '2026-01-01'),
      { id: 'bad', date: 'yesterday', weightKg: 80 },
      sample('new', '2026-02-01'),
      null,
    ]);
    const loaded = await loadBodyWeightEntries();
    expect(loaded.map((e) => e.id)).toEqual(['new', 'old']);
  });

  it('migrates legacy entries without timestamps as invalid but keeps the rest', async () => {
    getItem.mockResolvedValueOnce([
      { id: 'legacy', date: '2026-01-01', weightKg: 80 },
      sample('ok', '2026-01-02'),
    ]);
    const loaded = await loadBodyWeightEntries();
    expect(loaded.map((e) => e.id)).toEqual(['ok']);
  });

  it('does not treat a fully corrupt payload as empty history', async () => {
    getItem.mockResolvedValueOnce([{ broken: true }]);
    await expect(loadBodyWeightEntries()).rejects.toBeInstanceOf(StorageError);
  });

  it('rejects a non-array payload', async () => {
    getItem.mockResolvedValueOnce({ weight: 80 });
    await expect(loadBodyWeightEntries()).rejects.toBeInstanceOf(StorageError);
  });

  it('surfaces read failures', async () => {
    getItem.mockRejectedValueOnce(new StorageError('disk failed'));
    await expect(loadBodyWeightEntries()).rejects.toBeInstanceOf(StorageError);
  });

  it('persists entries through setItem', async () => {
    setItem.mockResolvedValueOnce(undefined);
    const entries = [sample('a', '2026-01-02'), sample('b', '2026-01-01')];
    await saveBodyWeightEntries(entries);
    expect(setItem).toHaveBeenCalledWith('repsrest:body_weight', entries);
  });

  it('surfaces write failures', async () => {
    setItem.mockRejectedValueOnce(new StorageError('write failed'));
    await expect(saveBodyWeightEntries([sample('a', '2026-01-01')])).rejects.toBeInstanceOf(
      StorageError,
    );
  });
});
