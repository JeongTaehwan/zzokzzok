/** 햅틱 포트 */

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

/** navigator.vibrate 기반 (브라우저 / WebView) */
export class WebHaptics implements HapticsPort {
  private vibrate(pattern: number | number[]) {
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* ignore */
    }
  }
  tap() {
    this.vibrate(15);
  }
  success() {
    this.vibrate([20, 40, 20]);
  }
  alarm() {
    this.vibrate([400, 200, 400, 200, 600]);
  }
  stop() {
    this.vibrate(0);
  }
}
