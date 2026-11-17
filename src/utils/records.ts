import type {
  AnnotatedPersonalRecord,
  ExerciseRecordGroup,
  PersonalRecord,
  RecordDraft,
  RecordValidationResult,
} from '@/types';

import { estimateOneRmEpley } from './oneRm';

/** Epley estimates outside 2–10 reps are treated as unreliable for display. */
export const RECORD_ONE_RM_MAX_REPS = 10;

function createRecordId(): string {
  return `pr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalize an exercise name for grouping / search.
 * Collapses whitespace and lowercases with pl-PL rules.
 */
export function normalizeExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}

/** Trim and collapse whitespace while preserving the user's casing. */
export function formatExerciseDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** Accept Polish comma decimals; allow zero (e.g. bodyweight). */
export function parseRecordWeight(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '' || trimmed === '.' || trimmed === '-') {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

export function parseRecordReps(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '' || !/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) {
    return false;
  }
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function todayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateRecordDraft(
  draft: Partial<RecordDraft>,
): RecordValidationResult {
  const errors: string[] = [];
  const name = draft.exerciseName == null ? '' : formatExerciseDisplayName(draft.exerciseName);

  if (!name) {
    errors.push('Nazwa ćwiczenia jest wymagana');
  }

  if (
    draft.weightKg == null ||
    !Number.isFinite(draft.weightKg) ||
    draft.weightKg < 0
  ) {
    errors.push('Ciężar musi być liczbą nieujemną');
  }

  if (
    draft.reps == null ||
    !Number.isInteger(draft.reps) ||
    draft.reps <= 0
  ) {
    errors.push('Liczba powtórzeń musi być dodatnią liczbą całkowitą');
  }

  if (draft.date == null || !isValidIsoDate(draft.date)) {
    errors.push('Data musi mieć format RRRR-MM-DD');
  }

  return { ok: errors.length === 0, errors };
}

export function parseAndValidateRecordForm(input: {
  exerciseName: string;
  weightText: string;
  repsText: string;
  dateText: string;
  notes?: string;
}): { ok: true; draft: RecordDraft } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const exerciseName = formatExerciseDisplayName(input.exerciseName);
  if (!exerciseName) {
    errors.push('Nazwa ćwiczenia jest wymagana');
  }

  const weightKg = parseRecordWeight(input.weightText);
  if (weightKg == null) {
    errors.push('Ciężar musi być liczbą nieujemną');
  }

  const reps = parseRecordReps(input.repsText);
  if (reps == null) {
    errors.push('Liczba powtórzeń musi być dodatnią liczbą całkowitą');
  }

  const date = input.dateText.trim();
  if (!isValidIsoDate(date)) {
    errors.push('Data musi mieć format RRRR-MM-DD');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const notes = input.notes?.trim();
  return {
    ok: true,
    draft: {
      exerciseName,
      weightKg: weightKg!,
      reps: reps!,
      date,
      notes: notes ? notes : undefined,
    },
  };
}

export function createPersonalRecord(
  draft: RecordDraft,
  nowIso: string = new Date().toISOString(),
): PersonalRecord {
  const validation = validateRecordDraft(draft);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const exerciseName = formatExerciseDisplayName(draft.exerciseName);
  return {
    id: createRecordId(),
    exerciseName,
    exerciseKey: normalizeExerciseName(exerciseName),
    exerciseId: draft.exerciseId ?? null,
    weightKg: draft.weightKg,
    reps: draft.reps,
    date: draft.date,
    notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function applyRecordDraft(
  existing: PersonalRecord,
  draft: RecordDraft,
  nowIso: string = new Date().toISOString(),
): PersonalRecord {
  const validation = validateRecordDraft(draft);
  if (!validation.ok) {
    throw new Error(validation.errors.join('; '));
  }

  const exerciseName = formatExerciseDisplayName(draft.exerciseName);
  return {
    ...existing,
    exerciseName,
    exerciseKey: normalizeExerciseName(exerciseName),
    exerciseId:
      draft.exerciseId !== undefined ? draft.exerciseId : existing.exerciseId,
    weightKg: draft.weightKg,
    reps: draft.reps,
    date: draft.date,
    notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
    updatedAt: nowIso,
  };
}

/**
 * Chronological compare. Same calendar date → createdAt → id (stable).
 */
export function compareRecordsChronologically(
  a: PersonalRecord,
  b: PersonalRecord,
  direction: 'asc' | 'desc' = 'asc',
): number {
  const sign = direction === 'asc' ? 1 : -1;
  const dateCmp = a.date.localeCompare(b.date);
  if (dateCmp !== 0) {
    return dateCmp * sign;
  }
  const createdCmp = a.createdAt.localeCompare(b.createdAt);
  if (createdCmp !== 0) {
    return createdCmp * sign;
  }
  return a.id.localeCompare(b.id) * sign;
}

export function sortRecordsChronologically(
  records: readonly PersonalRecord[],
  direction: 'asc' | 'desc' = 'desc',
): PersonalRecord[] {
  return [...records].sort((a, b) =>
    compareRecordsChronologically(a, b, direction),
  );
}

/** Best weight among entries with the same rep count (null if empty). */
export function findBestWeightForReps(
  records: readonly PersonalRecord[],
  reps: number,
): number | null {
  let best: number | null = null;
  for (const record of records) {
    if (record.reps !== reps) {
      continue;
    }
    if (best == null || record.weightKg > best) {
      best = record.weightKg;
    }
  }
  return best;
}

/** Entry ids that currently hold the best weight for their rep count (ties included). */
export function findCurrentPrIds(
  records: readonly PersonalRecord[],
): Set<string> {
  const bestByReps = new Map<number, number>();
  for (const record of records) {
    const current = bestByReps.get(record.reps);
    if (current == null || record.weightKg > current) {
      bestByReps.set(record.reps, record.weightKg);
    }
  }

  const ids = new Set<string>();
  for (const record of records) {
    if (bestByReps.get(record.reps) === record.weightKg) {
      ids.add(record.id);
    }
  }
  return ids;
}

/**
 * Entry ids that strictly raised the then-best weight for their rep count
 * when ordered by performance date (then createdAt, then id).
 */
export function findHistoricalPrIds(
  records: readonly PersonalRecord[],
): Set<string> {
  const sorted = sortRecordsChronologically(records, 'asc');
  const bestByReps = new Map<number, number>();
  const ids = new Set<string>();

  for (const record of sorted) {
    const previous = bestByReps.get(record.reps);
    if (previous == null || record.weightKg > previous) {
      ids.add(record.id);
      bestByReps.set(record.reps, record.weightKg);
    }
  }

  return ids;
}

export function countPrTiesByReps(
  records: readonly PersonalRecord[],
): Map<number, number> {
  const currentIds = findCurrentPrIds(records);
  const counts = new Map<number, number>();
  for (const record of records) {
    if (!currentIds.has(record.id)) {
      continue;
    }
    counts.set(record.reps, (counts.get(record.reps) ?? 0) + 1);
  }
  return counts;
}

/**
 * Actual lifted 1RM (reps === 1) or Epley estimate for 2–10 reps.
 * Returns null outside the reliable range or for non-positive weight.
 */
export function getRecordOneRm(
  weightKg: number,
  reps: number,
): { kind: 'actual' | 'estimated'; valueKg: number } | null {
  if (!(weightKg > 0) || !Number.isInteger(reps) || reps < 1) {
    return null;
  }
  if (reps === 1) {
    return { kind: 'actual', valueKg: weightKg };
  }
  if (reps > RECORD_ONE_RM_MAX_REPS) {
    return null;
  }
  const estimated = estimateOneRmEpley(weightKg, reps);
  if (estimated == null) {
    return null;
  }
  return { kind: 'estimated', valueKg: estimated };
}

export function annotateRecords(
  records: readonly PersonalRecord[],
): AnnotatedPersonalRecord[] {
  const currentPrIds = findCurrentPrIds(records);
  const historicalPrIds = findHistoricalPrIds(records);
  const tieCounts = countPrTiesByReps(records);

  return sortRecordsChronologically(records, 'desc').map((record) => {
    const oneRm = getRecordOneRm(record.weightKg, record.reps);
    const isCurrentPr = currentPrIds.has(record.id);
    return {
      ...record,
      isCurrentPr,
      isHistoricalPr: historicalPrIds.has(record.id),
      isPrTie: isCurrentPr && (tieCounts.get(record.reps) ?? 0) > 1,
      oneRmKg: oneRm?.valueKg ?? null,
      oneRmKind: oneRm?.kind ?? null,
    };
  });
}

function pickPreferredExerciseName(entries: readonly PersonalRecord[]): string {
  if (entries.length === 0) {
    return '';
  }
  const newest = sortRecordsChronologically(entries, 'desc')[0]!;
  return newest.exerciseName;
}

function pickHighlight(entries: readonly PersonalRecord[]): PersonalRecord | null {
  if (entries.length === 0) {
    return null;
  }
  return [...entries].sort((a, b) => {
    if (b.weightKg !== a.weightKg) {
      return b.weightKg - a.weightKg;
    }
    return compareRecordsChronologically(a, b, 'desc');
  })[0]!;
}

export function groupRecordsByExercise(
  records: readonly PersonalRecord[],
): ExerciseRecordGroup[] {
  const buckets = new Map<string, PersonalRecord[]>();

  for (const record of records) {
    const key = record.exerciseKey || normalizeExerciseName(record.exerciseName);
    const list = buckets.get(key);
    if (list) {
      list.push(record);
    } else {
      buckets.set(key, [record]);
    }
  }

  const groups: ExerciseRecordGroup[] = [];
  for (const [exerciseKey, entries] of buckets) {
    const sorted = sortRecordsChronologically(entries, 'desc');
    groups.push({
      exerciseKey,
      exerciseName: pickPreferredExerciseName(sorted),
      entries: sorted,
      lastTrainedDate: sorted[0]?.date ?? '',
      entryCount: sorted.length,
      highlight: pickHighlight(sorted),
    });
  }

  return groups.sort((a, b) => {
    const dateCmp = b.lastTrainedDate.localeCompare(a.lastTrainedDate);
    if (dateCmp !== 0) {
      return dateCmp;
    }
    return a.exerciseName.localeCompare(b.exerciseName, 'pl');
  });
}

export function filterExerciseGroups(
  groups: readonly ExerciseRecordGroup[],
  query: string,
): ExerciseRecordGroup[] {
  const normalized = normalizeExerciseName(query);
  if (!normalized) {
    return [...groups];
  }
  return groups.filter(
    (group) =>
      normalizeExerciseName(group.exerciseName).includes(normalized) ||
      group.exerciseKey.includes(normalized),
  );
}

export function upsertPersonalRecord(
  records: readonly PersonalRecord[],
  next: PersonalRecord,
): PersonalRecord[] {
  const index = records.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [...records, next];
  }
  const copy = [...records];
  copy[index] = next;
  return copy;
}

export function removePersonalRecord(
  records: readonly PersonalRecord[],
  id: string,
): PersonalRecord[] {
  return records.filter((item) => item.id !== id);
}

export function findRecordById(
  records: readonly PersonalRecord[],
  id: string,
): PersonalRecord | undefined {
  return records.find((item) => item.id === id);
}

export function formatWeightReps(weightKg: number, reps: number): string {
  const weight =
    Number.isFinite(weightKg) && Number.isInteger(weightKg)
      ? String(weightKg)
      : Number.isFinite(weightKg)
        ? String(Number(weightKg.toFixed(2))).replace(/\.?0+$/, '')
        : '—';
  return `${weight} kg × ${reps}`;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) {
    return isoDate;
  }
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

/** Soft type guard used when reading persisted payloads. */
export function isPersonalRecordLike(value: unknown): value is PersonalRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.exerciseName === 'string' &&
    typeof record.exerciseKey === 'string' &&
    typeof record.weightKg === 'number' &&
    Number.isFinite(record.weightKg) &&
    typeof record.reps === 'number' &&
    Number.isInteger(record.reps) &&
    typeof record.date === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}
