/** 한국어 문구 규칙 — FR-06 */

export const DEFAULT_BABY_NAME = '아가';

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

function lastChar(text: string): string {
  const t = text.trim();
  return t.length ? t[t.length - 1] : '';
}

function isHangulSyllable(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

/** 마지막 글자에 받침이 있는가. 한글 음절이 아니면 false. */
export function hasBatchim(text: string): boolean {
  const ch = lastChar(text);
  if (!isHangulSyllable(ch)) return false;
  return (ch.charCodeAt(0) - HANGUL_START) % 28 !== 0;
}

/** 호격: 지민 → 지민아, 수아 → 수아야, Lily → Lily아 */
export function vocative(name: string): string {
  const n = name.trim();
  const ch = lastChar(n);
  if (isHangulSyllable(ch) && !hasBatchim(n)) return `${n}야`;
  return `${n}아`;
}

/** 소유/주격용: 지민 → 지민이, 수아 → 수아 */
export function possessive(name: string): string {
  const n = name.trim();
  return hasBatchim(n) ? `${n}이` : n;
}

/** 알림 본문 문구 */
export function alarmMessage(name: string): string {
  const n = name.trim() || DEFAULT_BABY_NAME;
  return `${vocative(n)}~ 맘마먹자`;
}

export const NOTIFICATION_TITLE = '쪽쪽 🍼';
