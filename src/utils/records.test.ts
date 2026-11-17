import { describe, expect, it } from 'vitest';

import type { PersonalRecord, RecordDraft } from '@/types';

import {
  annotateRecords,
  applyRecordDraft,
  createPersonalRecord,
  filterExerciseGroups,
  findBestWeightForReps,
  findCurrentPrIds,
  findHistoricalPrIds,
  formatExerciseDisplayName,
  getRecordOneRm,
  groupRecordsByExercise,
  isValidIsoDate,
  normalizeExerciseName,
  parseAndValidateRecordForm,
  parseRecordReps,
  parseRecordWeight,
  removePersonalRecord,
  sortRecordsChronologically,
  upsertPersonalRecord,
  validateRecordDraft,
} from './records';

function draft(partial: Partial<RecordDraft> & Pick<RecordDraft, 'exerciseName'>): RecordDraft {
  return {
    weightKg: 100,
    reps: 5,
    date: '2026-01-10',
    ...partial,
  };
}

function record(
  partial: Partial<PersonalRecord> &
    Pick<PersonalRecord, 'id' | 'exerciseName' | 'weightKg' | 'reps' | 'date'>,
): PersonalRecord {
  const exerciseName = formatExerciseDisplayName(partial.exerciseName);
  return {
    exerciseKey: normalizeExerciseName(exerciseName),
    createdAt: partial.createdAt ?? `${partial.date}T10:00:00.000Z`,
    updatedAt: partial.updatedAt ?? `${partial.date}T10:00:00.000Z`,
    ...partial,
    exerciseName,
  };
}

describe('normalizeExerciseName', () => {
  it('collapses case and whitespace for grouping', () => {
    expect(normalizeExerciseName('  Wyciskanie   Leżąc ')).toBe(
      normalizeExerciseName('wyciskanie leżąc'),
    );
    expect(normalizeExerciseName('Bench Press')).toBe('bench press');
  });
});

describe('record form validation', () => {
  it('accepts a valid draft', () => {
    expect(validateRecordDraft(draft({ exerciseName: 'Squat' })).ok).toBe(true);
  });

  it('rejects empty names and invalid numbers', () => {
    expect(validateRecordDraft(draft({ exerciseName: '   ' })).ok).toBe(false);
    expect(validateRecordDraft(draft({ exerciseName: 'Squat', weightKg: -1 })).ok).toBe(
      false,
    );
    expect(validateRecordDraft(draft({ exerciseName: 'Squat', reps: 0 })).ok).toBe(
      false,
    );
    expect(validateRecordDraft(draft({ exerciseName: 'Squat', reps: 2.5 })).ok).toBe(
      false,
    );
  });

  it('rejects invalid dates', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('10-01-2026')).toBe(false);
    expect(
      validateRecordDraft(draft({ exerciseName: 'Squat', date: '2026-13-01' })).ok,
    ).toBe(false);
  });

  it('parses Polish decimal commas and form strings', () => {
    expect(parseRecordWeight('82,5')).toBe(82.5);
    expect(parseRecordWeight('0')).toBe(0);
    expect(parseRecordWeight('-5')).toBeNull();
    expect(parseRecordReps('5')).toBe(5);
    expect(parseRecordReps('0')).toBeNull();

    const parsed = parseAndValidateRecordForm({
      exerciseName: '  Deadlift ',
      weightText: '140,5',
      repsText: '3',
      dateText: '2026-03-01',
      notes: '  belt  ',
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.draft.exerciseName).toBe('Deadlift');
      expect(parsed.draft.weightKg).toBe(140.5);
      expect(parsed.draft.notes).toBe('belt');
    }
  });
});

describe('grouping and chronology', () => {
  it('groups by normalized exercise name and keeps display casing', () => {
    const records = [
      record({
        id: 'a',
        exerciseName: 'Bench Press',
        weightKg: 80,
        reps: 5,
        date: '2026-01-01',
      }),
      record({
        id: 'b',
        exerciseName: '  bench   press ',
        weightKg: 85,
        reps: 5,
        date: '2026-01-08',
        createdAt: '2026-01-08T12:00:00.000Z',
      }),
      record({
        id: 'c',
        exerciseName: 'Squat',
        weightKg: 120,
        reps: 3,
        date: '2026-01-05',
      }),
    ];

    const groups = groupRecordsByExercise(records);
    expect(groups).toHaveLength(2);
    const bench = groups.find((g) => g.exerciseKey === 'bench press');
    expect(bench?.entryCount).toBe(2);
    expect(bench?.exerciseName).toBe('bench press');
    expect(bench?.lastTrainedDate).toBe('2026-01-08');
  });

  it('sorts newest first by default', () => {
    const records = [
      record({
        id: 'old',
        exerciseName: 'Row',
        weightKg: 60,
        reps: 8,
        date: '2026-01-01',
        createdAt: '2026-01-01T08:00:00.000Z',
      }),
      record({
        id: 'new',
        exerciseName: 'Row',
        weightKg: 65,
        reps: 8,
        date: '2026-01-02',
        createdAt: '2026-01-02T08:00:00.000Z',
      }),
      record({
        id: 'same-day-later',
        exerciseName: 'Row',
        weightKg: 62,
        reps: 8,
        date: '2026-01-02',
        createdAt: '2026-01-02T18:00:00.000Z',
      }),
    ];

    const sorted = sortRecordsChronologically(records, 'desc');
    expect(sorted.map((r) => r.id)).toEqual(['same-day-later', 'new', 'old']);
  });

  it('handles empty history and search filtering', () => {
    expect(groupRecordsByExercise([])).toEqual([]);
    const groups = groupRecordsByExercise([
      record({
        id: '1',
        exerciseName: 'OHP',
        weightKg: 50,
        reps: 5,
        date: '2026-01-01',
      }),
    ]);
    expect(filterExerciseGroups(groups, 'oh')).toHaveLength(1);
    expect(filterExerciseGroups(groups, 'squat')).toHaveLength(0);
  });
});

describe('PR detection', () => {
  const benchHistory = [
    record({
      id: 'b1',
      exerciseName: 'Bench Press',
      weightKg: 80,
      reps: 5,
      date: '2026-01-01',
      createdAt: '2026-01-01T10:00:00.000Z',
    }),
    record({
      id: 'b2',
      exerciseName: 'Bench Press',
      weightKg: 85,
      reps: 5,
      date: '2026-01-08',
      createdAt: '2026-01-08T10:00:00.000Z',
    }),
    record({
      id: 'b3',
      exerciseName: 'Bench Press',
      weightKg: 90,
      reps: 3,
      date: '2026-01-10',
      createdAt: '2026-01-10T10:00:00.000Z',
    }),
    record({
      id: 'b4',
      exerciseName: 'Bench Press',
      weightKg: 82,
      reps: 5,
      date: '2026-01-12',
      createdAt: '2026-01-12T10:00:00.000Z',
    }),
  ];

  it('finds best weight for a specific rep count', () => {
    expect(findBestWeightForReps(benchHistory, 5)).toBe(85);
    expect(findBestWeightForReps(benchHistory, 3)).toBe(90);
    expect(findBestWeightForReps(benchHistory, 1)).toBeNull();
  });

  it('marks the next PR and ignores weaker sets', () => {
    const current = findCurrentPrIds(benchHistory);
    expect(current.has('b2')).toBe(true);
    expect(current.has('b3')).toBe(true);
    expect(current.has('b4')).toBe(false);
    expect(current.has('b1')).toBe(false);

    const historical = findHistoricalPrIds(benchHistory);
    expect(historical.has('b1')).toBe(true);
    expect(historical.has('b2')).toBe(true);
    expect(historical.has('b3')).toBe(true);
    expect(historical.has('b4')).toBe(false);
  });

  it('recognizes historical PR and ties with the current record', () => {
    const withTie = [
      ...benchHistory,
      record({
        id: 'b5',
        exerciseName: 'Bench Press',
        weightKg: 85,
        reps: 5,
        date: '2026-01-20',
        createdAt: '2026-01-20T10:00:00.000Z',
      }),
    ];

    const annotated = annotateRecords(withTie);
    const tie = annotated.find((r) => r.id === 'b5');
    const earlierBest = annotated.find((r) => r.id === 'b2');
    const weak = annotated.find((r) => r.id === 'b4');

    expect(tie?.isCurrentPr).toBe(true);
    expect(tie?.isPrTie).toBe(true);
    expect(tie?.isHistoricalPr).toBe(false);
    expect(earlierBest?.isCurrentPr).toBe(true);
    expect(earlierBest?.isHistoricalPr).toBe(true);
    expect(weak?.isCurrentPr).toBe(false);
    expect(weak?.isHistoricalPr).toBe(false);
  });

  it('recalculates PRs after edit and delete', () => {
    let records = [...benchHistory];
    const edited = applyRecordDraft(
      records.find((r) => r.id === 'b4')!,
      draft({
        exerciseName: 'Bench Press',
        weightKg: 95,
        reps: 5,
        date: '2026-01-12',
      }),
      '2026-01-12T12:00:00.000Z',
    );
    records = upsertPersonalRecord(records, edited);

    expect(findCurrentPrIds(records).has('b4')).toBe(true);
    expect(findCurrentPrIds(records).has('b2')).toBe(false);
    expect(findBestWeightForReps(records, 5)).toBe(95);

    records = removePersonalRecord(records, 'b4');
    expect(findCurrentPrIds(records).has('b2')).toBe(true);
    expect(findBestWeightForReps(records, 5)).toBe(85);
  });

  it('moves an entry to another exercise group after rename', () => {
    const created = createPersonalRecord(
      draft({ exerciseName: 'Bench Press', weightKg: 100, reps: 1, date: '2026-02-01' }),
      '2026-02-01T10:00:00.000Z',
    );
    let records = [created];
    const renamed = applyRecordDraft(
      created,
      draft({ exerciseName: 'Floor Press', weightKg: 100, reps: 1, date: '2026-02-01' }),
      '2026-02-01T11:00:00.000Z',
    );
    records = upsertPersonalRecord(records, renamed);

    const groups = groupRecordsByExercise(records);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.exerciseKey).toBe('floor press');
    expect(groups[0]?.exerciseName).toBe('Floor Press');
  });
});

describe('estimated 1RM presentation', () => {
  it('reports actual 1RM for single reps and Epley within range', () => {
    expect(getRecordOneRm(100, 1)).toEqual({ kind: 'actual', valueKg: 100 });
    const estimated = getRecordOneRm(100, 5);
    expect(estimated?.kind).toBe('estimated');
    expect(estimated?.valueKg).toBeCloseTo(116.6667, 3);
  });

  it('hides misleading estimates outside the reliable range', () => {
    expect(getRecordOneRm(100, 12)).toBeNull();
    expect(getRecordOneRm(0, 5)).toBeNull();
    expect(getRecordOneRm(-10, 5)).toBeNull();
  });
});
