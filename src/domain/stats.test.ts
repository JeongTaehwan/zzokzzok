// 테스트 계획 2.5 — 통계 (FR-11, FR-12)
import { todaySummary, groupByDay } from './stats';
import type { FeedingSession } from './feeding';
import { MINUTE, HOUR } from './time';

const local = (d: number, h: number, mi = 0) => new Date(2026, 8, d, h, mi).getTime();
const NOW = local(23, 14, 0);
const mk = (id: string, start: number, mins: number): FeedingSession => ({
  id, startedAt: start, endedAt: start + mins * MINUTE, type: 'breast',
});

// 오늘 3개(02:00, 05:00, 08:00), 어제 2개
const sessions: FeedingSession[] = [
  mk('t3', local(23, 8, 0), 20),
  mk('t2', local(23, 5, 0), 30),
  mk('t1', local(23, 2, 0), 10),
  mk('y2', local(22, 20, 0), 15),
  mk('y1', local(22, 17, 0), 25),
];

describe('todaySummary', () => {
  const s = todaySummary(sessions, NOW);
  it('TC-S01 오늘 횟수', () => expect(s.count).toBe(3));
  it('TC-S02 총 시간', () => expect(s.totalMs).toBe(60 * MINUTE));
  it('TC-S03 평균 간격 (이전 종료 → 다음 시작)', () => {
    // t1 종료 02:10 → t2 시작 05:00 = 170분, t2 종료 05:30 → t3 시작 08:00 = 150분 → 평균 160분
    expect(s.avgIntervalMs).toBe(160 * MINUTE);
  });
  it('세션이 1개 이하면 평균 간격 null', () => {
    expect(todaySummary([sessions[0]], NOW).avgIntervalMs).toBeNull();
    expect(todaySummary([], NOW).count).toBe(0);
    expect(todaySummary([], NOW).avgIntervalMs).toBeNull();
  });
});

describe('groupByDay', () => {
  const groups = groupByDay(sessions, NOW);
  it('TC-S04 날짜별 그룹, 최신 날짜 먼저', () => {
    expect(groups.map((g) => g.label)).toEqual(['오늘', '어제']);
    expect(groups[0].key).toBe('2026-09-23');
  });
  it('그룹 내 최신순', () => {
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['t3', 't2', 't1']);
    expect(groups[1].sessions.map((s) => s.id)).toEqual(['y2', 'y1']);
  });
  it('입력 순서가 섞여도 정렬', () => {
    const shuffled = [sessions[4], sessions[0], sessions[2], sessions[1], sessions[3]];
    expect(groupByDay(shuffled, NOW)[0].sessions.map((s) => s.id)).toEqual(['t3', 't2', 't1']);
  });
  it('빈 입력', () => expect(groupByDay([], NOW)).toEqual([]));
  it('HOUR 상수 sanity', () => expect(HOUR).toBe(60 * MINUTE));
});
