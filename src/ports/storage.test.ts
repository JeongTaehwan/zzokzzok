// 테스트 계획 2.7 — 저장소 포트 (FR-14)
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage, LocalStorageAdapter } from './storage';

describe.each([
  ['MemoryStorage', () => new MemoryStorage()],
  ['LocalStorageAdapter', () => new LocalStorageAdapter()],
])('%s', (_name, make) => {
  beforeEach(() => localStorage.clear());

  it('TC-P04 set → get 동일, 없으면 null', async () => {
    const s = make();
    expect(await s.get('k')).toBeNull();
    await s.set('k', 'v');
    expect(await s.get('k')).toBe('v');
  });
  it('remove', async () => {
    const s = make();
    await s.set('k', 'v');
    await s.remove('k');
    expect(await s.get('k')).toBeNull();
  });
});
