import { Preferences } from '@capacitor/preferences';
import type { StoragePort } from './storage';

/** Capacitor Preferences (Android SharedPreferences / iOS UserDefaults) */
export class PreferencesStorage implements StoragePort {
  async get(key: string) {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  }
  async set(key: string, value: string) {
    await Preferences.set({ key, value });
  }
  async remove(key: string) {
    await Preferences.remove({ key });
  }
}
