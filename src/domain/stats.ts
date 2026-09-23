/** 통계/그룹 — FR-11, FR-12 */
import type { FeedingSession } from './feeding';
import { durationMs } from './feeding';
import { dayKey, dayLabel } from './time';

export interface TodaySummary {
  count: number;
  totalMs: number;
  avgIntervalMs: number | null;
}

export function todaySummary(sessions: FeedingSession[], now: number = Date.now()): TodaySummary {
  const today = dayKey(now);
  const list = sessions
    .filter((s) => s.endedAt !== null && dayKey(s.startedAt) === today)
    .sort((a, b) => a.startedAt - b.startedAt);
  const totalMs = list.reduce((acc, s) => acc + durationMs(s, now), 0);
  let avgIntervalMs: number | null = null;
  if (list.length >= 2) {
    let sum = 0;
    for (let i = 1; i < list.length; i++) {
      sum += list[i].startedAt - (list[i - 1].endedAt as number);
    }
    avgIntervalMs = Math.round(sum / (list.length - 1));
  }
  return { count: list.length, totalMs, avgIntervalMs };
}

export interface DayGroup {
  key: string;
  label: string;
  sessions: FeedingSession[];
}

export function groupByDay(sessions: FeedingSession[], now: number = Date.now()): DayGroup[] {
  const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
  const groups: DayGroup[] = [];
  for (const s of sorted) {
    const key = dayKey(s.startedAt);
    let g = groups[groups.length - 1];
    if (!g || g.key !== key) {
      g = { key, label: dayLabel(s.startedAt, now), sessions: [] };
      groups.push(g);
    }
    g.sessions.push(s);
  }
  return groups;
}
