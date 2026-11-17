import { describe, expect, it } from 'vitest';

import type { TimerSnapshot } from '@/types/timer';

import { createCueTracker, detectTimerCues } from './timerCueLogic';

function snap(partial: Partial<TimerSnapshot>): TimerSnapshot {
  return {
    status: 'running',
    phase: 'work',
    segmentIndex: 0,
    currentRound: 1,
    totalRounds: 3,
    remainingMs: 10_000,
    phaseDurationMs: 10_000,
    phaseProgress: 0,
    nextPhase: 'rest',
    nextPhaseLabel: 'Przerwa',
    elapsedSessionMs: 0,
    totalSessionMs: 30_000,
    plannedWorkMs: 30_000,
    plannedRestMs: 0,
    plannedWarmupMs: 0,
    completedRounds: 0,
    ...partial,
  };
}

describe('detectTimerCues', () => {
  it('fires once on phase change and not again for same segment', () => {
    const tracker = createCueTracker();
    const first = detectTimerCues(snap({ segmentIndex: 0, phase: 'work' }), tracker, {
      enabled: true,
      countdownEnabled: false,
    });
    expect(first).toEqual(['work']);

    const second = detectTimerCues(snap({ segmentIndex: 0, phase: 'work' }), tracker, {
      enabled: true,
      countdownEnabled: false,
    });
    expect(second).toEqual([]);
  });

  it('fires completed only on transition into completed', () => {
    const tracker = createCueTracker();
    tracker.lastStatus = 'running';
    tracker.lastSegmentIndex = 2;

    const cues = detectTimerCues(
      snap({ status: 'completed', phase: 'completed', segmentIndex: -1 }),
      tracker,
      { enabled: true, countdownEnabled: false },
    );
    expect(cues).toEqual(['completed']);

    const again = detectTimerCues(
      snap({ status: 'completed', phase: 'completed', segmentIndex: -1 }),
      tracker,
      { enabled: true, countdownEnabled: false },
    );
    expect(again).toEqual([]);
  });

  it('emits countdown cues for last 3 seconds without duplicates', () => {
    const tracker = createCueTracker();
    tracker.lastSegmentIndex = 0;
    tracker.lastStatus = 'running';

    expect(
      detectTimerCues(snap({ remainingMs: 3500 }), tracker, {
        enabled: true,
        countdownEnabled: true,
      }),
    ).toEqual([]);

    expect(
      detectTimerCues(snap({ remainingMs: 3000 }), tracker, {
        enabled: true,
        countdownEnabled: true,
      }),
    ).toEqual(['countdown']);

    expect(
      detectTimerCues(snap({ remainingMs: 2900 }), tracker, {
        enabled: true,
        countdownEnabled: true,
      }),
    ).toEqual([]);

    expect(
      detectTimerCues(snap({ remainingMs: 2000 }), tracker, {
        enabled: true,
        countdownEnabled: true,
      }),
    ).toEqual(['countdown']);
  });
});
