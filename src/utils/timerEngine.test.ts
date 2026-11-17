import { describe, expect, it } from 'vitest';

import {
  buildTimeline,
  computePlannedDurations,
  createTimerEngine,
  formatTimerMmSs,
  validateTimerConfig,
} from './timerEngine';

function createClock(start = 1_000_000) {
  let now = start;
  return {
    nowFn: () => now,
    set: (value: number) => {
      now = value;
    },
    advance: (ms: number) => {
      now += ms;
    },
  };
}

const baseConfig = {
  rounds: 3,
  workSeconds: 180,
  restSeconds: 60,
  warmupSeconds: 10,
};

describe('validateTimerConfig', () => {
  it('rejects invalid configuration', () => {
    expect(validateTimerConfig({ ...baseConfig, rounds: 0 }).ok).toBe(false);
    expect(validateTimerConfig({ ...baseConfig, workSeconds: 0 }).ok).toBe(
      false,
    );
    expect(validateTimerConfig({ ...baseConfig, restSeconds: -1 }).ok).toBe(
      false,
    );
    expect(validateTimerConfig({ ...baseConfig, warmupSeconds: -5 }).ok).toBe(
      false,
    );
  });

  it('accepts zero rest and zero warmup', () => {
    expect(
      validateTimerConfig({
        rounds: 2,
        workSeconds: 30,
        restSeconds: 0,
        warmupSeconds: 0,
      }).ok,
    ).toBe(true);
  });
});

describe('buildTimeline / planned durations', () => {
  it('builds prep → work → rest → work → rest → work (no trailing rest)', () => {
    const timeline = buildTimeline(baseConfig);
    expect(timeline.map((s) => s.kind)).toEqual([
      'preparation',
      'work',
      'rest',
      'work',
      'rest',
      'work',
    ]);
    expect(timeline.at(-1)?.kind).toBe('work');
  });

  it('skips rest when restSeconds is 0', () => {
    const timeline = buildTimeline({
      rounds: 3,
      workSeconds: 20,
      restSeconds: 0,
      warmupSeconds: 0,
    });
    expect(timeline.map((s) => s.kind)).toEqual(['work', 'work', 'work']);
  });

  it('computes total session time', () => {
    const planned = computePlannedDurations(baseConfig);
    // 10 + 3*180 + 2*60 = 10 + 540 + 120 = 670s
    expect(planned.totalMs).toBe(670_000);
    expect(planned.workMs).toBe(540_000);
    expect(planned.restMs).toBe(120_000);
    expect(planned.warmupMs).toBe(10_000);
  });
});

describe('createTimerEngine', () => {
  it('tracks remaining time from wall clock without interval drift', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 1, workSeconds: 10, restSeconds: 0, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    clock.advance(2500);
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.phase).toBe('work');
    expect(snap.remainingMs).toBe(7500);
  });

  it('pauses and resumes without losing elapsed time', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 1, workSeconds: 20, restSeconds: 0, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    clock.advance(5000);
    engine.pause(clock.nowFn());
    const paused = engine.getSnapshot(clock.nowFn());
    expect(paused.status).toBe('paused');
    expect(paused.remainingMs).toBe(15_000);

    clock.advance(30_000); // time passes while paused
    expect(engine.getSnapshot(clock.nowFn()).remainingMs).toBe(15_000);

    engine.resume(clock.nowFn());
    clock.advance(2000);
    expect(engine.getSnapshot(clock.nowFn()).remainingMs).toBe(13_000);
  });

  it('resets back to idle configuration', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 2, workSeconds: 10, restSeconds: 5, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    clock.advance(3000);
    engine.reset();
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.status).toBe('idle');
    expect(snap.phase).toBe('idle');
    expect(engine.getElapsedMs(clock.nowFn())).toBe(0);
  });

  it('restarts immediately from the beginning', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 2, workSeconds: 10, restSeconds: 5, warmupSeconds: 3 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    clock.advance(20_000);
    engine.restart(clock.nowFn());
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.status).toBe('running');
    expect(snap.phase).toBe('preparation');
    expect(snap.remainingMs).toBe(3000);
  });

  it('jumps across multiple phases after a long background gap', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 3, workSeconds: 10, restSeconds: 5, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    // Work1 (10) + Rest1 (5) + Work2 (10) = 25s → into rest 2
    clock.advance(27_000);
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.phase).toBe('rest');
    expect(snap.currentRound).toBe(2);
    expect(snap.remainingMs).toBe(3000);
  });

  it('completes after the last work round without a trailing rest', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 2, workSeconds: 10, restSeconds: 5, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    // 10 work + 5 rest + 10 work = 25s
    clock.advance(25_000);
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.status).toBe('completed');
    expect(snap.phase).toBe('completed');
    expect(snap.completedRounds).toBe(2);
    expect(snap.remainingMs).toBe(0);
  });

  it('handles rapid start/pause without negative remaining time', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 1, workSeconds: 8, restSeconds: 0, warmupSeconds: 0 },
      clock.nowFn,
    );
    engine.start(clock.nowFn());
    engine.pause(clock.nowFn());
    engine.resume(clock.nowFn());
    engine.pause(clock.nowFn());
    engine.resume(clock.nowFn());
    clock.advance(100);
    const snap = engine.getSnapshot(clock.nowFn());
    expect(snap.remainingMs).toBeGreaterThanOrEqual(0);
    expect(snap.remainingMs).toBeLessThanOrEqual(8000);
  });

  it('ignores invalid config start attempts', () => {
    const clock = createClock();
    const engine = createTimerEngine(
      { rounds: 0, workSeconds: 10, restSeconds: 0, warmupSeconds: 0 },
      clock.nowFn,
    );
    const snap = engine.start(clock.nowFn());
    expect(snap.status).toBe('idle');
  });
});

describe('formatTimerMmSs', () => {
  it('formats countdown values', () => {
    expect(formatTimerMmSs(0)).toBe('00:00');
    expect(formatTimerMmSs(1000)).toBe('00:01');
    expect(formatTimerMmSs(180_000)).toBe('03:00');
    expect(formatTimerMmSs(65_100)).toBe('01:06');
  });
});
