import { useCallback, useState } from 'react';
import { useStore } from '../app/store';
import { alarmMessage } from '../domain/korean';
import { IntervalPicker } from '../components/IntervalPicker';
import { Toast, useToast } from '../components/Toast';

interface Props {
  onBack: () => void;
}

const APP_VERSION = '0.1.0';

export function Settings({ onBack }: Props) {
  const { state, dispatch, notifier, haptics, permission, exactAlarm, refreshPermission } = useStore();
  const { settings } = state;
  const [name, setName] = useState(settings.babyName);
  const [toast, showToast, clearToast] = useToast();
  const clear = useCallback(() => clearToast(), [clearToast]);

  const commitName = () => {
    const n = name.trim();
    if (n && n !== settings.babyName) dispatch({ type: 'UPDATE_SETTINGS', patch: { babyName: n } });
    else if (!n) setName(settings.babyName);
  };

  const back = () => {
    commitName();
    onBack();
  };

  const preview = async () => {
    haptics.tap();
    await notifier.notifyNow(alarmMessage(name.trim() || settings.babyName), 5000);
    showToast('5초 뒤에 알림이 와요 🔔');
  };

  const reset = () => {
    if (!window.confirm('모든 수유 기록을 삭제할까요?')) return;
    if (!window.confirm('정말요? 되돌릴 수 없어요.')) return;
    haptics.success();
    dispatch({ type: 'RESET_DATA' });
    showToast('기록을 모두 지웠어요');
  };

  const permissionLabel =
    permission === 'granted' ? '허용됨' : permission === 'denied' ? '거부됨' : permission === 'prompt' ? '아직 안 물어봄' : '이 환경은 미지원';

  return (
    <main className="app page">
      <header className="topbar">
        <button type="button" className="back-btn" aria-label="뒤로" onClick={back}>←</button>
        <h1 className="page-title">설정</h1>
        <span className="topbar__spacer" />
      </header>

      <section className="settings rise">
        <label className="field">
          <span className="field__label">아기 이름</span>
          <input
            className="input"
            aria-label="아기 이름"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
          />
        </label>
        <p className="hint">알림 문구: <b className="accent-text">{alarmMessage(name)}</b></p>

        <div className="field">
          <span className="field__label">알람 간격 (수유 종료 기준)</span>
          <IntervalPicker
            value={settings.intervalMinutes}
            onChange={(m) => dispatch({ type: 'UPDATE_SETTINGS', patch: { intervalMinutes: m } })}
          />
        </div>

        <label className="switch-row">
          <span>소리</span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={settings.sound}
            onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { sound: e.target.checked } })}
          />
        </label>
        <label className="switch-row">
          <span>진동</span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={settings.vibrate}
            onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', patch: { vibrate: e.target.checked } })}
          />
        </label>
      </section>

      <section className="settings rise" style={{ animationDelay: '80ms' }}>
        <div className="row-item">
          <span>알림 권한</span>
          <span className={`pill pill--${permission}`}>{permissionLabel}</span>
        </div>
        {permission === 'prompt' && (
          <button
            type="button"
            className="ghost-btn ghost-btn--full"
            onClick={async () => {
              await notifier.requestPermission();
              await refreshPermission();
            }}
          >
            알림 권한 요청
          </button>
        )}
        {permission === 'granted' && !exactAlarm && notifier.openExactAlarmSettings && (
          <button type="button" className="ghost-btn ghost-btn--full" onClick={() => void notifier.openExactAlarmSettings?.()}>
            정확한 알람 허용하기
          </button>
        )}
        <button type="button" className="ghost-btn ghost-btn--full" onClick={preview}>
          알림 미리보기
        </button>
        <p className="hint">5초 뒤에 실제 알림이 와요. 앱을 닫아도 오는지 확인해 보세요.</p>
      </section>

      <section className="settings rise" style={{ animationDelay: '140ms' }}>
        <button type="button" className="ghost-btn ghost-btn--full ghost-btn--danger" onClick={reset}>
          모든 기록 삭제
        </button>
      </section>

      <p className="version">쪽쪽 v{APP_VERSION} · 모든 데이터는 이 기기에만 저장돼요</p>
      <Toast message={toast} onDone={clear} />
    </main>
  );
}
