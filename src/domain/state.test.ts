// 테스트 계획 2.6 — 상태/리듀서 (FR-01~18 통합)
import { initialState, reducer, serialize, deserialize, hydrate, type AppState } from './state';
import { MINUTE } from './time';

const NOW = 1_800_000_000_000;

function onboarded(): AppState {
  return reducer(initialState(), { type: 'COMPLETE_ONBOARDING', babyName: '지민', intervalMinutes: 180 });
}
function feeding(): AppState {
  return reducer(onboarded(), { type: 'START', now: NOW });
}
function scheduled(): AppState {
  return reducer(feeding(), { type: 'END', now: NOW + 10 * MINUTE });
}

describe('초기 상태', () => {
  it('온보딩 전, 기본 간격 180, 이름 빈 문자열', () => {
    const s = initialState();
    expect(s.onboarded).toBe(false);
    expect(s.settings.intervalMinutes).toBe(180);
    expect(s.settings.babyName).toBe('');
    expect(s.current).toBeNull();
    expect(s.sessions).toEqual([]);
    expect(s.alarm).toEqual({ scheduledAt: null, snoozeCount: 0, ringing: false });
  });
});

describe('COMPLETE_ONBOARDING', () => {
  it('TC-R01 설정 반영', () => {
    const s = onboarded();
    expect(s.onboarded).toBe(true);
    expect(s.settings.babyName).toBe('지민');
    expect(s.settings.intervalMinutes).toBe(180);
  });
  it('이름 공백 제거, 간격 클램프', () => {
    const s = reducer(initialState(), { type: 'COMPLETE_ONBOARDING', babyName: '  수아 ', intervalMinutes: 1 });
    expect(s.settings.babyName).toBe('수아');
    expect(s.settings.intervalMinutes).toBe(5);
  });
});

describe('START', () => {
  it('TC-R02 수유 시작 시 current 생성, 예약 취소', () => {
    const s = reducer(scheduled(), { type: 'START', now: NOW + 60 * MINUTE });
    expect(s.current?.startedAt).toBe(NOW + 60 * MINUTE);
    expect(s.alarm.scheduledAt).toBeNull();
    expect(s.alarm.ringing).toBe(false);
  });
  it('기본 종류는 마지막 선택값', () => {
    const base = reducer(onboarded(), { type: 'UPDATE_SETTINGS', patch: { lastFeedingType: 'bottle' } });
    expect(reducer(base, { type: 'START', now: NOW }).current?.type).toBe('bottle');
  });
  it('TC-R03 이미 수유 중이면 무시', () => {
    const f = feeding();
    expect(reducer(f, { type: 'START', now: NOW + 1 })).toBe(f);
  });
});

describe('END', () => {
  it('TC-R04 세션 저장 + 알람 예약', () => {
    const s = scheduled();
    expect(s.current).toBeNull();
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0].startedAt).toBe(NOW);
    expect(s.sessions[0].endedAt).toBe(NOW + 10 * MINUTE);
    expect(s.alarm.scheduledAt).toBe(NOW + 10 * MINUTE + 180 * MINUTE);
    expect(s.alarm.snoozeCount).toBe(0);
  });
  it('최신 세션이 맨 앞', () => {
    let s = scheduled();
    s = reducer(s, { type: 'START', now: NOW + 200 * MINUTE });
    s = reducer(s, { type: 'END', now: NOW + 210 * MINUTE });
    expect(s.sessions[0].startedAt).toBe(NOW + 200 * MINUTE);
    expect(s.sessions).toHaveLength(2);
  });
  it('TC-R05 수유 중이 아니면 무시', () => {
    const o = onboarded();
    expect(reducer(o, { type: 'END', now: NOW })).toBe(o);
  });
  it('종료 시각이 시작보다 앞이면 시작 시각으로 보정', () => {
    const s = reducer(feeding(), { type: 'END', now: NOW - 5 * MINUTE });
    expect(s.sessions[0].endedAt).toBe(NOW);
  });
});

describe('RING / SNOOZE / DISMISS', () => {
  it('TC-R06 RING → ringing', () => {
    expect(reducer(scheduled(), { type: 'RING' }).alarm.ringing).toBe(true);
  });
  it('TC-R07 SNOOZE → now+10분, 카운트 증가, ringing 해제', () => {
    const r = reducer(scheduled(), { type: 'RING' });
    const s = reducer(r, { type: 'SNOOZE', now: NOW + 190 * MINUTE });
    expect(s.alarm.scheduledAt).toBe(NOW + 200 * MINUTE);
    expect(s.alarm.snoozeCount).toBe(1);
    expect(s.alarm.ringing).toBe(false);
  });
  it('TC-R08 DISMISS → 예약 제거', () => {
    const s = reducer(reducer(scheduled(), { type: 'RING' }), { type: 'DISMISS' });
    expect(s.alarm.scheduledAt).toBeNull();
    expect(s.alarm.ringing).toBe(false);
  });
});

describe('UPDATE_SETTINGS', () => {
  it('TC-R09 간격 변경 시 예약 재계산 (마지막 종료 + 새 간격)', () => {
    const s = reducer(scheduled(), { type: 'UPDATE_SETTINGS', patch: { intervalMinutes: 120 } });
    expect(s.settings.intervalMinutes).toBe(120);
    expect(s.alarm.scheduledAt).toBe(NOW + 10 * MINUTE + 120 * MINUTE);
  });
  it('TC-R10 예약 없으면 null 유지', () => {
    const s = reducer(onboarded(), { type: 'UPDATE_SETTINGS', patch: { intervalMinutes: 120 } });
    expect(s.alarm.scheduledAt).toBeNull();
  });
  it('이름 변경은 예약에 영향 없음', () => {
    const before = scheduled();
    const s = reducer(before, { type: 'UPDATE_SETTINGS', patch: { babyName: '수아' } });
    expect(s.settings.babyName).toBe('수아');
    expect(s.alarm.scheduledAt).toBe(before.alarm.scheduledAt);
  });
  it('간격은 클램프', () => {
    expect(reducer(onboarded(), { type: 'UPDATE_SETTINGS', patch: { intervalMinutes: 9999 } }).settings.intervalMinutes).toBe(720);
  });
});

describe('DELETE_SESSION / RESET_DATA', () => {
  it('TC-R11 세션 삭제', () => {
    const s = scheduled();
    const d = reducer(s, { type: 'DELETE_SESSION', id: s.sessions[0].id });
    expect(d.sessions).toHaveLength(0);
  });
  it('없는 id 는 무시', () => {
    const s = scheduled();
    expect(reducer(s, { type: 'DELETE_SESSION', id: 'nope' })).toBe(s);
  });
  it('TC-R12 데이터 초기화는 설정/온보딩 유지', () => {
    const s = reducer(scheduled(), { type: 'RESET_DATA' });
    expect(s.sessions).toEqual([]);
    expect(s.current).toBeNull();
    expect(s.alarm.scheduledAt).toBeNull();
    expect(s.onboarded).toBe(true);
    expect(s.settings.babyName).toBe('지민');
  });
});

describe('SET_TYPE / ADJUST_START', () => {
  it('TC-R13 수유 중 종류 변경 + 마지막 선택 저장', () => {
    const s = reducer(feeding(), { type: 'SET_TYPE', feedingType: 'solid' });
    expect(s.current?.type).toBe('solid');
    expect(s.settings.lastFeedingType).toBe('solid');
  });
  it('수유 중이 아니어도 마지막 선택은 저장', () => {
    const s = reducer(onboarded(), { type: 'SET_TYPE', feedingType: 'bottle' });
    expect(s.settings.lastFeedingType).toBe('bottle');
    expect(s.current).toBeNull();
  });
  it('TC-R14 시작 시각 보정 (now 클램프)', () => {
    const s = reducer(feeding(), { type: 'ADJUST_START', deltaMs: 5 * MINUTE, now: NOW + 2 * MINUTE });
    expect(s.current?.startedAt).toBe(NOW + 2 * MINUTE);
    const s2 = reducer(feeding(), { type: 'ADJUST_START', deltaMs: -5 * MINUTE, now: NOW + 2 * MINUTE });
    expect(s2.current?.startedAt).toBe(NOW - 5 * MINUTE);
  });
});

describe('직렬화 / 복원', () => {
  it('TC-R15 round-trip', () => {
    const s = scheduled();
    expect(deserialize(serialize(s))).toEqual(s);
  });
  it('TC-R16 깨진 입력은 초기 상태', () => {
    expect(deserialize('{not json')).toEqual(initialState());
    expect(deserialize(null)).toEqual(initialState());
    expect(deserialize('')).toEqual(initialState());
  });
  it('TC-R17 알 수 없는 버전은 초기 상태', () => {
    expect(deserialize(JSON.stringify({ version: 99 }))).toEqual(initialState());
  });
  it('누락 필드는 기본값으로 채움', () => {
    const partial = JSON.stringify({ version: 1, onboarded: true, settings: { babyName: '수아' } });
    const s = deserialize(partial);
    expect(s.settings.babyName).toBe('수아');
    expect(s.settings.intervalMinutes).toBe(180);
    expect(s.sessions).toEqual([]);
    expect(s.alarm.ringing).toBe(false);
  });
});

describe('hydrate (앱 재진입)', () => {
  it('TC-R18 예약 시각 지남 & 수유 중 아님 → ringing', () => {
    const s = scheduled();
    expect(hydrate(s, s.alarm.scheduledAt! + 1).alarm.ringing).toBe(true);
    expect(hydrate(s, s.alarm.scheduledAt! - 1).alarm.ringing).toBe(false);
  });
  it('수유 중이면 예약이 지나도 울리지 않음', () => {
    const s = { ...scheduled(), current: feeding().current };
    expect(hydrate(s, NOW + 999 * MINUTE).alarm.ringing).toBe(false);
  });
  it('HYDRATE 액션은 상태를 통째로 교체', () => {
    const s = reducer(initialState(), { type: 'HYDRATE', state: scheduled() });
    expect(s.sessions).toHaveLength(1);
  });
});
