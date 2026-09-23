/** 알람 계산 — FR-02, FR-05, FR-08, FR-09 */
import { MINUTE } from './time';

export const MIN_INTERVAL = 5;
export const MAX_INTERVAL = 720;
export const DEFAULT_INTERVAL = 180;
export const SNOOZE_MINUTES = 10;
export const INTERVAL_PRESETS = [90, 120, 150, 180, 240] as const;

export function clampInterval(minutes: number): number {
  if (!Number.isFinite(minutes)) return DEFAULT_INTERVAL;
  return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(minutes)));
}

export function computeAlarmAt(endedAt: number, intervalMinutes: number): number {
  return endedAt + intervalMinutes * MINUTE;
}

export function isDue(scheduledAt: number | null, now: number): boolean {
  return scheduledAt !== null && now >= scheduledAt;
}

export function snoozeAt(now: number): number {
  return now + SNOOZE_MINUTES * MINUTE;
}

export function remainingMs(scheduledAt: number | null, now: number): number {
  if (scheduledAt === null) return 0;
  return Math.max(0, scheduledAt - now);
}

/** 시작~예약 구간에서 now 가 지난 비율 (0~1) */
export function progress(startAt: number, scheduledAt: number, now: number): number {
  const total = scheduledAt - startAt;
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, (now - startAt) / total));
}
