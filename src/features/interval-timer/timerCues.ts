import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { TimerCueKind } from '@/types/timer';

export {
  createCueTracker,
  detectTimerCues,
  type CueTracker,
} from '@/utils/timerCueLogic';

/**
 * Foreground-only cues. JS timers and haptics are not reliable with a locked
 * screen or killed process — do not treat these as background alarms.
 */
export async function playTimerCue(kind: TimerCueKind): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    switch (kind) {
      case 'work':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        Vibration.vibrate(80);
        break;
      case 'rest':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Vibration.vibrate([0, 40, 60, 40]);
        break;
      case 'preparation':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Vibration.vibrate(40);
        break;
      case 'completed':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        Vibration.vibrate([0, 100, 80, 100, 80, 160]);
        break;
      case 'countdown':
        await Haptics.selectionAsync();
        break;
      default:
        break;
    }
  } catch {
    // Haptyka / wibracja mogą być niedostępne na emulatorze — ignoruj.
  }
}
