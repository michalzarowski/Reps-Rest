import type { TimerCueKind, TimerSnapshot } from '@/types/timer';

export interface CueTracker {
  lastSegmentIndex: number;
  lastStatus: TimerSnapshot['status'];
  lastCountdownSecond: number | null;
}

export function createCueTracker(): CueTracker {
  return {
    lastSegmentIndex: -1,
    lastStatus: 'idle',
    lastCountdownSecond: null,
  };
}

/**
 * Detect phase / completion / final-3s cues without double-firing on re-renders.
 */
export function detectTimerCues(
  snapshot: TimerSnapshot,
  tracker: CueTracker,
  options: { enabled: boolean; countdownEnabled: boolean },
): TimerCueKind[] {
  const cues: TimerCueKind[] = [];
  if (!options.enabled) {
    tracker.lastSegmentIndex = snapshot.segmentIndex;
    tracker.lastStatus = snapshot.status;
    tracker.lastCountdownSecond = null;
    return cues;
  }

  if (snapshot.status === 'completed' && tracker.lastStatus !== 'completed') {
    cues.push('completed');
  } else if (
    snapshot.status === 'running' &&
    snapshot.segmentIndex >= 0 &&
    snapshot.segmentIndex !== tracker.lastSegmentIndex
  ) {
    if (snapshot.phase === 'work') cues.push('work');
    else if (snapshot.phase === 'rest') cues.push('rest');
    else if (snapshot.phase === 'preparation') cues.push('preparation');
    tracker.lastCountdownSecond = null;
  }

  if (
    options.countdownEnabled &&
    snapshot.status === 'running' &&
    (snapshot.phase === 'work' ||
      snapshot.phase === 'rest' ||
      snapshot.phase === 'preparation')
  ) {
    const sec = Math.ceil(snapshot.remainingMs / 1000);
    if (sec >= 1 && sec <= 3 && sec !== tracker.lastCountdownSecond) {
      cues.push('countdown');
      tracker.lastCountdownSecond = sec;
    }
    if (sec > 3) {
      tracker.lastCountdownSecond = null;
    }
  }

  tracker.lastSegmentIndex = snapshot.segmentIndex;
  tracker.lastStatus = snapshot.status;
  return cues;
}
