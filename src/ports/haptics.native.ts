import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import type { HapticsPort } from './haptics';
import { WebHaptics } from './haptics';

export class CapacitorHaptics implements HapticsPort {
  private web = new WebHaptics();
  tap() {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => this.web.tap());
  }
  success() {
    Haptics.notification({ type: NotificationType.Success }).catch(() => this.web.success());
  }
  alarm() {
    this.web.alarm();
  }
  stop() {
    this.web.stop();
  }
}
