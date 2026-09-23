import { useStore } from '../app/store';
import { groupByDay, todaySummary } from '../domain/stats';
import { durationMs, feedingTypeLabel } from '../domain/feeding';
import { formatClock, formatDurationKo } from '../domain/time';
import { Icon } from '../components/Icon';

interface Props {
  onBack: () => void;
}

export function History({ onBack }: Props) {
  const { state, dispatch, now, haptics } = useStore();
  const { sessions } = state;
  const summary = todaySummary(sessions, now);
  const groups = groupByDay(sessions, now);

  const remove = (id: string) => {
    if (!window.confirm('이 수유 기록을 삭제할까요?')) return;
    haptics.tap();
    dispatch({ type: 'DELETE_SESSION', id });
  };

  return (
    <main className="app page">
      <header className="topbar">
        <button type="button" className="back-btn" aria-label="뒤로" onClick={onBack}><Icon name="back" /></button>
        <h1 className="page-title">기록</h1>
        <span className="topbar__spacer" />
      </header>

      <section className="card summary rise">
        <span className="summary__label">오늘</span>
        <span className="summary__big">
          <b data-testid="today-count">{summary.count}회</b>
          {summary.count > 0 && <span> · {formatDurationKo(summary.totalMs)}</span>}
        </span>
        <span className="summary__meta">
          {summary.avgIntervalMs !== null ? `평균 간격 ${formatDurationKo(summary.avgIntervalMs)}` : '평균 간격은 두 번째 수유부터 계산돼요'}
        </span>
      </section>

      {groups.length === 0 ? (
        <p className="empty rise">아직 기록이 없어요.<br />홈에서 수유를 시작해 보세요.</p>
      ) : (
        groups.map((g, gi) => (
          <section key={g.key} className="group rise" style={{ animationDelay: `${80 + gi * 40}ms` }}>
            <h2 className="day-label">{g.label}</h2>
            <ul className="list">
              {g.sessions.map((s) => (
                <li key={s.id} className="session-item" data-testid="session-item">
                  <span className="session-item__time">
                    {formatClock(s.startedAt)} – {s.endedAt !== null ? formatClock(s.endedAt) : '진행 중'}
                  </span>
                  <span className="session-item__meta">
                    {formatDurationKo(durationMs(s, now))} · {feedingTypeLabel(s.type)}
                  </span>
                  <button type="button" className="icon-btn" aria-label="기록 삭제" onClick={() => remove(s.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
