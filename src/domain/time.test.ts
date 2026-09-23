// 테스트 계획 2.2 — 시간 포맷 (FR-03, FR-05, FR-11)
import {
  MINUTE, HOUR, formatElapsed, formatCountdown, formatDurationKo, formatClock, dayKey, dayLabel,
} from './time';

const local = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime();

describe('formatElapsed', () => {
  it('TC-T01 0 → 00:00', () => expect(formatElapsed(0)).toBe('00:00'));
  it('TC-T02 mm:ss', () => expect(formatElapsed(754_000)).toBe('12:34'));
  it('TC-T03 1시간 이상은 h:mm:ss', () => expect(formatElapsed(3_723_000)).toBe('1:02:03'));
  it('음수는 0', () => expect(formatElapsed(-500)).toBe('00:00'));
});

describe('formatCountdown', () => {
  it('TC-T04 h:mm:ss', () => expect(formatCountdown(5_025_000)).toBe('1:23:45'));
  it('1시간 미만은 m:ss', () => expect(formatCountdown(10 * MINUTE)).toBe('10:00'));
  it('TC-T05 음수는 0:00', () => expect(formatCountdown(-1)).toBe('0:00'));
});

describe('formatDurationKo', () => {
  it('TC-T06 분', () => expect(formatDurationKo(22 * MINUTE)).toBe('22분'));
  it('TC-T07 시간+분', () => expect(formatDurationKo(134 * MINUTE)).toBe('2시간 14분'));
  it('정각이면 시간만', () => expect(formatDurationKo(2 * HOUR)).toBe('2시간'));
  it('TC-T08 1분 미만', () => expect(formatDurationKo(30_000)).toBe('1분 미만'));
});

describe('formatClock', () => {
  it('TC-T09 로컬 HH:mm', () => expect(formatClock(local(2026, 9, 23, 5, 40))).toBe('05:40'));
  it('자정 직전', () => expect(formatClock(local(2026, 9, 23, 23, 5))).toBe('23:05'));
});

describe('dayKey / dayLabel', () => {
  const today = local(2026, 9, 23, 14, 0);
  it('TC-T10 YYYY-MM-DD 로컬', () => expect(dayKey(local(2026, 9, 23, 0, 1))).toBe('2026-09-23'));
  it('TC-T11 오늘/어제/날짜', () => {
    expect(dayLabel(local(2026, 9, 23, 2, 0), today)).toBe('오늘');
    expect(dayLabel(local(2026, 9, 22, 23, 59), today)).toBe('어제');
    expect(dayLabel(local(2026, 9, 21, 10, 0), today)).toBe('9월 21일');
  });
});
