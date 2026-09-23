import { useState } from 'react';
import { useStore } from '../app/store';
import { alarmMessage } from '../domain/korean';
import { DEFAULT_INTERVAL } from '../domain/alarm';
import { BigButton } from '../components/BigButton';
import { IntervalPicker } from '../components/IntervalPicker';

export function Onboarding() {
  const { dispatch, notifier, haptics, refreshPermission } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = () => {
    if (step === 0) {
      if (!name.trim()) {
        setError('이름을 입력해 주세요');
        return;
      }
      setError('');
    }
    haptics.tap();
    setStep((s) => s + 1);
  };

  const finish = async (askPermission: boolean) => {
    setBusy(true);
    if (askPermission) {
      try {
        await notifier.requestPermission();
        await refreshPermission();
      } catch {
        /* ignore */
      }
    }
    haptics.success();
    dispatch({ type: 'COMPLETE_ONBOARDING', babyName: name, intervalMinutes: interval });
  };

  return (
    <main className="app onboarding">
      <header className="topbar">
        {step > 0 ? (
          <button type="button" className="back-btn" aria-label="이전" onClick={() => setStep((s) => s - 1)}>
            ←
          </button>
        ) : (
          <span className="brand">🍼 쪽쪽</span>
        )}
        <span className="step-dots" aria-label={`${step + 1}단계 / 3단계`}>
          {[0, 1, 2].map((i) => (
            <i key={i} className={i <= step ? 'on' : ''} />
          ))}
        </span>
      </header>

      {step === 0 && (
        <section className="onboarding__body rise">
          <h1 className="display">아기 이름이<br />뭐예요?</h1>
          <label className="field field--big">
            <input
              className="input input--big"
              aria-label="아기 이름"
              placeholder="예: 지민"
              maxLength={12}
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && next()}
            />
          </label>
          {error ? (
            <p className="error" role="alert">{error}</p>
          ) : (
            <p className="hint">→ <b className="accent-text">"{alarmMessage(name)}"</b> 로 불러드릴게요</p>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="onboarding__body rise">
          <h1 className="display">수유 끝나고<br />몇 분 뒤에 알려드릴까요?</h1>
          <IntervalPicker value={interval} onChange={setInterval} />
        </section>
      )}

      {step === 2 && (
        <section className="onboarding__body rise">
          <h1 className="display">알림을<br />허용해 주세요</h1>
          <div className="card card--preview">
            <div className="preview__title">쪽쪽 🍼</div>
            <div className="preview__msg">{alarmMessage(name)}</div>
            <div className="hint">앱이 꺼져 있어도 이렇게 알려드려요.</div>
          </div>
        </section>
      )}

      <footer className="bottom">
        {step < 2 ? (
          <BigButton onClick={next}>다음</BigButton>
        ) : (
          <>
            <BigButton onClick={() => finish(true)} disabled={busy}>알림 허용하고 시작</BigButton>
            <button type="button" className="link-btn" onClick={() => finish(false)} disabled={busy}>
              나중에 할게요
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
