/** 수유 세션 — FR-03, FR-04, FR-13, FR-18 */

export type FeedingType = 'breast' | 'bottle' | 'solid';

export const FEEDING_TYPES: ReadonlyArray<{ value: FeedingType; label: string; emoji: string }> = [
  { value: 'breast', label: '모유', emoji: '🤱' },
  { value: 'bottle', label: '분유', emoji: '🍼' },
  { value: 'solid', label: '이유식', emoji: '🥣' },
];

export function feedingTypeLabel(type: FeedingType): string {
  return FEEDING_TYPES.find((t) => t.value === type)?.label ?? '수유';
}

export interface FeedingSession {
  id: string;
  startedAt: number;
  endedAt: number | null;
  type: FeedingType;
}

export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function startSession(now: number, type: FeedingType, id: string = newId()): FeedingSession {
  return { id, startedAt: now, endedAt: null, type };
}

export function endSession(session: FeedingSession, endedAt: number): FeedingSession {
  if (endedAt < session.startedAt) {
    throw new Error('종료 시각이 시작 시각보다 앞설 수 없어요');
  }
  return { ...session, endedAt };
}

export function durationMs(session: FeedingSession, now: number = Date.now()): number {
  return (session.endedAt ?? now) - session.startedAt;
}

/** 시작 시각 보정. now 를 넘길 수 없다. */
export function adjustStart(session: FeedingSession, deltaMs: number, now: number): FeedingSession {
  return { ...session, startedAt: Math.min(session.startedAt + deltaMs, now) };
}

export function setType(session: FeedingSession, type: FeedingType): FeedingSession {
  return { ...session, type };
}
