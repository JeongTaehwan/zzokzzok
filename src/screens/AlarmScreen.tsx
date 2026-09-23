import { useEffect } from 'react';
import { useStore } from '../app/store';
import { alarmMessage } from '../domain/korean';
import { formatClock } from '../domain/time';
import { BigButton } from '../components/BigButton';
import { playChime } from '../app/chime';
import { Icon } from '../components/Icon';

export function AlarmScreen() {
  const { state, dispatch, haptics } = useStore();
  const { settings, alarm } = state;
  const message = alarmMessage(settings.babyName);

  useEffect(() => {
    if (settings.sound) playChime();
    if (settings.vibrate) haptics.alarm();
    const id = setInterval(() => {
      if (settings.sound) playChime();
      if (settings.vibrate) haptics.alarm();
    }, 4000);
    return () => {
      clearInterval(id);
      haptics.stop();
    };
  }, [settings.sound, settings.vibrate, haptics]);

  const startFeeding = () => {
    haptics.tap();
    dispatch({ type: 'START', now: Date.now() });
  };
  const snooze = () => {
    haptics.tap();
    dispatch({ type: 'SNOOZE', now: Date.now() });
  };
  const dismiss = () => {
    haptics.tap();
    dispatch({ type: 'DISMISS' });
  };

  return (
    <main className="app alarm" role="alertdialog" aria-labelledby="alarm-message">
      <div className="alarm__body">
        <span className="alarm__emoji"><Icon name="bottle" size={96} strokeWidth={1.3} /></span>
        <h1 className="alarm__msg" id="alarm-message" data-testid="alarm-message">{message}</h1>
        <p className="alarm__meta">
          {alarm.scheduledAt !== null ? `${formatClock(alarm.scheduledAt)} · 예약 알람` : '예약 알람'}
          {alarm.snoozeCount > 0 ? ` · ${alarm.snoozeCount}번 미룸` : ''}
        </p>
      </div>
      <footer className="bottom">
        <BigButton onClick={startFeeding}>
          <Icon name="bottle" /> 수유 시작
        </BigButton>
        <div className="row">
          <button type="button" className="ghost-btn" onClick={snooze}>10분 뒤 다시</button>
          <button type="button" className="ghost-btn" onClick={dismiss}>닫기</button>
        </div>
      </footer>
    </main>
  );
}
