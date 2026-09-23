import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from './app/App';
import { LocalStorageAdapter, type StoragePort } from './ports/storage';
import { WebNotifier, type NotifierPort } from './ports/notifier';
import { WebHaptics, type HapticsPort } from './ports/haptics';

async function boot() {
  let storage: StoragePort;
  let notifier: NotifierPort;
  let haptics: HapticsPort;

  if (Capacitor.isNativePlatform()) {
    const [{ PreferencesStorage }, { CapacitorNotifier }, { CapacitorHaptics }, { App: CapApp }, { StatusBar, Style }, { SplashScreen }] =
      await Promise.all([
        import('./ports/storage.native'),
        import('./ports/notifier.native'),
        import('./ports/haptics.native'),
        import('@capacitor/app'),
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
      ]);
    storage = new PreferencesStorage();
    const native = new CapacitorNotifier();
    await native.init();
    notifier = native;
    haptics = new CapacitorHaptics();

    // 하드웨어 뒤로가기 ↔ 라우터 연결
    void CapApp.addListener('backButton', () => window.dispatchEvent(new Event('zzokzzok:back')));
    window.addEventListener('zzokzzok:exit', () => void CapApp.exitApp());

    try {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: dark ? '#1e1a2a' : '#fff6ea' });
      }
    } catch {
      /* ignore */
    }
    window.setTimeout(() => void SplashScreen.hide(), 50);
  } else {
    storage = new LocalStorageAdapter();
    notifier = new WebNotifier();
    haptics = new WebHaptics();
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({ immediate: true });
      } catch {
        /* SW 미지원 */
      }
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App storage={storage} notifier={notifier} haptics={haptics} />
    </StrictMode>,
  );
}

void boot();
