// 테스트 계획 2.7 — 웹 알림 포트 (FR-07)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebNotifier, NoopNotifier } from './notifier';

class FakeNotification {
  static instances: FakeNotification[] = [];
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn(async () => FakeNotification.permission);
  onclick: (() => void) | null = null;
  close = vi.fn();
  constructor(public title: string, public options?: NotificationOptions) {
    FakeNotification.instances.push(this);
  }
}

describe('WebNotifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeNotification.instances = [];
    FakeNotification.permission = 'granted';
    vi.stubGlobal('Notification', FakeNotification);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('TC-P01 예약 시각에 Notification 1회 생성', async () => {
    const n = new WebNotifier();
    await n.schedule(Date.now() + 1000, '지민아~ 맘마먹자');
    expect(FakeNotification.instances).toHaveLength(0);
    vi.advanceTimersByTime(999);
    expect(FakeNotification.instances).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(FakeNotification.instances).toHaveLength(1);
    expect(FakeNotification.instances[0].options?.body).toBe('지민아~ 맘마먹자');
    expect(FakeNotification.instances[0].title).toContain('쪽쪽');
  });

  it('TC-P02 재예약하면 이전 타이머 취소', async () => {
    const n = new WebNotifier();
    await n.schedule(Date.now() + 1000, 'a');
    await n.schedule(Date.now() + 5000, 'b');
    vi.advanceTimersByTime(1000);
    expect(FakeNotification.instances).toHaveLength(0);
    vi.advanceTimersByTime(4000);
    expect(FakeNotification.instances).toHaveLength(1);
    expect(FakeNotification.instances[0].options?.body).toBe('b');
  });

  it('TC-P03 cancel 하면 울리지 않음', async () => {
    const n = new WebNotifier();
    await n.schedule(Date.now() + 1000, 'a');
    await n.cancel();
    vi.advanceTimersByTime(2000);
    expect(FakeNotification.instances).toHaveLength(0);
  });

  it('이미 지난 시각이면 즉시 발송', async () => {
    const n = new WebNotifier();
    await n.schedule(Date.now() - 1, 'late');
    vi.advanceTimersByTime(0);
    expect(FakeNotification.instances).toHaveLength(1);
  });

  it('권한이 없으면 Notification 생성하지 않고 조용히 통과', async () => {
    FakeNotification.permission = 'denied';
    const n = new WebNotifier();
    await n.schedule(Date.now() + 10, 'x');
    vi.advanceTimersByTime(10);
    expect(FakeNotification.instances).toHaveLength(0);
  });

  it('checkPermission / requestPermission', async () => {
    const n = new WebNotifier();
    expect(await n.checkPermission()).toBe('granted');
    FakeNotification.permission = 'denied';
    expect(await n.requestPermission()).toBe('denied');
  });

  it('Notification API 가 없으면 unsupported', async () => {
    vi.stubGlobal('Notification', undefined);
    const n = new WebNotifier();
    expect(await n.checkPermission()).toBe('unsupported');
    expect(await n.requestPermission()).toBe('unsupported');
    await expect(n.schedule(Date.now() + 1, 'x')).resolves.toBeUndefined();
  });

  it('notifyNow 는 지연 후 발송', async () => {
    const n = new WebNotifier();
    await n.notifyNow('테스트', 500);
    vi.advanceTimersByTime(500);
    expect(FakeNotification.instances).toHaveLength(1);
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
