/** 앱 상태 + 리듀서 + 직렬화 — FR-01~18 */
import { type FeedingSession, type FeedingType, startSession, endSession, adjustStart, setType } from './feeding';
import { DEFAULT_INTERVAL, clampInterval, computeAlarmAt, isDue, snoozeAt } from './alarm';

export interface Settings {
  babyName: string;
  intervalMinutes: number;
  lastFeedingType: FeedingType;
  sound: boolean;
  vibrate: boolean;
}

export interface AlarmState {
  scheduledAt: number | null;
  snoozeCount: number;
  ringing: boolean;
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  settings: Settings;
  current: FeedingSession | null;
  sessions: FeedingSession[];
  alarm: AlarmState;
}

export type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'COMPLETE_ONBOARDING'; babyName: string; intervalMinutes: number }
  | { type: 'START'; now: number; feedingType?: FeedingType }
  | { type: 'END'; now: number }
  | { type: 'RING' }
  | { type: 'SNOOZE'; now: number }
  | { type: 'DISMISS' }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'DELETE_SESSION'; id: string }
  | { type: 'RESET_DATA' }
  | { type: 'SET_TYPE'; feedingType: FeedingType }
  | { type: 'ADJUST_START'; deltaMs: number; now: number };

const defaultSettings = (): Settings => ({
  babyName: '',
  intervalMinutes: DEFAULT_INTERVAL,
  lastFeedingType: 'breast',
  sound: true,
  vibrate: true,
});

const defaultAlarm = (): AlarmState => ({ scheduledAt: null, snoozeCount: 0, ringing: false });

export function initialState(): AppState {
  return {
    version: 1,
    onboarded: false,
    settings: defaultSettings(),
    current: null,
    sessions: [],
    alarm: defaultAlarm(),
  };
}

function sanitizeSettings(patch: Partial<Settings>, base: Settings): Settings {
  const next = { ...base, ...patch };
  if (patch.babyName !== undefined) next.babyName = String(patch.babyName).trim().slice(0, 12);
  if (patch.intervalMinutes !== undefined) next.intervalMinutes = clampInterval(Number(patch.intervalMinutes));
  return next;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboarded: true,
        settings: sanitizeSettings(
          { babyName: action.babyName, intervalMinutes: action.intervalMinutes },
          state.settings,
        ),
      };

    case 'START': {
      if (state.current) return state;
      const type = action.feedingType ?? state.settings.lastFeedingType;
      return {
        ...state,
        current: startSession(action.now, type),
        alarm: { ...state.alarm, scheduledAt: null, ringing: false },
      };
    }

    case 'END': {
      if (!state.current) return state;
      const endedAt = Math.max(action.now, state.current.startedAt);
      const done = endSession(state.current, endedAt);
      return {
        ...state,
        current: null,
        sessions: [done, ...state.sessions],
        alarm: { scheduledAt: computeAlarmAt(endedAt, state.settings.intervalMinutes), snoozeCount: 0, ringing: false },
      };
    }

    case 'RING':
      return { ...state, alarm: { ...state.alarm, ringing: true } };

    case 'SNOOZE':
      return {
        ...state,
        alarm: { scheduledAt: snoozeAt(action.now), snoozeCount: state.alarm.snoozeCount + 1, ringing: false },
      };

    case 'DISMISS':
      return { ...state, alarm: { ...state.alarm, scheduledAt: null, ringing: false } };

    case 'UPDATE_SETTINGS': {
      const settings = sanitizeSettings(action.patch, state.settings);
      let alarm = state.alarm;
      const intervalChanged = settings.intervalMinutes !== state.settings.intervalMinutes;
      const lastEnd = state.sessions[0]?.endedAt ?? null;
      if (intervalChanged && alarm.scheduledAt !== null && lastEnd !== null) {
        alarm = { ...alarm, scheduledAt: computeAlarmAt(lastEnd, settings.intervalMinutes) };
      }
      return { ...state, settings, alarm };
    }

    case 'DELETE_SESSION': {
      const sessions = state.sessions.filter((s) => s.id !== action.id);
      if (sessions.length === state.sessions.length) return state;
      return { ...state, sessions };
    }

    case 'RESET_DATA':
      return { ...state, current: null, sessions: [], alarm: defaultAlarm() };

    case 'SET_TYPE':
      return {
        ...state,
        settings: { ...state.settings, lastFeedingType: action.feedingType },
        current: state.current ? setType(state.current, action.feedingType) : null,
      };

    case 'ADJUST_START':
      if (!state.current) return state;
      return { ...state, current: adjustStart(state.current, action.deltaMs, action.now) };

    default:
      return state;
  }
}

/** 앱 재진입 시: 예약이 지났고 수유 중이 아니면 알람 화면 */
export function hydrate(state: AppState, now: number): AppState {
  const ringing = !state.current && isDue(state.alarm.scheduledAt, now);
  if (ringing === state.alarm.ringing) return state;
  return { ...state, alarm: { ...state.alarm, ringing } };
}

export function serialize(state: AppState): string {
  return JSON.stringify(state);
}

const FEEDING_TYPES: FeedingType[] = ['breast', 'bottle', 'solid'];

function isSession(v: unknown): v is FeedingSession {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.startedAt === 'number' &&
    (s.endedAt === null || typeof s.endedAt === 'number') &&
    FEEDING_TYPES.includes(s.type as FeedingType)
  );
}

export function deserialize(raw: string | null | undefined): AppState {
  if (!raw) return initialState();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return initialState();
  }
  if (!parsed || typeof parsed !== 'object') return initialState();
  const p = parsed as Partial<AppState> & Record<string, unknown>;
  if (p.version !== 1) return initialState();

  const base = initialState();
  const settingsIn = (p.settings ?? {}) as Partial<Settings>;
  const settings: Settings = {
    babyName: typeof settingsIn.babyName === 'string' ? settingsIn.babyName : base.settings.babyName,
    intervalMinutes: clampInterval(Number(settingsIn.intervalMinutes ?? base.settings.intervalMinutes)),
    lastFeedingType: FEEDING_TYPES.includes(settingsIn.lastFeedingType as FeedingType)
      ? (settingsIn.lastFeedingType as FeedingType)
      : base.settings.lastFeedingType,
    sound: typeof settingsIn.sound === 'boolean' ? settingsIn.sound : base.settings.sound,
    vibrate: typeof settingsIn.vibrate === 'boolean' ? settingsIn.vibrate : base.settings.vibrate,
  };
  const alarmIn = (p.alarm ?? {}) as Partial<AlarmState>;
  const alarm: AlarmState = {
    scheduledAt: typeof alarmIn.scheduledAt === 'number' ? alarmIn.scheduledAt : null,
    snoozeCount: typeof alarmIn.snoozeCount === 'number' ? alarmIn.snoozeCount : 0,
    ringing: alarmIn.ringing === true,
  };
  return {
    version: 1,
    onboarded: p.onboarded === true,
    settings,
    current: isSession(p.current) && p.current.endedAt === null ? p.current : null,
    sessions: Array.isArray(p.sessions) ? p.sessions.filter(isSession) : [],
    alarm,
  };
}
