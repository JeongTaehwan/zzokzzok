import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState,
  type Dispatch, type ReactNode,
} from 'react';
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
  exactAlarm: boolean;
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
  // 액션 직후 화면의 '현재 시각'이 액션 시각과 어긋나지 않도록 함께 갱신
  const dispatch = useCallback<Dispatch<Action>>((action) => {
    rawDispatch(action);
    setNow(Date.now());
  }, []);
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [exactAlarm, setExactAlarm] = useState(true);
  const hapticsPort = useMemo(() => haptics ?? new NoopHaptics(), [haptics]);

  // 1) 저장소에서 복원
  useEffect(() => {
    let cancelled = false;
    storage.get(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      dispatch({ type: 'HYDRATE', state: hydrate(deserialize(raw), Date.now()) });
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

  // 3) 시계 (1초) + 포그라운드 복귀
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
        void refreshPermission();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // 4) 예약 시각 도달 → 알람 화면
  const { scheduledAt, ringing } = state.alarm;
  const feeding = state.current !== null;
  useEffect(() => {
    if (!ready || feeding || ringing) return;
    if (isDue(scheduledAt, now)) dispatch({ type: 'RING' });
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

  // 6) 권한 상태
  const refreshPermission = useCallback(async () => {
    try {
      setPermission(await notifier.checkPermission());
      if (notifier.exactAlarmAllowed) setExactAlarm(await notifier.exactAlarmAllowed());
    } catch {
      /* ignore */
    }
  }, [notifier]);
  useEffect(() => {
    if (ready) void refreshPermission();
  }, [ready, refreshPermission]);

  const value = useMemo<StoreValue>(
    () => ({ state, dispatch, now, ready, notifier, haptics: hapticsPort, permission, exactAlarm, refreshPermission }),
    [state, now, ready, notifier, hapticsPort, permission, exactAlarm, refreshPermission],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
