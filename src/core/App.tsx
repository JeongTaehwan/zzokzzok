import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StoreProvider, useStore } from './store';
import { type StoragePort, AsyncStorageAdapter } from '../ports/storage';
import { type NotifierPort, ExpoNotifier } from '../ports/notifier';
import { type HapticsPort, ExpoHaptics } from '../ports/haptics';
import { useTheme } from '../theme/tokens';
import { Onboarding } from '../screens/Onboarding';
import { Home } from '../screens/Home';
import { AlarmScreen } from '../screens/AlarmScreen';
import { History } from '../screens/History';
import { Settings } from '../screens/Settings';

export type Screen = 'home' | 'history' | 'settings';

SplashScreen.preventAutoHideAsync().catch(() => {});

interface AppProps {
  storage?: StoragePort;
  notifier?: NotifierPort;
  haptics?: HapticsPort;
}

let defaultNotifier: ExpoNotifier | null = null;
function getDefaultNotifier() {
  if (!defaultNotifier) {
    defaultNotifier = new ExpoNotifier();
    void defaultNotifier.init();
  }
  return defaultNotifier;
}

export function App(props: AppProps) {
  const storage = useMemo(() => props.storage ?? new AsyncStorageAdapter(), [props.storage]);
  const notifier = useMemo(() => props.notifier ?? getDefaultNotifier(), [props.notifier]);
  const haptics = useMemo(() => props.haptics ?? new ExpoHaptics(), [props.haptics]);
  const [fontsLoaded] = useFonts({ Jua: require('../../assets/fonts/Jua-Regular.ttf') });
  const theme = useTheme();

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;

  return (
    <SafeAreaProvider>
      <StoreProvider storage={storage} notifier={notifier} haptics={haptics}>
        <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        <Router />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Router() {
  const { state, ready } = useStore();
  const theme = useTheme();
  const [screen, setScreen] = useState<Screen>('home');
  const goHome = useCallback(() => setScreen('home'), []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Android 하드웨어 뒤로가기: 홈이 아니면 홈으로
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'home') {
        setScreen('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  if (!state.onboarded) return <Onboarding />;
  if (state.alarm.ringing) return <AlarmScreen />;
  if (screen === 'history') return <History onBack={goHome} />;
  if (screen === 'settings') return <Settings onBack={goHome} />;
  return <Home onNavigate={setScreen} />;
}
