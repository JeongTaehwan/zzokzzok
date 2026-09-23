import { useCallback, useState } from 'react';
import { useStore } from '../app/store';
import type { Screen } from '../app/App';
import { possessive } from '../domain/korean';
import { computeAlarmAt, progress, remainingMs } from '../domain/alarm';
import { formatClock, formatCountdown, formatDurationKo, formatElapsed, MINUTE } from '../domain/time';
import { durationMs, feedingTypeLabel } from '../domain/feeding';
import { Ring } from '../components/Ring';
import { BigButton } from '../components/BigButton';
import { Toast, useToast } from '../components/Toast';
import { TypeChips } from '../components/TypeChips';
import { Icon, Mascot } from '../components/Icon';

interface Props {
  onNavigate: (s: Screen) => void;
}

export function Home({ onNavigate }: Props) {
  const { state, dispatch, now, haptics, permission, exactAlarm, notifier, refreshPermission } = useStore();
  const { current, sessions, settings, alarm } = state;
  const [toast, showToast, clearToast] = useToast();
  const [ending, setEnding] = useState(false);
  const clear = useCallback(() => clearToast(), [clearToast]);

  const last = sessions[0] ?? null;
  const mode = current ? 'feeding' : alarm.scheduledAt !== null ? 'scheduled' : 'idle';

  const start = () => {
    haptics.tap();
    dispatch({ type: 'START', now: Date.now() });
  };

  const end = () => {
    if (!current) return;
    const t = Date.now();
    const at = computeAlarmAt(Math.max(t, current.startedAt), settings.intervalMinutes);
    haptics.success();
    setEnding(true);
    dispatch({ type: 'END', now: t });
    showToast(`${formatClock(at)}에 알려드릴게요`);
    window.setTimeout(() => setEnding(false), 500);
  };

  const ringProgress =
    mode === 'scheduled' && alarm.scheduledAt !== null
      ? 1 - progress(last?.endedAt ?? alarm.scheduledAt - settings.intervalMinutes * MINUTE, alarm.scheduledAt, now)
      : mode === 'feeding'
        ? 1
        : 0;

  return (
    <main className={`app home home--${mode}`}>
      <header className="topbar">
        <div className="brand-block">
          <span className="brand brand--icon"><Mascot size={30} /> 쪽쪽</span>
          <span className="brand-sub" data-testid="baby-name">
            {settings.babyName ? `${possessive(settings.babyName)}의 맘마 시간` : '맘마 시간'}
          </span>
        </div>
        <nav className="nav">
          <button type="button" className="nav-btn" aria-label="기록" onClick={() => onNavigate('history')}>
            <Icon name="list" />
          </button>
          <button type="button" className="nav-btn" aria-label="설정" onClick={() => onNavigate('settings')}>
            <Icon name="gear" />
          </button>
        </nav>
      </header>

      {permission === 'denied' && (
        <div className="banner" role="alert">
          <span>알림이 꺼져 있어요. 앱이 닫혀 있으면 알려드릴 수 없어요.</span>
          <button type="button" className="banner__btn" onClick={() => onNavigate('settings')}>설정 열기</button>
        </div>
      )}
      {permission === 'prompt' && (
        <div className="banner banner--soft">
          <span>알림을 허용하면 앱이 꺼져 있어도 알려드려요.</span>
          <button
            type="button"
            className="banner__btn"
            onClick={async () => {
              await notifier.requestPermission();
              await refreshPermission();
            }}
          >
            허용
          </button>
        </div>
      )}
      {permission === 'granted' && !exactAlarm && notifier.openExactAlarmSettings && (
        <div className="banner banner--soft">
          <span>정확한 시간에 울리려면 알람 권한이 필요해요.</span>
          <button type="button" className="banner__btn" onClick={() => void notifier.openExactAlarmSettings?.()}>
            허용
          </button>
        </div>
      )}

      <section className="hero rise">
        <Ring progress={ringProgress} mode={mode}>
          {mode === 'feeding' && current && (
            <>
              <span className="ring__label">수유 중</span>
              <span className="ring__big" data-testid="elapsed">{formatElapsed(durationMs(current, now))}</span>
              <span className="ring__sub">{formatClock(current.startedAt)} 부터</span>
              <span className="adjust">
                <button type="button" className="adjust__btn" onClick={() => dispatch({ type: 'ADJUST_START', deltaMs: -5 * MINUTE, now: Date.now() })}>
                  -5분
                </button>
                <button type="button" className="adjust__btn" onClick={() => dispatch({ type: 'ADJUST_START', deltaMs: 5 * MINUTE, now: Date.now() })}>
                  +5분
                </button>
              </span>
            </>
          )}
          {mode === 'scheduled' && alarm.scheduledAt !== null && (
            <>
              <span className="ring__label">다음 맘마까지</span>
              <span className="ring__big" data-testid="countdown">{formatCountdown(remainingMs(alarm.scheduledAt, now))}</span>
              <span className="ring__sub">{formatClock(alarm.scheduledAt)}에 알려요</span>
            </>
          )}
          {mode === 'idle' && (
            <>
              <span className="ring__emoji"><Mascot size={92} mood="sleepy" /></span>
              <span className="ring__sub ring__sub--lg">수유를 시작해 보세요</span>
            </>
          )}
        </Ring>
      </section>

      {mode === 'feeding' && (
        <section className="rise" style={{ animationDelay: '80ms' }}>
          <TypeChips value={current!.type} onChange={(t) => dispatch({ type: 'SET_TYPE', feedingType: t })} />
        </section>
      )}

      {mode !== 'feeding' && last && (
        <section className="card last-card rise" style={{ animationDelay: '120ms' }}>
          <span className="last-card__title">마지막 수유</span>
          <span className="last-card__time">
            {formatClock(last.startedAt)} ~ {formatClock(last.endedAt ?? last.startedAt)}
          </span>
          <span className="last-card__meta">
            {formatDurationKo(durationMs(last))} · {feedingTypeLabel(last.type)}
          </span>
        </section>
      )}

      <footer className="bottom">
        {mode === 'feeding' ? (
          <BigButton variant="mint" onClick={end} disabled={ending}>
            <Icon name="check" /> 수유 종료
          </BigButton>
        ) : (
          <BigButton onClick={start}>
            <Icon name="bottle" /> 수유 시작
          </BigButton>
        )}
      </footer>

      <Toast message={toast} onDone={clear} />
    </main>
  );
}
