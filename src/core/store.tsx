import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
  type Dispatch, type ReactNode,
} from 'react';
import { AppState as RNAppState } from 'react-native';
import { type AppState, type Action, reducer, initialState, serialize, deserialize, hydrate } from '../domain/state';
import { alarmMessage } from '../domain/korean';
import { isDue } from '../domain/alarm';
import type { StoragePort } from '../ports/storage';
import type { NotifierPort, PermissionState } from '../ports/notifier';
import type { HapticsPort } from '../ports/haptics';
import { NoopHaptics } from '../ports/haptics';

export const STORAGE_KEY = 'zzokzzok.state.v1';

export interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  /** 1초마다 갱신되는 현재 시각 (epoch ms) */
  now: number;
  ready: boolean;
  notifier: NotifierPort;
  haptics: HapticsPort;
  permission: PermissionState;
  refreshPermission: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

interface Props {
  storage: StoragePort;
  notifier: NotifierPort;
  haptics?: HapticsPort;
  children: ReactNode;
}

export function StoreProvider({ storage, notifier, haptics, children }: Props) {
  const [state, rawDispatch] = useReducer(reducer, undefined, initialState);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const hapticsPort = useMemo(() => haptics ?? new NoopHaptics(), [haptics]);

  // 액션 직후 화면의 '현재 시각'이 액션 시각과 어긋나지 않도록 함께 갱신
  const dispatch = useCallback<Dispatch<Action>>((action) => {
    rawDispatch(action);
    setNow(Date.now());
  }, []);

  // 1) 저장소에서 복원
  useEffect(() => {
    let cancelled = false;
    storage.get(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      rawDispatch({ type: 'HYDRATE', state: hydrate(deserialize(raw), Date.now()) });
      setNow(Date.now());
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storage]);

  // 2) 변경 시 저장
  const lastSaved = useRef<string>('');
  useEffect(() => {
    if (!ready) return;
    const raw = serialize(state);
    if (raw === lastSaved.current) return;
    lastSaved.current = raw;
    void storage.set(STORAGE_KEY, raw);
  }, [state, ready, storage]);

  // 6) 권한 상태
  const refreshPermission = useCallback(async () => {
    try {
      setPermission(await notifier.checkPermission());
    } catch {
      /* ignore */
    }
  }, [notifier]);

  // 3) 시계 (1초) + 포그라운드 복귀
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setNow(Date.now());
        void refreshPermission();
      }
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [ready, refreshPermission]);

  // 4) 예약 시각 도달 → 알람 화면
  const { scheduledAt, ringing } = state.alarm;
  const feeding = state.current !== null;
  useEffect(() => {
    if (!ready || feeding || ringing) return;
    if (isDue(scheduledAt, now)) rawDispatch({ type: 'RING' });
  }, [ready, feeding, ringing, scheduledAt, now]);

  // 5) OS 알림 동기화 (예약/취소)
  const babyName = state.settings.babyName;
  useEffect(() => {
    if (!ready) return;
    if (scheduledAt === null) {
      void notifier.cancel();
    } else if (!ringing && scheduledAt > Date.now()) {
      void notifier.schedule(scheduledAt, alarmMessage(babyName));
    }
  }, [ready, scheduledAt, ringing, babyName, notifier]);

  useEffect(() => {
    if (ready) void refreshPermission();
  }, [ready, refreshPermission]);

  const value = useMemo<StoreValue>(
    () => ({ state, dispatch, now, ready, notifier, haptics: hapticsPort, permission, refreshPermission }),
    [state, dispatch, now, ready, notifier, hapticsPort, permission, refreshPermission],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
