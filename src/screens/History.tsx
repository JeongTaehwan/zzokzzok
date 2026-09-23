import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../core/store';
import { groupByDay, todaySummary } from '../domain/stats';
import { durationMs, feedingTypeLabel } from '../domain/feeding';
import { formatClock, formatDurationKo } from '../domain/time';
import { fonts, useTheme } from '../theme/tokens';
import { Screen } from '../components/Screen';
import { Card, IconButton, Pill } from '../components/ui';

interface Props {
  onBack: () => void;
}

export function History({ onBack }: Props) {
  const t = useTheme();
  const { state, dispatch, now, haptics } = useStore();
  const { sessions } = state;
  const summary = todaySummary(sessions, now);
  const groups = groupByDay(sessions, now);

  const remove = (id: string) => {
    Alert.alert('기록 삭제', '이 수유 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { haptics.tap(); dispatch({ type: 'DELETE_SESSION', id }); } },
    ]);
  };

  return (
    <Screen>
      <View style={styles.topbar}>
        <IconButton icon="back" label="뒤로" onPress={onBack} />
        <Text style={[styles.title, { color: t.accentDeep }]}>기록</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Card style={{ overflow: 'hidden' }}>
          <View style={[styles.blob, { backgroundColor: t.blob4 }]} />
          <Text style={{ fontSize: 12, color: t.ink3, letterSpacing: 1 }}>오늘</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, color: t.accentDeep }}>
            <Text testID="today-count">{summary.count}회</Text>
            {summary.count > 0 ? ` · ${formatDurationKo(summary.totalMs)}` : ''}
          </Text>
          <Text style={{ fontSize: 13, color: t.ink2 }}>
            {summary.avgIntervalMs !== null ? `평균 간격 ${formatDurationKo(summary.avgIntervalMs)}` : '평균 간격은 두 번째 수유부터 계산돼요'}
          </Text>
        </Card>

        {groups.length === 0 ? (
          <Text style={{ textAlign: 'center', color: t.ink2, marginTop: 40, lineHeight: 22 }}>아직 기록이 없어요.{'\n'}홈에서 수유를 시작해 보세요.</Text>
        ) : (
          groups.map((g) => (
            <View key={g.key} style={{ gap: 8 }}>
              <Pill color={t.lavender} textColor={t.scheme === 'dark' ? '#2b2640' : t.ink} style={{ marginTop: 6 }}>{g.label}</Pill>
              {g.sessions.map((s) => (
                <View key={s.id} testID="session-item" style={[styles.item, { backgroundColor: t.bg2, borderColor: t.line }]}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 18, color: t.ink, fontVariant: ['tabular-nums'], flex: 1 }}>
                    {formatClock(s.startedAt)} – {s.endedAt !== null ? formatClock(s.endedAt) : '진행 중'}
                  </Text>
                  <Text style={{ fontSize: 13, color: t.ink2 }}>{formatDurationKo(durationMs(s, now))} · {feedingTypeLabel(s.type)}</Text>
                  <IconButton icon="close" label="기록 삭제" size={38} color={t.ink3} onPress={() => remove(s.id)} />
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.display, fontSize: 24 },
  blob: { position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: 45 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 2, borderBottomWidth: 4, borderRadius: 18 },
});
