import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../core/store';
import type { Screen as ScreenName } from '../core/App';
import { possessive } from '../domain/korean';
import { computeAlarmAt, progress, remainingMs } from '../domain/alarm';
import { formatClock, formatCountdown, formatDurationKo, formatElapsed, MINUTE } from '../domain/time';
import { durationMs, feedingTypeLabel } from '../domain/feeding';
import { fonts, useTheme } from '../theme/tokens';
import { Screen } from '../components/Screen';
import { Ring } from '../components/Ring';
import { Mascot } from '../components/Mascot';
import { TypeChips } from '../components/TypeChips';
import { BigButton, Card, IconButton, Pill, Toast, useToast } from '../components/ui';

interface Props {
  onNavigate: (s: ScreenName) => void;
}

export function Home({ onNavigate }: Props) {
  const t = useTheme();
  const { state, dispatch, now, haptics, permission, notifier, refreshPermission } = useStore();
  const { current, sessions, settings, alarm } = state;
  const [toast, showToast, clearToast] = useToast();
  const [ending, setEnding] = useState(false);

  const last = sessions[0] ?? null;
  const mode = current ? 'feeding' : alarm.scheduledAt !== null ? 'scheduled' : 'idle';

  const start = () => {
    haptics.tap();
    dispatch({ type: 'START', now: Date.now() });
  };
  const end = () => {
    if (!current) return;
    const at = Date.now();
    const alarmAt = computeAlarmAt(Math.max(at, current.startedAt), settings.intervalMinutes);
    haptics.success();
    setEnding(true);
    dispatch({ type: 'END', now: at });
    showToast(`${formatClock(alarmAt)}에 알려드릴게요`);
    setTimeout(() => setEnding(false), 500);
  };

  const ringProgress =
    mode === 'scheduled' && alarm.scheduledAt !== null
      ? 1 - progress(last?.endedAt ?? alarm.scheduledAt - settings.intervalMinutes * MINUTE, alarm.scheduledAt, now)
      : mode === 'feeding'
        ? 1
        : 0;

  return (
    <Screen>
      <View style={styles.topbar}>
        <View style={{ gap: 4 }}>
          <View style={styles.brand}>
            <Mascot size={30} />
            <Text style={[styles.brandText, { color: t.accentDeep }]}>쪽쪽</Text>
          </View>
          <Pill color={t.lavender} textColor={t.scheme === 'dark' ? '#2b2640' : t.ink}>
            <Text testID="baby-name">{settings.babyName ? `${possessive(settings.babyName)}의 맘마 시간` : '맘마 시간'}</Text>
          </Pill>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="list" label="기록" onPress={() => onNavigate('history')} />
          <IconButton icon="gear" label="설정" onPress={() => onNavigate('settings')} />
        </View>
      </View>

      {permission === 'denied' && (
        <View style={[styles.banner, { backgroundColor: t.rose, borderBottomColor: t.roseDeep }]} accessibilityRole="alert">
          <Text style={{ color: '#fff', fontSize: 14, flex: 1 }}>알림이 꺼져 있어요. 앱이 닫혀 있으면 알려드릴 수 없어요.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="설정 열기" onPress={() => onNavigate('settings')} style={[styles.bannerBtn, { backgroundColor: t.bg2 }]}>
            <Text style={{ color: t.ink, fontSize: 13 }}>설정 열기</Text>
          </Pressable>
        </View>
      )}
      {permission === 'prompt' && (
        <View style={[styles.banner, { backgroundColor: t.bg2, borderColor: t.line, borderWidth: 2, borderBottomWidth: 4 }]}>
          <Text style={{ color: t.ink2, fontSize: 14, flex: 1 }}>알림을 허용하면 앱이 꺼져 있어도 알려드려요.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="허용"
            onPress={async () => {
              await notifier.requestPermission();
              await refreshPermission();
            }}
            style={[styles.bannerBtn, { backgroundColor: t.accent }]}
          >
            <Text style={{ color: t.accentInk, fontSize: 13 }}>허용</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.hero}>
        <Ring progress={ringProgress} mode={mode}>
          {mode === 'feeding' && current && (
            <>
              <Pill color={t.mint} textColor={t.mintInk}>수유 중</Pill>
              <Text testID="elapsed" style={[styles.big, { color: t.ink }]}>{formatElapsed(durationMs(current, now))}</Text>
              <Text style={{ fontSize: 13, color: t.ink2 }}>{formatClock(current.startedAt)} 부터</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {[-5, 5].map((d) => (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityLabel={`${d > 0 ? '+' : ''}${d}분`}
                    onPress={() => dispatch({ type: 'ADJUST_START', deltaMs: d * MINUTE, now: Date.now() })}
                    style={[styles.adjust, { backgroundColor: t.bg2, borderColor: t.line }]}
                  >
                    <Text style={{ fontSize: 12, color: t.ink2 }}>{d > 0 ? '+' : ''}{d}분</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {mode === 'scheduled' && alarm.scheduledAt !== null && (
            <>
              <Pill color={t.butter} textColor="#4d3a08">다음 맘마까지</Pill>
              <Text testID="countdown" style={[styles.big, { color: t.ink }]}>{formatCountdown(remainingMs(alarm.scheduledAt, now))}</Text>
              <Text style={{ fontSize: 13, color: t.ink2 }}>{formatClock(alarm.scheduledAt)}에 알려요</Text>
            </>
          )}
          {mode === 'idle' && (
            <>
              <Mascot size={92} mood="sleepy" motion="bob" />
              <Text style={{ fontSize: 16, color: t.ink, marginTop: 6 }}>수유를 시작해 보세요</Text>
            </>
          )}
        </Ring>
      </View>

      {mode === 'feeding' && current && <TypeChips value={current.type} onChange={(ft) => dispatch({ type: 'SET_TYPE', feedingType: ft })} />}

      <View style={{ flex: 1 }} />

      {mode !== 'feeding' && last && (
        <Card>
          <View style={[styles.cardDot, { backgroundColor: t.pink, borderColor: t.bg2 }]} />
          <Text style={{ fontSize: 12, color: t.ink3, letterSpacing: 1 }}>마지막 수유</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.ink }}>
            {formatClock(last.startedAt)} ~ {formatClock(last.endedAt ?? last.startedAt)}
          </Text>
          <Text style={{ fontSize: 13, color: t.ink2 }}>{formatDurationKo(durationMs(last))} · {feedingTypeLabel(last.type)}</Text>
        </Card>
      )}

      {mode === 'feeding' ? (
        <BigButton label="수유 종료" icon="check" variant="mint" onPress={end} disabled={ending} />
      ) : (
        <BigButton label="수유 시작" icon="bottle" onPress={start} />
      )}

      <Toast message={toast} onDone={clearToast} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.display, fontSize: 26 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 22, borderBottomWidth: 4 },
  bannerBtn: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  hero: { alignItems: 'center', paddingVertical: 6 },
  big: { fontFamily: fonts.display, fontSize: 48, lineHeight: 54, fontVariant: ['tabular-nums'] },
  adjust: { borderWidth: 2, borderBottomWidth: 3, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  cardDot: { position: 'absolute', right: 16, top: -10, width: 22, height: 22, borderRadius: 11, borderWidth: 3 },
});
