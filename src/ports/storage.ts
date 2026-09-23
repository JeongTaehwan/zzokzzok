/** 저장소 포트 — FR-14 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoragePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/** 테스트용 메모리 저장소 */
export class MemoryStorage implements StoragePort {
  private map = new Map<string, string>();
  async get(key: string) {
    return this.map.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.map.set(key, value);
  }
  async remove(key: string) {
    this.map.delete(key);
  }
}

/** 기기 저장소 (Android SharedPreferences / iOS 파일) */
export class AsyncStorageAdapter implements StoragePort {
  async get(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
  async set(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* 저장 실패는 조용히 무시 */
    }
  }
  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
