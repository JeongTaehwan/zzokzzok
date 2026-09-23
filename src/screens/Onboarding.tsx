import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStore } from '../core/store';
import { alarmMessage } from '../domain/korean';
import { DEFAULT_INTERVAL } from '../domain/alarm';
import { fonts, useTheme } from '../theme/tokens';
import { Screen } from '../components/Screen';
import { Mascot } from '../components/Mascot';
import { Icon } from '../components/Icon';
import { IntervalPicker } from '../components/IntervalPicker';
import { BigButton, Card, Display, Hint, IconButton, Input } from '../components/ui';
import { Pressable } from 'react-native';

export function Onboarding() {
  const t = useTheme();
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
    <Screen>
      <View style={styles.topbar}>
        {step > 0 ? (
          <IconButton icon="back" label="이전" onPress={() => setStep((s) => s - 1)} />
        ) : (
          <View style={styles.brand}>
            <Mascot size={30} />
            <Text style={[styles.brandText, { color: t.accentDeep }]}>쪽쪽</Text>
          </View>
        )}
        <View style={styles.dots} accessibilityLabel={`${step + 1}단계 / 3단계`}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? t.accent : t.bg3, borderColor: i <= step ? t.accent : t.line }]} />
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {step === 0 && (
          <>
            <Display>아기 이름이{'\n'}뭐예요?</Display>
            <Input label="아기 이름" placeholder="예: 지민" big maxLength={12} autoFocus value={name} onChangeText={(v) => { setName(v); if (error) setError(''); }} onSubmitEditing={next} />
            {error ? (
              <Text accessibilityRole="alert" style={{ color: t.roseDeep, marginTop: 8 }}>{error}</Text>
            ) : (
              <Hint>→ <Text style={{ color: t.accentDeep }}>"{alarmMessage(name)}"</Text> 로 불러드릴게요</Hint>
            )}
          </>
        )}
        {step === 1 && (
          <>
            <Display>수유 끝나고{'\n'}몇 분 뒤에 알려드릴까요?</Display>
            <IntervalPicker value={interval} onChange={setInterval} />
          </>
        )}
        {step === 2 && (
          <>
            <Display>알림을{'\n'}허용해 주세요</Display>
            <Card style={{ alignItems: 'flex-start', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="bell" size={16} color={t.ink2} />
                <Text style={{ fontSize: 13, color: t.ink2 }}>쪽쪽</Text>
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 28, color: t.accentDeep }}>{alarmMessage(name)}</Text>
              <Hint style={{ marginTop: 0 }}>앱이 꺼져 있어도 이렇게 알려드려요.</Hint>
            </Card>
          </>
        )}
      </View>

      <View style={styles.bottom}>
        {step < 2 ? (
          <BigButton label="다음" onPress={next} />
        ) : (
          <>
            <BigButton label="알림 허용하고 시작" onPress={() => void finish(true)} disabled={busy} />
            <Pressable accessibilityRole="button" accessibilityLabel="나중에 할게요" onPress={() => void finish(false)} disabled={busy} style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: t.ink2, fontSize: 15, textDecorationLine: 'underline' }}>나중에 할게요</Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.display, fontSize: 26 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  body: { flex: 1, gap: 12, paddingTop: 40 },
  bottom: { gap: 10 },
});
