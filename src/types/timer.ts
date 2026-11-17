/** Domain types for the interval timer engine and presets. */

export type TimerPhase =
  | 'idle'
  | 'preparation'
  | 'work'
  | 'rest'
  | 'completed';

export type TimerRunStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerConfig {
  rounds: number;
  workSeconds: number;
  /** Rest between rounds; 0 skips rest phases. */
  restSeconds: number;
  /** Optional countdown before first work; 0 skips preparation. */
  warmupSeconds: number;
}

export interface TimerSegment {
  kind: 'preparation' | 'work' | 'rest';
  /** 0 for preparation; 1..rounds for work/rest. */
  round: number;
  durationMs: number;
  startOffsetMs: number;
}

export interface TimerSnapshot {
  status: TimerRunStatus;
  phase: TimerPhase;
  /** Current segment index, or -1 when idle/completed. */
  segmentIndex: number;
  currentRound: number;
  totalRounds: number;
  remainingMs: number;
  phaseDurationMs: number;
  /** 0–1 progress within the current phase (elapsed / duration). */
  phaseProgress: number;
  nextPhase: TimerPhase | null;
  nextPhaseLabel: string | null;
  elapsedSessionMs: number;
  totalSessionMs: number;
  plannedWorkMs: number;
  plannedRestMs: number;
  plannedWarmupMs: number;
  completedRounds: number;
}

export interface TimerValidationResult {
  ok: boolean;
  errors: string[];
}

export type TimerCueKind =
  | 'preparation'
  | 'work'
  | 'rest'
  | 'completed'
  | 'countdown';
