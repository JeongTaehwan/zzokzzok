import { LocalNotifications, type PermissionStatus } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { NOTIFICATION_TITLE } from '../domain/korean';
import type { NotifierPort, PermissionState } from './notifier';

const NEXT_ID = 1;
const TEST_ID = 2;
const CHANNEL_ID = 'feeding';

function map(status: PermissionStatus): PermissionState {
  switch (status.display) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'prompt';
  }
}

/** Capacitor 로컬 알림: 앱이 종료되어도 OS 가 정확한 시각에 알림을 띄운다 */
export class CapacitorNotifier implements NotifierPort {
  async init(): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await LocalNotifications.createChannel({
          id: CHANNEL_ID,
          name: '맘마 알림',
          description: '다음 수유 시간 알림',
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#FFA25B',
        });
      } catch {
        /* 채널 생성 실패 시 기본 채널 사용 */
      }
    }
  }

  async checkPermission(): Promise<PermissionState> {
    return map(await LocalNotifications.checkPermissions());
  }

  async requestPermission(): Promise<PermissionState> {
    return map(await LocalNotifications.requestPermissions());
  }

  async schedule(at: number, message: string): Promise<void> {
    await this.cancel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NEXT_ID,
          title: NOTIFICATION_TITLE,
          body: message,
          channelId: CHANNEL_ID,
          schedule: { at: new Date(at), allowWhileIdle: true },
          autoCancel: true,
          extra: { kind: 'next' },
        },
      ],
    });
  }

  async cancel(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: NEXT_ID }] });
    } catch {
      /* 예약이 없으면 무시 */
    }
  }

  async notifyNow(message: string, delayMs = 5000): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TEST_ID,
          title: NOTIFICATION_TITLE,
          body: message,
          channelId: CHANNEL_ID,
          schedule: { at: new Date(Date.now() + delayMs), allowWhileIdle: true },
          autoCancel: true,
          extra: { kind: 'test' },
        },
      ],
    });
  }

  async exactAlarmAllowed(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;
    try {
      const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
      return exact_alarm === 'granted';
    } catch {
      return true;
    }
  }

  async openExactAlarmSettings(): Promise<void> {
    try {
      await LocalNotifications.changeExactNotificationSetting();
    } catch {
      /* ignore */
    }
  }
}
