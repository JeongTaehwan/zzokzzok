import { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import type { StoragePort } from '../ports/storage';
import type { NotifierPort } from '../ports/notifier';
import type { HapticsPort } from '../ports/haptics';
import { Onboarding } from '../screens/Onboarding';
import { Home } from '../screens/Home';
import { AlarmScreen } from '../screens/AlarmScreen';
import { History } from '../screens/History';
import { Settings } from '../screens/Settings';
import '../styles/tokens.css';
import '../styles/global.css';

export type Screen = 'home' | 'history' | 'settings';

interface AppProps {
  storage: StoragePort;
  notifier: NotifierPort;
  haptics?: HapticsPort;
}

export function App(props: AppProps) {
  return (
    <StoreProvider storage={props.storage} notifier={props.notifier} haptics={props.haptics}>
      <Router />
    </StoreProvider>
  );
}

function Router() {
  const { state, ready } = useStore();
  const [screen, setScreen] = useState<Screen>('home');
  const goHome = useCallback(() => setScreen('home'), []);

  // Android 하드웨어 뒤로가기: 홈이 아니면 홈으로, 홈이면 앱 종료 요청
  useEffect(() => {
    const onBack = () => {
      if (screen !== 'home') setScreen('home');
      else window.dispatchEvent(new Event('zzokzzok:exit'));
    };
    window.addEventListener('zzokzzok:back', onBack);
    return () => window.removeEventListener('zzokzzok:back', onBack);
  }, [screen]);

  if (!ready) return <div className="app app--loading" aria-busy="true" />;
  if (!state.onboarded) return <Onboarding />;
  if (state.alarm.ringing) return <AlarmScreen />;
  if (screen === 'history') return <History onBack={goHome} />;
  if (screen === 'settings') return <Settings onBack={goHome} />;
  return <Home onNavigate={setScreen} />;
}
