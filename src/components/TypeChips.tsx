import { StyleSheet, View } from 'react-native';
import { FEEDING_TYPES, type FeedingType } from '../domain/feeding';
import type { IconName } from './Icon';
import { Chip, type ChipTone } from './ui';

const ICONS: Record<FeedingType, IconName> = { breast: 'drop', bottle: 'bottle', solid: 'bowl' };
const TONES: Record<FeedingType, ChipTone> = { breast: 'pink', bottle: 'sky', solid: 'butter' };

interface Props {
  value: FeedingType;
  onChange: (t: FeedingType) => void;
}

export function TypeChips({ value, onChange }: Props) {
  return (
    <View style={styles.row} accessibilityLabel="수유 종류">
      {FEEDING_TYPES.map((t) => (
        <Chip key={t.value} label={t.label} icon={ICONS[t.value]} tone={TONES[t.value]} selected={value === t.value} onPress={() => onChange(t.value)} large />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
});
