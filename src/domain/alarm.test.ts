// 테스트 계획 2.4 — 알람 계산 (FR-02, FR-05, FR-08, FR-09)
import {
  MIN_INTERVAL, MAX_INTERVAL, DEFAULT_INTERVAL, SNOOZE_MINUTES,
  clampInterval, computeAlarmAt, isDue, snoozeAt, remainingMs, progress,
} from './alarm';
import { MINUTE } from './time';

const NOW = 1_800_000_000_000;

describe('상수', () => {
  it('범위 5~720, 기본 180, 스누즈 10', () => {
    expect(MIN_INTERVAL).toBe(5);
    expect(MAX_INTERVAL).toBe(720);
    expect(DEFAULT_INTERVAL).toBe(180);
    expect(SNOOZE_MINUTES).toBe(10);
  });
});

describe('computeAlarmAt', () => {
  it('TC-A01 종료 + 간격', () => expect(computeAlarmAt(NOW, 180)).toBe(NOW + 180 * MINUTE));
});

describe('clampInterval', () => {
  it('TC-A02 하한/상한/NaN', () => {
    expect(clampInterval(3)).toBe(5);
    expect(clampInterval(1000)).toBe(720);
    expect(clampInterval(NaN)).toBe(180);
    expect(clampInterval(120)).toBe(120);
    expect(clampInterval(90.7)).toBe(91);
  });
});

describe('isDue', () => {
  it('TC-A03 now >= scheduledAt', () => {
    expect(isDue(NOW, NOW)).toBe(true);
    expect(isDue(NOW, NOW + 1)).toBe(true);
    expect(isDue(NOW, NOW - 1)).toBe(false);
    expect(isDue(null, NOW)).toBe(false);
  });
});

describe('snoozeAt', () => {
  it('TC-A04 now + 10분', () => expect(snoozeAt(NOW)).toBe(NOW + 10 * MINUTE));
});

describe('remainingMs', () => {
  it('TC-A05 남은 시간, 음수면 0', () => {
    expect(remainingMs(NOW + 5 * MINUTE, NOW)).toBe(5 * MINUTE);
    expect(remainingMs(NOW - 1, NOW)).toBe(0);
    expect(remainingMs(null, NOW)).toBe(0);
  });
});

describe('progress', () => {
  it('TC-A06 0~1 비율, 클램프', () => {
    expect(progress(NOW, NOW + 100, NOW + 50)).toBeCloseTo(0.5);
    expect(progress(NOW, NOW + 100, NOW - 10)).toBe(0);
    expect(progress(NOW, NOW + 100, NOW + 200)).toBe(1);
    expect(progress(NOW, NOW, NOW)).toBe(1);
  });
});
