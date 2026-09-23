/** 시간 포맷/날짜 유틸 — FR-03, FR-05, FR-11 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, '0');

function split(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

/** 경과 시간: mm:ss, 1시간 이상이면 h:mm:ss */
export function formatElapsed(ms: number): string {
  const { h, m, s } = split(Math.max(0, Math.floor(ms / SECOND)));
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** 남은 시간: m:ss, 1시간 이상이면 h:mm:ss, 음수는 0:00 */
export function formatCountdown(ms: number): string {
  const { h, m, s } = split(Math.max(0, Math.ceil(ms / SECOND)));
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** 소요 시간을 한국어로: 22분 / 2시간 14분 / 2시간 / 1분 미만 */
export function formatDurationKo(ms: number): string {
  const minutes = Math.floor(ms / MINUTE);
  if (minutes < 1) return '1분 미만';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** 로컬 HH:mm */
export function formatClock(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 로컬 YYYY-MM-DD */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 오늘 / 어제 / M월 D일 */
export function dayLabel(ts: number, now: number = Date.now()): string {
  const key = dayKey(ts);
  if (key === dayKey(now)) return '오늘';
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (key === dayKey(y.getTime())) return '어제';
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
