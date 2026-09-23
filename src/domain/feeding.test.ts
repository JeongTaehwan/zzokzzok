// 테스트 계획 2.3 — 수유 세션 (FR-03, FR-04, FR-13, FR-18)
import { startSession, endSession, durationMs, adjustStart, setType } from './feeding';
import { MINUTE } from './time';

const NOW = 1_800_000_000_000;

describe('startSession', () => {
  it('TC-F01 시작 시각 기록, 종료 null', () => {
    const s = startSession(NOW, 'breast');
    expect(s.startedAt).toBe(NOW);
    expect(s.endedAt).toBeNull();
    expect(s.type).toBe('breast');
    expect(s.id).toBeTruthy();
  });
  it('id 는 매번 다르다', () => {
    expect(startSession(NOW, 'breast').id).not.toBe(startSession(NOW, 'breast').id);
  });
});

describe('endSession', () => {
  it('TC-F02 종료 시각 설정, 원본 불변', () => {
    const s = startSession(NOW, 'bottle');
    const e = endSession(s, NOW + 10 * MINUTE);
    expect(e.endedAt).toBe(NOW + 10 * MINUTE);
    expect(s.endedAt).toBeNull();
    expect(e.id).toBe(s.id);
  });
  it('TC-F03 종료 < 시작이면 오류', () => {
    const s = startSession(NOW, 'breast');
    expect(() => endSession(s, NOW - 1)).toThrow();
  });
});

describe('durationMs', () => {
  it('TC-F04 종료 − 시작', () => {
    const s = endSession(startSession(NOW, 'breast'), NOW + 22 * MINUTE);
    expect(durationMs(s)).toBe(22 * MINUTE);
  });
  it('진행 중이면 now 기준', () => {
    const s = startSession(NOW, 'breast');
    expect(durationMs(s, NOW + 5 * MINUTE)).toBe(5 * MINUTE);
  });
});

describe('adjustStart', () => {
  it('TC-F06 -5분이면 앞당김', () => {
    const s = startSession(NOW, 'breast');
    expect(adjustStart(s, -5 * MINUTE, NOW + MINUTE).startedAt).toBe(NOW - 5 * MINUTE);
  });
  it('TC-F05 now 를 넘기면 now 로 클램프', () => {
    const s = startSession(NOW, 'breast');
    expect(adjustStart(s, +5 * MINUTE, NOW + MINUTE).startedAt).toBe(NOW + MINUTE);
  });
});

describe('setType', () => {
  it('TC-F07 종류 변경, 불변', () => {
    const s = startSession(NOW, 'breast');
    const t = setType(s, 'solid');
    expect(t.type).toBe('solid');
    expect(s.type).toBe('breast');
  });
});
