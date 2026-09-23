/** 햅틱 포트 */
import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

export interface HapticsPort {
  tap(): void;
  success(): void;
  alarm(): void;
  stop(): void;
}

export class NoopHaptics implements HapticsPort {
  tap() {}
  success() {}
  alarm() {}
  stop() {}
}

export class ExpoHaptics implements HapticsPort {
  tap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
  success() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
  alarm() {
    try {
      Vibration.vibrate([0, 400, 200, 400, 200, 600]);
    } catch {
      /* ignore */
    }
  }
  stop() {
    try {
      Vibration.cancel();
    } catch {
      /* ignore */
    }
  }
}
