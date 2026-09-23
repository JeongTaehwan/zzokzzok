import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INTERVAL_PRESETS, MIN_INTERVAL, MAX_INTERVAL, clampInterval } from '../domain/alarm';
import { useTheme } from '../theme/tokens';
import { Chip, Hint, Input } from './ui';

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalPicker({ value, onChange }: Props) {
  const t = useTheme();
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = clampInterval(Number(text));
    setText(String(n));
    if (n !== value) onChange(n);
  };

  const h = Math.floor(value / 60);
  const m = value % 60;
  const human = h > 0 ? `${h}시간${m ? ` ${m}분` : ''}` : `${m}분`;

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.chips} accessibilityLabel="알람 간격 프리셋">
        {INTERVAL_PRESETS.map((p) => (
          <Chip key={p} label={`${p}분`} selected={value === p} onPress={() => onChange(p)} />
        ))}
      </View>
      <View style={styles.row}>
        <Text style={{ fontSize: 16, color: t.ink }}>직접 입력</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Input
            label="알람 간격(분)"
            value={text}
            numeric
            maxLength={3}
            onChangeText={(v) => {
              setText(v);
              const n = Number(v);
              if (Number.isFinite(n) && n >= MIN_INTERVAL && n <= MAX_INTERVAL) onChange(n);
            }}
            onBlur={commit}
            onSubmitEditing={commit}
          />
          <Text style={{ color: t.ink2 }}>분</Text>
        </View>
      </View>
      <Hint style={{ marginTop: 0 }}>{human} 뒤에 알려드려요 · {MIN_INTERVAL}~{MAX_INTERVAL}분</Hint>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
