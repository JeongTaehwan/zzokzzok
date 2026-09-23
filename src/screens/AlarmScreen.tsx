import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStore } from '../core/store';
import { alarmMessage } from '../domain/korean';
import { formatClock } from '../domain/time';
import { fonts, useTheme } from '../theme/tokens';
import { Screen } from '../components/Screen';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { BigButton, GhostButton } from '../components/ui';

export function AlarmScreen() {
  const t = useTheme();
  const { state, dispatch, haptics } = useStore();
  const { settings, alarm } = state;
  const message = alarmMessage(settings.babyName);

  useEffect(() => {
    if (settings.vibrate) haptics.alarm();
    const id = setInterval(() => {
      if (settings.vibrate) haptics.alarm();
    }, 4000);
    return () => {
      clearInterval(id);
      haptics.stop();
    };
  }, [settings.vibrate, haptics]);

  return (
    <Screen variant="alarm">
      <View style={styles.body} accessibilityLabel="알람">
        <View style={[styles.spark, { left: '10%', top: '16%' }]}><Icon name="star" size={26} color={t.butter} /></View>
        <View style={[styles.spark, { right: '12%', top: '24%' }]}><Icon name="star" size={20} color={t.pink} /></View>
        <View style={[styles.spark, { left: '20%', bottom: '20%' }]}><Icon name="star" size={18} color={t.mintDeep} /></View>
        <Mascot size={150} mood="happy" motion="wiggle" />
        <Text testID="alarm-message" accessibilityRole="header" style={[styles.msg, { color: t.accentDeep, textShadowColor: t.bg2 }]}>
          {message}
        </Text>
        <View style={[styles.meta, { backgroundColor: t.bg2, borderColor: t.line }]}>
          <Text style={{ color: t.ink2, fontSize: 14 }}>
            {alarm.scheduledAt !== null ? `${formatClock(alarm.scheduledAt)} · 예약 알람` : '예약 알람'}
            {alarm.snoozeCount > 0 ? ` · ${alarm.snoozeCount}번 미룸` : ''}
          </Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <BigButton label="수유 시작" icon="bottle" onPress={() => { haptics.tap(); dispatch({ type: 'START', now: Date.now() }); }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <GhostButton label="10분 뒤 다시" onPress={() => { haptics.tap(); dispatch({ type: 'SNOOZE', now: Date.now() }); }} />
          <GhostButton label="닫기" onPress={() => { haptics.tap(); dispatch({ type: 'DISMISS' }); }} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  spark: { position: 'absolute' },
  msg: { fontFamily: fonts.display, fontSize: 42, lineHeight: 52, textAlign: 'center', marginTop: 8, textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 0 },
  meta: { borderWidth: 2, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
});
