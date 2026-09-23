// 테스트 계획 2.7 — 저장소 포트 (FR-14)
import { MemoryStorage, AsyncStorageAdapter } from './storage';

describe.each([
  ['MemoryStorage', () => new MemoryStorage()],
  ['AsyncStorageAdapter', () => new AsyncStorageAdapter()],
])('%s', (_name, make) => {
  it('TC-P04 set → get 동일, 없으면 null', async () => {
    const s = make();
    expect(await s.get('k-' + _name)).toBeNull();
    await s.set('k-' + _name, 'v');
    expect(await s.get('k-' + _name)).toBe('v');
  });
  it('remove', async () => {
    const s = make();
    await s.set('r-' + _name, 'v');
    await s.remove('r-' + _name);
    expect(await s.get('r-' + _name)).toBeNull();
  });
});
