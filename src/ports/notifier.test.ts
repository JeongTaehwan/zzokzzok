// 테스트 계획 2.7 — 알림 포트 (FR-07, FR-15, FR-16) — expo-notifications 는 jest.setup 에서 모킹
import * as Notifications from 'expo-notifications';
import { ExpoNotifier, NoopNotifier, NEXT_ID, TEST_ID } from './notifier';

const mocked = Notifications as jest.Mocked<typeof Notifications>;

describe('ExpoNotifier', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 24, 2, 0, 0));
  });
  afterEach(() => jest.useRealTimers());

  it('TC-P01 예약 시각·문구로 로컬 알림을 예약한다', async () => {
    const n = new ExpoNotifier();
    const at = Date.now() + 180 * 60_000;
    await n.schedule(at, '지민아~ 맘마먹자');
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const arg = mocked.scheduleNotificationAsync.mock.calls[0][0];
    expect(arg.identifier).toBe(NEXT_ID);
    expect(arg.content.body).toBe('지민아~ 맘마먹자');
    expect(arg.content.title).toContain('쪽쪽');
    expect((arg.trigger as { date: Date }).date.getTime()).toBe(at);
  });

  it('TC-P02 재예약하면 기존 예약을 먼저 취소한다 (항상 1개)', async () => {
    const n = new ExpoNotifier();
    await n.schedule(Date.now() + 60_000, 'a');
    await n.schedule(Date.now() + 120_000, 'b');
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith(NEXT_ID);
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('TC-P03 cancel 은 다음 수유 알림만 취소', async () => {
    const n = new ExpoNotifier();
    await n.cancel();
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith(NEXT_ID);
  });

  it('이미 지난 시각이면 1초 뒤로 보정해서 예약', async () => {
    const n = new ExpoNotifier();
    await n.schedule(Date.now() - 5000, 'late');
    const arg = mocked.scheduleNotificationAsync.mock.calls[0][0];
    expect((arg.trigger as { date: Date }).date.getTime()).toBe(Date.now() + 1000);
  });

  it('TC-P05 권한 상태 매핑', async () => {
    const n = new ExpoNotifier();
    expect(await n.checkPermission()).toBe('granted');
    mocked.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied', granted: false } as never);
    expect(await n.checkPermission()).toBe('denied');
    mocked.requestPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined', granted: false } as never);
    expect(await n.requestPermission()).toBe('prompt');
  });

  it('FR-16 알림 미리보기는 별도 id 로 지연 예약', async () => {
    const n = new ExpoNotifier();
    await n.notifyNow('테스트', 5000);
    const arg = mocked.scheduleNotificationAsync.mock.calls[0][0];
    expect(arg.identifier).toBe(TEST_ID);
    expect((arg.trigger as { date: Date }).date.getTime()).toBe(Date.now() + 5000);
  });

  it('init 은 핸들러와 안드로이드 채널을 설정', async () => {
    const n = new ExpoNotifier();
    await n.init();
    expect(mocked.setNotificationHandler).toHaveBeenCalled();
  });
});

describe('NoopNotifier', () => {
  it('아무 것도 하지 않고 unsupported 반환', async () => {
    const n = new NoopNotifier();
    expect(await n.checkPermission()).toBe('unsupported');
    await expect(n.schedule(1, 'x')).resolves.toBeUndefined();
    await expect(n.cancel()).resolves.toBeUndefined();
  });
});
