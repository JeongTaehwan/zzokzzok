// 테스트 계획 2.8 — 화면 흐름 (온보딩 → 홈 → 수유 → 알람 → 기록/설정)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { MemoryStorage } from '../ports/storage';
import type { NotifierPort } from '../ports/notifier';
import { NoopHaptics } from '../ports/haptics';
import { STORAGE_KEY } from './store';
import { MINUTE, HOUR } from '../domain/time';

const START_TIME = new Date(2026, 8, 23, 2, 10, 0, 0); // 2026-09-23 02:10 로컬

function makeNotifier(): NotifierPort & { schedule: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; requestPermission: ReturnType<typeof vi.fn> } {
  return {
    checkPermission: vi.fn(async () => 'granted' as const),
    requestPermission: vi.fn(async () => 'granted' as const),
    schedule: vi.fn(async () => {}),
    cancel: vi.fn(async () => {}),
    notifyNow: vi.fn(async () => {}),
  };
}

let storage: MemoryStorage;
let notifier: ReturnType<typeof makeNotifier>;

function setup() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(<App storage={storage} notifier={notifier} haptics={new NoopHaptics()} />);
  return { user, ...view };
}

async function tick(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

async function completeOnboarding(user: ReturnType<typeof userEvent.setup>, allowNotifications = false) {
  await user.type(await screen.findByLabelText('아기 이름'), '지민');
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.click(screen.getByRole('button', { name: '180분' }));
  await user.click(screen.getByRole('button', { name: '다음' }));
  await user.click(screen.getByRole('button', { name: allowNotifications ? '알림 허용하고 시작' : '나중에 할게요' }));
  await screen.findByTestId('baby-name');
}

async function feedFor10Minutes(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: '수유 시작' }));
  await tick(10 * MINUTE);
  await user.click(screen.getByRole('button', { name: '수유 종료' }));
}

async function persisted() {
  const raw = await storage.get(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(START_TIME);
  storage = new MemoryStorage();
  notifier = makeNotifier();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('온보딩', () => {
  it('TC-U01 이름·간격 입력 후 홈 진입, 헤더에 이름', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    expect(screen.getByTestId('baby-name')).toHaveTextContent('지민');
    expect(screen.getByRole('button', { name: '수유 시작' })).toBeInTheDocument();
    expect(notifier.requestPermission).not.toHaveBeenCalled();
    expect((await persisted()).onboarded).toBe(true);
  });

  it('TC-U02 이름을 비우면 진행되지 않음', async () => {
    const { user } = setup();
    await screen.findByLabelText('아기 이름');
    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('이름을 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByLabelText('아기 이름')).toBeInTheDocument();
  });

  it('"알림 허용하고 시작" 은 권한을 요청', async () => {
    const { user } = setup();
    await completeOnboarding(user, true);
    expect(notifier.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('직접 입력한 간격이 반영됨', async () => {
    const { user } = setup();
    await user.type(await screen.findByLabelText('아기 이름'), '수아');
    await user.click(screen.getByRole('button', { name: '다음' }));
    const input = screen.getByLabelText('알람 간격(분)');
    await user.clear(input);
    await user.type(input, '95');
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: '나중에 할게요' }));
    await screen.findByTestId('baby-name');
    expect((await persisted()).settings.intervalMinutes).toBe(95);
  });
});

describe('수유 흐름', () => {
  it('TC-U03 수유 시작 → 경과 타이머와 종료 버튼', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    expect(screen.getByText('수유를 시작해 보세요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '수유 시작' }));
    expect(screen.getByTestId('elapsed')).toHaveTextContent(/^00:0\d$/);
    expect(screen.getByRole('button', { name: '수유 종료' })).toBeInTheDocument();
    await tick(5 * MINUTE);
    // 1초 틱 경계 때문에 04:59~05:0x 허용
    expect(screen.getByTestId('elapsed')).toHaveTextContent(/^0(4:5\d|5:0\d)$/);
  });

  it('TC-U04 수유 종료 → 토스트, 카운트다운, 알림 예약', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    // 02:10 시작 + 10분 = 02:20 종료, +180분 = 05:20
    expect(await screen.findByText(/05:20에 알려드릴게요/)).toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toHaveTextContent(/^(3:00:00|2:59:5\d)$/);
    const state = await persisted();
    expect(state.sessions).toHaveLength(1);
    expect(notifier.schedule).toHaveBeenLastCalledWith(state.alarm.scheduledAt, '지민아~ 맘마먹자');
  });

  it('수유 종류 선택이 기록에 반영', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '수유 시작' }));
    await user.click(screen.getByRole('button', { name: '분유' }));
    await user.click(screen.getByRole('button', { name: '수유 종료' }));
    expect((await persisted()).sessions[0].type).toBe('bottle');
  });

  it('시작 시각 보정(-5분)이 경과 시간에 반영', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '수유 시작' }));
    await user.click(screen.getByRole('button', { name: '-5분' }));
    expect(screen.getByTestId('elapsed')).toHaveTextContent(/^05:0\d$/);
  });
});

describe('알람', () => {
  it('TC-U05 예약 시각 도달 → 알람 화면', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await tick(3 * HOUR + 1000);
    expect(await screen.findByTestId('alarm-message')).toHaveTextContent('지민아~ 맘마먹자');
    expect(screen.getByRole('button', { name: '10분 뒤 다시' })).toBeInTheDocument();
  });

  it('TC-U06 스누즈 → 10분 카운트다운, 재예약', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await tick(3 * HOUR + 1000);
    await screen.findByTestId('alarm-message');
    notifier.schedule.mockClear();
    await user.click(screen.getByRole('button', { name: '10분 뒤 다시' }));
    expect(screen.queryByTestId('alarm-message')).not.toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toHaveTextContent(/^(10:00|9:5\d)$/);
    const state = await persisted();
    expect(state.alarm.snoozeCount).toBe(1);
    expect(notifier.schedule).toHaveBeenCalledWith(state.alarm.scheduledAt, '지민아~ 맘마먹자');
  });

  it('TC-U07 알람 화면에서 수유 시작 → 수유 중, 알림 취소', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await tick(3 * HOUR + 1000);
    await screen.findByTestId('alarm-message');
    notifier.cancel.mockClear();
    await user.click(screen.getByRole('button', { name: '수유 시작' }));
    expect(screen.getByTestId('elapsed')).toBeInTheDocument();
    expect(notifier.cancel).toHaveBeenCalled();
    expect((await persisted()).alarm.scheduledAt).toBeNull();
  });

  it('닫기 → 예약 없는 대기 화면', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await tick(3 * HOUR + 1000);
    await screen.findByTestId('alarm-message');
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.getByText('수유를 시작해 보세요')).toBeInTheDocument();
  });

  it('앱 재진입 시 지난 알람이면 바로 알람 화면 (FR-08)', async () => {
    const { user, unmount } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    unmount();
    vi.setSystemTime(new Date(START_TIME.getTime() + 4 * HOUR));
    setup();
    expect(await screen.findByTestId('alarm-message')).toHaveTextContent('지민아~ 맘마먹자');
  });
});

describe('기록', () => {
  it('TC-U08 방금 수유가 10분으로 표시', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await user.click(screen.getByRole('button', { name: '기록' }));
    const items = await screen.findAllByTestId('session-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('02:10');
    expect(items[0]).toHaveTextContent('02:20');
    expect(items[0]).toHaveTextContent('10분');
    expect(screen.getByTestId('today-count')).toHaveTextContent('1회');
  });

  it('TC-U09 삭제', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await user.click(screen.getByRole('button', { name: '기록' }));
    const item = (await screen.findAllByTestId('session-item'))[0];
    await user.click(within(item).getByRole('button', { name: '기록 삭제' }));
    expect(screen.queryAllByTestId('session-item')).toHaveLength(0);
    expect((await persisted()).sessions).toHaveLength(0);
  });

  it('뒤로 가면 홈', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '기록' }));
    await user.click(await screen.findByRole('button', { name: '뒤로' }));
    expect(screen.getByRole('button', { name: '수유 시작' })).toBeInTheDocument();
  });
});

describe('영속성 / 설정', () => {
  it('TC-U10 다시 마운트해도 수유 중 상태 복원', async () => {
    const { user, unmount } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '수유 시작' }));
    await tick(3 * MINUTE);
    unmount();
    setup();
    expect(await screen.findByTestId('elapsed')).toHaveTextContent(/^03:0\d$/);
    expect(screen.getByRole('button', { name: '수유 종료' })).toBeInTheDocument();
  });

  it('TC-U11 설정에서 간격 120으로 변경 → 카운트다운 재계산', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(await screen.findByRole('button', { name: '120분' }));
    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(screen.getByTestId('countdown')).toHaveTextContent(/^(2:00:00|1:59:5\d)$/);
    expect((await persisted()).settings.intervalMinutes).toBe(120);
  });

  it('설정에서 이름 변경 → 헤더와 알림 문구 반영', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '설정' }));
    const name = await screen.findByLabelText('아기 이름');
    await user.clear(name);
    await user.type(name, '수아');
    await user.click(screen.getByRole('button', { name: '뒤로' }));
    expect(screen.getByTestId('baby-name')).toHaveTextContent('수아');
    await feedFor10Minutes(user);
    expect(notifier.schedule).toHaveBeenLastCalledWith(expect.any(Number), '수아야~ 맘마먹자');
  });

  it('알림 미리보기는 notifyNow 호출 (FR-16)', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(await screen.findByRole('button', { name: '알림 미리보기' }));
    expect(notifier.notifyNow).toHaveBeenCalledWith('지민아~ 맘마먹자', expect.any(Number));
  });

  it('모든 기록 삭제 (FR-17)', async () => {
    const { user } = setup();
    await completeOnboarding(user);
    await feedFor10Minutes(user);
    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(await screen.findByRole('button', { name: '모든 기록 삭제' }));
    expect((await persisted()).sessions).toHaveLength(0);
    expect((await persisted()).onboarded).toBe(true);
  });
});
