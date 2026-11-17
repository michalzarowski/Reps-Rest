import { describe, expect, it } from 'vitest';

import type { PersonalRecord } from '@/types';

import { buildRecordsOverview } from './recordHighlights';
import { normalizeExerciseName } from './records';

function record(
  id: string,
  exerciseName: string,
  weightKg: number,
  reps: number,
  date: string,
): PersonalRecord {
  return {
    id,
    exerciseName,
    exerciseKey: normalizeExerciseName(exerciseName),
    weightKg,
    reps,
    date,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

describe('buildRecordsOverview', () => {
  it('returns an empty overview for no records', () => {
    expect(buildRecordsOverview([])).toEqual({
      exerciseCount: 0,
      entryCount: 0,
      recentPrs: [],
    });
  });

  it('lists only entries that improved the best for their rep count, newest first', () => {
    const records = [
      record('a', 'Przysiad', 100, 5, '2026-01-01'),
      record('b', 'Przysiad', 95, 5, '2026-01-08'),
      record('c', 'Przysiad', 105, 5, '2026-01-15'),
      record('d', 'Wyciskanie', 80, 3, '2026-01-10'),
    ];
    const overview = buildRecordsOverview(records);
    expect(overview.exerciseCount).toBe(2);
    expect(overview.entryCount).toBe(4);
    expect(overview.recentPrs.map((r) => r.id)).toEqual(['c', 'd', 'a']);
  });

  it('respects the limit', () => {
    const records = [
      record('a', 'Przysiad', 100, 5, '2026-01-01'),
      record('b', 'Martwy ciąg', 140, 3, '2026-01-02'),
    ];
    expect(buildRecordsOverview(records, 1).recentPrs.map((r) => r.id)).toEqual(['b']);
  });
});
