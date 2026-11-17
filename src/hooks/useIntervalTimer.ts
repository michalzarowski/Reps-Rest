import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  createCueTracker,
  detectTimerCues,
  playTimerCue,
} from '@/features/interval-timer/timerCues';
import type { TimerConfig, TimerSnapshot } from '@/types/timer';
import { createTimerEngine, type TimerEngine } from '@/utils/timerEngine';

const TICK_MS = 200;

interface UseIntervalTimerOptions {
  cuesEnabled?: boolean;
  countdownCuesEnabled?: boolean;
}

export function useIntervalTimer(
  initialConfig: TimerConfig,
  options: UseIntervalTimerOptions = {},
) {
  const { cuesEnabled = true, countdownCuesEnabled = true } = options;
  const engineRef = useRef<TimerEngine | null>(null);
  if (engineRef.current == null) {
    engineRef.current = createTimerEngine(initialConfig);
  }
  const engine = engineRef.current;

  const [snapshot, setSnapshot] = useState<TimerSnapshot>(() =>
    engine.getSnapshot(),
  );
  const cueTrackerRef = useRef(createCueTracker());
  const cuesEnabledRef = useRef(cuesEnabled);
  const countdownRef = useRef(countdownCuesEnabled);

  useEffect(() => {
    cuesEnabledRef.current = cuesEnabled;
  }, [cuesEnabled]);

  useEffect(() => {
    countdownRef.current = countdownCuesEnabled;
  }, [countdownCuesEnabled]);

  const sync = useCallback(
    (now = Date.now()) => {
      const next = engine.getSnapshot(now);
      const cues = detectTimerCues(next, cueTrackerRef.current, {
        enabled: cuesEnabledRef.current,
        countdownEnabled: countdownRef.current,
      });
      for (const cue of cues) {
        void playTimerCue(cue);
      }
      setSnapshot(next);
      return next;
    },
    [engine],
  );

  useEffect(() => {
    if (snapshot.status !== 'running') {
      return;
    }

    const id = setInterval(() => {
      sync();
    }, TICK_MS);

    return () => {
      clearInterval(id);
    };
  }, [snapshot.status, sync]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        sync();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [sync]);

  const start = useCallback(() => {
    engine.start();
    // Reset cue baseline so the first phase can signal once.
    cueTrackerRef.current.lastSegmentIndex = -1;
    cueTrackerRef.current.lastStatus = 'idle';
    cueTrackerRef.current.lastCountdownSecond = null;
    return sync();
  }, [engine, sync]);

  const pause = useCallback(() => {
    engine.pause();
    return sync();
  }, [engine, sync]);

  const resume = useCallback(() => {
    engine.resume();
    return sync();
  }, [engine, sync]);

  const reset = useCallback(() => {
    engine.reset();
    cueTrackerRef.current = createCueTracker();
    return sync();
  }, [engine, sync]);

  const restart = useCallback(() => {
    engine.restart();
    cueTrackerRef.current.lastSegmentIndex = -1;
    cueTrackerRef.current.lastStatus = 'idle';
    cueTrackerRef.current.lastCountdownSecond = null;
    return sync();
  }, [engine, sync]);

  const setConfig = useCallback(
    (config: TimerConfig) => {
      engine.setConfig(config);
      cueTrackerRef.current = createCueTracker();
      return sync();
    },
    [engine, sync],
  );

  return {
    snapshot,
    config: engine.getConfig(),
    start,
    pause,
    resume,
    reset,
    restart,
    setConfig,
    sync,
  };
}
