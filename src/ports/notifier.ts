/** 알림 포트 — FR-07, FR-15, FR-16 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
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
}

export const NEXT_ID = 'zzokzzok-next';
export const TEST_ID = 'zzokzzok-test';
export const CHANNEL_ID = 'feeding';

function map(status: string): PermissionState {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'prompt';
}

/** expo-notifications 로컬 알림: 앱이 종료되어도 OS 가 정확한 시각에 띄운다 */
export class ExpoNotifier implements NotifierPort {
  async init(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: '맘마 알림',
          description: '다음 수유 시간 알림',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 400, 200, 400, 200, 600],
          lightColor: '#FFA25B',
          sound: 'default',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch {
        /* 채널 생성 실패 시 기본 채널 */
      }
    }
  }

  async checkPermission(): Promise<PermissionState> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return map(status);
    } catch {
      return 'unsupported';
    }
  }

  async requestPermission(): Promise<PermissionState> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return map(status);
    } catch {
      return 'unsupported';
    }
  }

  private async scheduleAt(identifier: string, at: number, message: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: NOTIFICATION_TITLE,
        body: message,
        sound: 'default',
        data: { kind: identifier === NEXT_ID ? 'next' : 'test' },
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Math.max(at, Date.now() + 1000)),
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }

  async schedule(at: number, message: string): Promise<void> {
    await this.cancel();
    await this.scheduleAt(NEXT_ID, at, message);
  }

  async cancel(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(NEXT_ID);
    } catch {
      /* 예약 없음 */
    }
  }

  async notifyNow(message: string, delayMs = 5000): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(TEST_ID);
    } catch {
      /* ignore */
    }
    await this.scheduleAt(TEST_ID, Date.now() + delayMs, message);
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
