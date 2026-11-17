/** Shared pure helpers (domain formulas belong here for unit testing). */

export {
  BRZYCKI_MAX_REPS,
  ONE_RM_FORMULAS,
  buildIntensityGuide,
  estimateOneRm,
  estimateOneRmBrzycki,
  estimateOneRmEpley,
  validateOneRmInput,
} from './oneRm';

export {
  DEFAULT_BAR_WEIGHT_KG,
  STANDARD_BAR_OPTIONS_KG,
  STANDARD_PLATES_KG,
  formatKg,
  parseNonNegativeInteger,
  parsePositiveNumber,
  solvePlatesToTarget,
  solveTargetToPlates,
  validateBarAndTarget,
} from './plates';

export {
  buildTimeline,
  computePlannedDurations,
  createTimerEngine,
  formatTimerMmSs,
  phaseDisplayName,
  validateTimerConfig,
} from './timerEngine';

export {
  BUILTIN_PRESET_PREFIX,
  BUILTIN_TIMER_PRESETS,
  createCustomPreset,
  isBuiltinPresetId,
  mergePresetLists,
  presetToConfig,
  removeCustomPreset,
  upsertCustomPreset,
  validatePresetInput,
} from './timerPresets';

export {
  createCueTracker,
  detectTimerCues,
  type CueTracker,
} from './timerCueLogic';

export {
  RECORD_ONE_RM_MAX_REPS,
  annotateRecords,
  applyRecordDraft,
  compareRecordsChronologically,
  createPersonalRecord,
  filterExerciseGroups,
  findBestWeightForReps,
  findCurrentPrIds,
  findHistoricalPrIds,
  findRecordById,
  formatDisplayDate,
  formatExerciseDisplayName,
  formatWeightReps,
  getRecordOneRm,
  groupRecordsByExercise,
  isPersonalRecordLike,
  isValidIsoDate,
  normalizeExerciseName,
  parseAndValidateRecordForm,
  parseRecordReps,
  parseRecordWeight,
  removePersonalRecord,
  sortRecordsChronologically,
  todayIsoDate,
  upsertPersonalRecord,
  validateRecordDraft,
} from './records';

export function createId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export { buildRecordsOverview, type RecordsOverview } from './recordHighlights';
