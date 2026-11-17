import type { AnnotatedPersonalRecord, PersonalRecord } from '@/types';

import {
  annotateRecords,
  compareRecordsChronologically,
  groupRecordsByExercise,
} from './records';

export interface RecordsOverview {
  exerciseCount: number;
  entryCount: number;
  /** Entries that set a new best for their rep count when logged, newest first. */
  recentPrs: AnnotatedPersonalRecord[];
}

/**
 * Read-only summary of the PR log for dashboard / progress screens.
 * Reuses the existing per-exercise PR annotation — no new statistics.
 */
export function buildRecordsOverview(
  records: readonly PersonalRecord[],
  limit = 5,
): RecordsOverview {
  const groups = groupRecordsByExercise([...records]);
  const prs = groups
    .flatMap((group) => annotateRecords(group.entries))
    .filter((entry) => entry.isHistoricalPr)
    .sort((a, b) => compareRecordsChronologically(a, b, 'desc'));

  return {
    exerciseCount: groups.length,
    entryCount: records.length,
    recentPrs: prs.slice(0, Math.max(0, limit)),
  };
}
