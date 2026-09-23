/** 알림 포트 — FR-07, FR-15, FR-16 */
import { NOTIFICATION_TITLE } from '../domain/korean';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface NotifierPort {
  checkPermission(): Promise<PermissionState>;
  requestPermission(): Promise<PermissionState>;
  /** 다음 수유 알림을 at(epoch ms)에 예약. 기존 예약은 교체된다. */
  schedule(at: number, message: string): Promise<void>;
  cancel(): Promise<void>;
  /** 테스트 알림: delayMs 뒤 발송 */
  notifyNow(message: string, delayMs?: number): Promise<void>;
  /** (네이티브) 정확 알람 허용 여부. 미지원이면 undefined */
  exactAlarmAllowed?(): Promise<boolean>;
  openExactAlarmSettings?(): Promise<void>;
}

type NotificationCtor = typeof Notification;

function getNotification(): NotificationCtor | null {
  const n = (globalThis as { Notification?: unknown }).Notification;
  return typeof n === 'function' ? (n as NotificationCtor) : null;
}

function mapPermission(p: NotificationPermission): PermissionState {
  if (p === 'granted') return 'granted';
  if (p === 'denied') return 'denied';
  return 'prompt';
}

/** 브라우저(PWA)용: 앱이 열려 있는 동안 setTimeout 으로 발송 */
export class WebNotifier implements NotifierPort {
  private timer: ReturnType<typeof setTimeout> | null = null;

  async checkPermission(): Promise<PermissionState> {
    const N = getNotification();
    return N ? mapPermission(N.permission) : 'unsupported';
  }

  async requestPermission(): Promise<PermissionState> {
    const N = getNotification();
    if (!N) return 'unsupported';
    try {
      return mapPermission(await N.requestPermission());
    } catch {
      return 'denied';
    }
  }

  async schedule(at: number, message: string): Promise<void> {
    await this.cancel();
    const delay = Math.max(0, at - Date.now());
    this.timer = setTimeout(() => {
      this.timer = null;
      this.fire(message, 'zzokzzok-next');
    }, delay);
  }

  async cancel(): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async notifyNow(message: string, delayMs = 5000): Promise<void> {
    setTimeout(() => this.fire(message, 'zzokzzok-test'), Math.max(0, delayMs));
  }

  private fire(message: string, tag: string) {
    const N = getNotification();
    if (!N || N.permission !== 'granted') return;
    const options: NotificationOptions = {
      body: message,
      tag,
      icon: './icons/icon-192.png',
      requireInteraction: true,
    };
    try {
      const sw = (navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }).serviceWorker;
      if (sw && sw.controller) {
        // 모바일 브라우저는 SW 를 통해서만 표시 가능
        sw.ready.then((reg) => reg.showNotification(NOTIFICATION_TITLE, options)).catch(() => {
          new N(NOTIFICATION_TITLE, options);
        });
        return;
      }
      const n = new N(NOTIFICATION_TITLE, options);
      n.onclick = () => {
        try {
          window.focus();
          n.close();
        } catch {
          /* ignore */
        }
      };
    } catch {
      /* Notification 생성 실패 (일부 모바일 브라우저) — 앱 내 알람 화면이 대신 표시됨 */
    }
  }
}

export class NoopNotifier implements NotifierPort {
  async checkPermission(): Promise<PermissionState> {
    return 'unsupported';
  }
  async requestPermission(): Promise<PermissionState> {
    return 'unsupported';
  }
  async schedule(_at: number, _message: string): Promise<void> {}
  async cancel(): Promise<void> {}
  async notifyNow(_message: string, _delayMs?: number): Promise<void> {}
}
