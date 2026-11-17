export type {
  IntensityRow,
  OneRmFormula,
  OneRmInput,
  OneRmValidationResult,
} from './oneRm';

export type {
  NearestTotals,
  PlateConverterMode,
  PlateCount,
  PlateFromCountsResult,
  PlateSolution,
  PlateTargetResult,
  PlateValidationResult,
} from './plates';

export type {
  TimerConfig,
  TimerCueKind,
  TimerPhase,
  TimerRunStatus,
  TimerSegment,
  TimerSnapshot,
  TimerValidationResult,
} from './timer';

export type WeightUnit = 'kg' | 'lb';

export type ExerciseSource = 'wger' | 'custom';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  source: ExerciseSource;
  isCustom: boolean;
}

export interface WorkoutPlanItem {
  exerciseId: string;
  order: number;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: WorkoutPlanItem[];
}

/**
 * Single logged performance (weight × reps).
 * `exerciseKey` groups entries; `exerciseName` keeps the readable label.
 * Optional `exerciseId` reserved for future catalog / plan linkage.
 */
export interface PersonalRecord {
  id: string;
  exerciseName: string;
  /** Normalized key for grouping (case/whitespace insensitive). */
  exerciseKey: string;
  /** Optional future link to `Exercise.id` / wger — unused in MVP. */
  exerciseId?: string | null;
  weightKg: number;
  reps: number;
  /** Performance date as YYYY-MM-DD. */
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordDraft {
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
  notes?: string;
  exerciseId?: string | null;
}

export interface RecordValidationResult {
  ok: boolean;
  errors: string[];
}

export interface ExerciseRecordGroup {
  exerciseKey: string;
  exerciseName: string;
  entries: PersonalRecord[];
  lastTrainedDate: string;
  entryCount: number;
  /** Heaviest logged set for the card summary. */
  highlight: PersonalRecord | null;
}

export interface AnnotatedPersonalRecord extends PersonalRecord {
  /** Best weight currently held for this entry's rep count. */
  isCurrentPr: boolean;
  /** Strictly improved the then-best for this rep count when logged. */
  isHistoricalPr: boolean;
  /** Shares the current best weight for this rep count with another entry. */
  isPrTie: boolean;
  /** Actual 1-rep load or Epley estimate within the reliable range. */
  oneRmKg: number | null;
  oneRmKind: 'actual' | 'estimated' | null;
}

/** Single body-weight measurement (one per calendar day). */
export interface BodyWeightEntry {
  id: string;
  /** Measurement date as YYYY-MM-DD. */
  date: string;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
}

export interface BodyWeightDraft {
  date: string;
  weightKg: number;
}

/**
 * Optional user goal. Used only to describe the observed weight trend —
 * never to recommend a diet or a target weight.
 */
export type BodyGoal = 'cut' | 'maintain' | 'gain';

/** BMI band relative to the WHO adult reference ranges (orientation only). */
export type BmiBand = 'below' | 'reference' | 'above' | 'wellAbove';

export interface BmiResult {
  /** BMI rounded to one decimal place. */
  value: number;
  band: BmiBand;
}

export type WeightTrendDirection = 'down' | 'stable' | 'up';

export type WeightTrend =
  | {
      status: 'insufficient';
      /** Why no trend is shown (too few entries / too short span). */
      reason: 'noData' | 'singleEntry' | 'shortSpan';
    }
  | {
      status: 'ok';
      direction: WeightTrendDirection;
      /** Latest minus first weight within the window, kg. */
      changeKg: number;
      /** Average change per 7 days, kg. */
      weeklyChangeKg: number;
      /** Days between the first and last measurement in the window. */
      spanDays: number;
      fromDate: string;
      toDate: string;
    };

export interface TimerPreset {
  id: string;
  name: string;
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  warmupSeconds?: number;
}

export interface UserSettings {
  heightCm: number | null;
  /** Optional goal used only to describe the body-weight trend. */
  bodyGoal: BodyGoal | null;
  preferredUnit: WeightUnit;
  availablePlatesKg: number[];
  theme: 'system' | 'light' | 'dark';
}

export interface StoredPayload<T> {
  schemaVersion: number;
  updatedAt: string;
  data: T;
}
