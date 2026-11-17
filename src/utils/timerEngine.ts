import type {
  TimerConfig,
  TimerPhase,
  TimerRunStatus,
  TimerSegment,
  TimerSnapshot,
  TimerValidationResult,
} from '@/types/timer';

export type NowFn = () => number;

const EMPTY_SNAPSHOT: TimerSnapshot = {
  status: 'idle',
  phase: 'idle',
  segmentIndex: -1,
  currentRound: 0,
  totalRounds: 0,
  remainingMs: 0,
  phaseDurationMs: 0,
  phaseProgress: 0,
  nextPhase: null,
  nextPhaseLabel: null,
  elapsedSessionMs: 0,
  totalSessionMs: 0,
  plannedWorkMs: 0,
  plannedRestMs: 0,
  plannedWarmupMs: 0,
  completedRounds: 0,
};

export function validateTimerConfig(config: TimerConfig): TimerValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(config.rounds) || config.rounds < 1) {
    errors.push('Liczba rund musi być dodatnią liczbą całkowitą');
  }
  if (!Number.isFinite(config.workSeconds) || config.workSeconds <= 0) {
    errors.push('Czas pracy musi być większy od zera');
  }
  if (!Number.isFinite(config.restSeconds) || config.restSeconds < 0) {
    errors.push('Czas przerwy nie może być ujemny');
  }
  if (!Number.isFinite(config.warmupSeconds) || config.warmupSeconds < 0) {
    errors.push('Czas przygotowania nie może być ujemny');
  }
  if (
    Number.isFinite(config.workSeconds) &&
    !Number.isInteger(config.workSeconds)
  ) {
    errors.push('Czas pracy musi być liczbą całkowitą sekund');
  }
  if (
    Number.isFinite(config.restSeconds) &&
    !Number.isInteger(config.restSeconds)
  ) {
    errors.push('Czas przerwy musi być liczbą całkowitą sekund');
  }
  if (
    Number.isFinite(config.warmupSeconds) &&
    !Number.isInteger(config.warmupSeconds)
  ) {
    errors.push('Czas przygotowania musi być liczbą całkowitą sekund');
  }

  return { ok: errors.length === 0, errors };
}

export function buildTimeline(config: TimerConfig): TimerSegment[] {
  const validation = validateTimerConfig(config);
  if (!validation.ok) {
    return [];
  }

  const segments: TimerSegment[] = [];
  let offset = 0;

  if (config.warmupSeconds > 0) {
    const durationMs = config.warmupSeconds * 1000;
    segments.push({
      kind: 'preparation',
      round: 0,
      durationMs,
      startOffsetMs: offset,
    });
    offset += durationMs;
  }

  for (let round = 1; round <= config.rounds; round += 1) {
    const workMs = config.workSeconds * 1000;
    segments.push({
      kind: 'work',
      round,
      durationMs: workMs,
      startOffsetMs: offset,
    });
    offset += workMs;

    if (round < config.rounds && config.restSeconds > 0) {
      const restMs = config.restSeconds * 1000;
      segments.push({
        kind: 'rest',
        round,
        durationMs: restMs,
        startOffsetMs: offset,
      });
      offset += restMs;
    }
  }

  return segments;
}

export function computePlannedDurations(config: TimerConfig): {
  workMs: number;
  restMs: number;
  warmupMs: number;
  totalMs: number;
} {
  const warmupMs = Math.max(0, config.warmupSeconds) * 1000;
  const workMs = Math.max(0, config.rounds) * Math.max(0, config.workSeconds) * 1000;
  const restIntervals = Math.max(0, config.rounds - 1);
  const restMs =
    restIntervals * Math.max(0, config.restSeconds) * 1000;
  return {
    workMs,
    restMs,
    warmupMs,
    totalMs: warmupMs + workMs + restMs,
  };
}

function phaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'preparation':
      return 'Przygotowanie';
    case 'work':
      return 'Praca';
    case 'rest':
      return 'Przerwa';
    case 'completed':
      return 'Koniec';
    default:
      return 'Gotowy';
  }
}

function segmentToPhase(kind: TimerSegment['kind']): TimerPhase {
  return kind;
}

function findSegmentAtElapsed(
  timeline: TimerSegment[],
  elapsedMs: number,
): { segment: TimerSegment; index: number } | null {
  for (let i = 0; i < timeline.length; i += 1) {
    const segment = timeline[i]!;
    const end = segment.startOffsetMs + segment.durationMs;
    if (elapsedMs < end) {
      return { segment, index: i };
    }
  }
  return null;
}

export interface TimerEngine {
  getConfig: () => TimerConfig;
  getTimeline: () => readonly TimerSegment[];
  getStatus: () => TimerRunStatus;
  getSnapshot: (now?: number) => TimerSnapshot;
  /** Elapsed session ms at `now` (clamped). */
  getElapsedMs: (now?: number) => number;
  start: (now?: number) => TimerSnapshot;
  pause: (now?: number) => TimerSnapshot;
  resume: (now?: number) => TimerSnapshot;
  reset: () => TimerSnapshot;
  restart: (now?: number) => TimerSnapshot;
  setConfig: (config: TimerConfig) => TimerSnapshot;
}

/**
 * Wall-clock interval timer engine.
 * `setInterval` must only refresh UI — elapsed time always comes from `nowFn`.
 */
export function createTimerEngine(
  initialConfig: TimerConfig,
  nowFn: NowFn = () => Date.now(),
): TimerEngine {
  let config: TimerConfig = { ...initialConfig };
  let timeline = buildTimeline(config);
  let status: TimerRunStatus = 'idle';
  /** Elapsed ms frozen while paused / before start. */
  let baseElapsedMs = 0;
  /** Wall-clock timestamp when the current running stretch began. */
  let runningSinceMs: number | null = null;

  const planned = () => computePlannedDurations(config);

  function resolveElapsed(now: number): number {
    const total = planned().totalMs;
    let elapsed = baseElapsedMs;
    if (status === 'running' && runningSinceMs != null) {
      elapsed += Math.max(0, now - runningSinceMs);
    }
    return Math.min(Math.max(0, elapsed), total);
  }

  function buildSnapshot(now: number): TimerSnapshot {
    const durations = planned();
    const totalRounds = config.rounds;

    if (status === 'idle' || timeline.length === 0) {
      return {
        ...EMPTY_SNAPSHOT,
        status: 'idle',
        phase: 'idle',
        totalRounds,
        plannedWorkMs: durations.workMs,
        plannedRestMs: durations.restMs,
        plannedWarmupMs: durations.warmupMs,
        totalSessionMs: durations.totalMs,
        remainingMs: timeline[0]?.durationMs ?? 0,
        phaseDurationMs: timeline[0]?.durationMs ?? 0,
      };
    }

    const elapsedSessionMs = resolveElapsed(now);

    if (
      status === 'completed' ||
      (timeline.length > 0 && elapsedSessionMs >= durations.totalMs)
    ) {
      status = 'completed';
      runningSinceMs = null;
      baseElapsedMs = durations.totalMs;
      return {
        status: 'completed',
        phase: 'completed',
        segmentIndex: -1,
        currentRound: totalRounds,
        totalRounds,
        remainingMs: 0,
        phaseDurationMs: 0,
        phaseProgress: 1,
        nextPhase: null,
        nextPhaseLabel: null,
        elapsedSessionMs: durations.totalMs,
        totalSessionMs: durations.totalMs,
        plannedWorkMs: durations.workMs,
        plannedRestMs: durations.restMs,
        plannedWarmupMs: durations.warmupMs,
        completedRounds: totalRounds,
      };
    }

    const hit = findSegmentAtElapsed(timeline, elapsedSessionMs);
    if (!hit) {
      status = 'completed';
      runningSinceMs = null;
      baseElapsedMs = durations.totalMs;
      return buildSnapshot(now);
    }

    const { segment, index } = hit;
    const intoPhase = elapsedSessionMs - segment.startOffsetMs;
    const remainingMs = Math.max(0, segment.durationMs - intoPhase);
    const phaseProgress =
      segment.durationMs > 0
        ? Math.min(1, Math.max(0, intoPhase / segment.durationMs))
        : 1;

    const next = timeline[index + 1] ?? null;
    const nextPhase = next ? segmentToPhase(next.kind) : 'completed';
    const completedRounds =
      segment.kind === 'work'
        ? Math.max(0, segment.round - 1)
        : segment.kind === 'rest'
          ? segment.round
          : 0;

    return {
      status,
      phase: segmentToPhase(segment.kind),
      segmentIndex: index,
      currentRound: segment.kind === 'preparation' ? 1 : segment.round,
      totalRounds,
      remainingMs,
      phaseDurationMs: segment.durationMs,
      phaseProgress,
      nextPhase,
      nextPhaseLabel: phaseLabel(nextPhase),
      elapsedSessionMs,
      totalSessionMs: durations.totalMs,
      plannedWorkMs: durations.workMs,
      plannedRestMs: durations.restMs,
      plannedWarmupMs: durations.warmupMs,
      completedRounds,
    };
  }

  return {
    getConfig: () => ({ ...config }),
    getTimeline: () => timeline,
    getStatus: () => status,
    getElapsedMs: (now = nowFn()) => resolveElapsed(now),
    getSnapshot: (now = nowFn()) => buildSnapshot(now),

    start(now = nowFn()) {
      const validation = validateTimerConfig(config);
      if (!validation.ok || timeline.length === 0) {
        return buildSnapshot(now);
      }
      if (status === 'running') {
        return buildSnapshot(now);
      }
      if (status === 'completed') {
        baseElapsedMs = 0;
      }
      status = 'running';
      runningSinceMs = now;
      return buildSnapshot(now);
    },

    pause(now = nowFn()) {
      if (status !== 'running') {
        return buildSnapshot(now);
      }
      baseElapsedMs = resolveElapsed(now);
      runningSinceMs = null;
      status = 'paused';
      return buildSnapshot(now);
    },

    resume(now = nowFn()) {
      if (status !== 'paused') {
        return buildSnapshot(now);
      }
      if (baseElapsedMs >= planned().totalMs) {
        status = 'completed';
        return buildSnapshot(now);
      }
      status = 'running';
      runningSinceMs = now;
      return buildSnapshot(now);
    },

    reset() {
      status = 'idle';
      baseElapsedMs = 0;
      runningSinceMs = null;
      return buildSnapshot(nowFn());
    },

    restart(now = nowFn()) {
      const validation = validateTimerConfig(config);
      if (!validation.ok || timeline.length === 0) {
        status = 'idle';
        baseElapsedMs = 0;
        runningSinceMs = null;
        return buildSnapshot(now);
      }
      status = 'running';
      baseElapsedMs = 0;
      runningSinceMs = now;
      return buildSnapshot(now);
    },

    setConfig(nextConfig: TimerConfig) {
      config = { ...nextConfig };
      timeline = buildTimeline(config);
      status = 'idle';
      baseElapsedMs = 0;
      runningSinceMs = null;
      return buildSnapshot(nowFn());
    },
  };
}

export function formatTimerMmSs(totalMs: number): string {
  const safeMs = Math.max(0, Math.floor(totalMs));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function phaseDisplayName(phase: TimerPhase): string {
  switch (phase) {
    case 'preparation':
      return 'Przygotowanie';
    case 'work':
      return 'Praca';
    case 'rest':
      return 'Przerwa';
    case 'completed':
      return 'Zakończono';
    default:
      return 'Gotowy';
  }
}
