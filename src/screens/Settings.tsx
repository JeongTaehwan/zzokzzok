import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useStore } from '../core/store';
import { alarmMessage } from '../domain/korean';
import { fonts, useTheme } from '../theme/tokens';
import { Screen } from '../components/Screen';
import { IntervalPicker } from '../components/IntervalPicker';
import { GhostButton, Hint, IconButton, Input, Pill, Toast, useToast } from '../components/ui';

interface Props {
  onBack: () => void;
}

const APP_VERSION = '0.2.0';

export function Settings({ onBack }: Props) {
  const t = useTheme();
  const { state, dispatch, notifier, haptics, permission, refreshPermission } = useStore();
  const { settings } = state;
  const [name, setName] = useState(settings.babyName);
  const [toast, showToast, clearToast] = useToast();

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
    showToast('5초 뒤에 알림이 와요');
  };
  const reset = () => {
    Alert.alert('모든 기록 삭제', '모든 수유 기록을 삭제할까요? 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { haptics.success(); dispatch({ type: 'RESET_DATA' }); showToast('기록을 모두 지웠어요'); } },
    ]);
  };

  const permissionLabel = permission === 'granted' ? '허용됨' : permission === 'denied' ? '거부됨' : permission === 'prompt' ? '아직 안 물어봄' : '미지원';
  const permColor = permission === 'granted' ? t.mint : permission === 'denied' ? t.rose : t.bg3;
  const permInk = permission === 'granted' ? t.mintInk : permission === 'denied' ? '#fff' : t.ink2;

  return (
    <Screen>
      <View style={styles.topbar}>
        <IconButton icon="back" label="뒤로" onPress={back} />
        <Text style={[styles.title, { color: t.accentDeep }]}>설정</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text style={[styles.label, { color: t.ink2 }]}>아기 이름</Text>
          <Input label="아기 이름" value={name} maxLength={12} onChangeText={setName} onBlur={commitName} />
          <Hint style={{ marginTop: 0 }}>알림 문구: <Text style={{ color: t.accentDeep }}>{alarmMessage(name)}</Text></Hint>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[styles.label, { color: t.ink2 }]}>알람 간격 (수유 종료 기준)</Text>
          <IntervalPicker value={settings.intervalMinutes} onChange={(m) => dispatch({ type: 'UPDATE_SETTINGS', patch: { intervalMinutes: m } })} />
        </View>

        <View style={[styles.row, { borderTopColor: t.line }]}>
          <Text style={{ fontSize: 16, color: t.ink }}>진동</Text>
          <Switch accessibilityLabel="진동" value={settings.vibrate} onValueChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { vibrate: v } })} trackColor={{ true: t.mint, false: t.bg3 }} thumbColor={t.bg2} />
        </View>
        <View style={[styles.row, { borderTopColor: t.line }]}>
          <Text style={{ fontSize: 16, color: t.ink }}>소리</Text>
          <Switch accessibilityLabel="소리" value={settings.sound} onValueChange={(v) => dispatch({ type: 'UPDATE_SETTINGS', patch: { sound: v } })} trackColor={{ true: t.mint, false: t.bg3 }} thumbColor={t.bg2} />
        </View>

        <View style={[styles.section, { borderTopColor: t.line }]}>
          <View style={styles.rowItem}>
            <Text style={{ fontSize: 16, color: t.ink }}>알림 권한</Text>
            <Pill color={permColor} textColor={permInk}>{permissionLabel}</Pill>
          </View>
          {permission === 'prompt' && (
            <GhostButton label="알림 권한 요청" onPress={async () => { await notifier.requestPermission(); await refreshPermission(); }} />
          )}
          <GhostButton label="알림 미리보기" onPress={() => void preview()} />
          <Hint style={{ marginTop: 0 }}>5초 뒤에 실제 알림이 와요. 앱을 닫아도 오는지 확인해 보세요.</Hint>
        </View>

        <View style={[styles.section, { borderTopColor: t.line }]}>
          <GhostButton label="모든 기록 삭제" danger onPress={reset} />
        </View>

        <Text style={{ textAlign: 'center', fontSize: 12, color: t.ink3, marginTop: 10 }}>쪽쪽 v{APP_VERSION} · 모든 데이터는 이 기기에만 저장돼요</Text>
      </ScrollView>
      <Toast message={toast} onDone={clearToast} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.display, fontSize: 24 },
  label: { fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 2, borderStyle: 'dotted' },
  section: { gap: 12, paddingTop: 14, borderTopWidth: 2, borderStyle: 'dotted' },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
