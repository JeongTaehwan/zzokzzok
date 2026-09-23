/** 작은 UI 프리미티브: 장난감 버튼, 칩, 카드, 알약 라벨, 토스트 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { fonts, radius, useTheme, type Theme } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

/* ---------- 장난감처럼 눌리는 큰 버튼 ---------- */
type Variant = 'accent' | 'mint' | 'rose' | 'ghost';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
}

function variantColors(t: Theme, v: Variant) {
  switch (v) {
    case 'mint':
      return { bg: t.mint, deep: t.mintDeep, ink: t.mintInk };
    case 'rose':
      return { bg: t.rose, deep: t.roseDeep, ink: '#ffffff' };
    case 'ghost':
      return { bg: t.bg2, deep: t.line, ink: t.ink };
    default:
      return { bg: t.accent, deep: t.accentDeep, ink: t.accentInk };
  }
}

export function BigButton({ label, onPress, variant = 'accent', icon, disabled, testID }: BigButtonProps) {
  const t = useTheme();
  const c = variantColors(t, variant);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.big,
        { backgroundColor: c.bg, borderBottomColor: c.deep, borderBottomWidth: pressed ? 2 : 6, transform: [{ translateY: pressed ? 4 : 0 }], opacity: disabled ? 0.7 : 1 },
      ]}
    >
      {icon ? <Icon name={icon} color={c.ink} size={24} strokeWidth={2.2} /> : null}
      <Text style={[styles.bigLabel, { color: c.ink }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- 작은 유령 버튼 ---------- */
interface GhostButtonProps {
  label: string;
  onPress: () => void;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}
export function GhostButton({ label, onPress, danger, style }: GhostButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        { backgroundColor: t.bg2, borderColor: danger ? t.rose : t.line, borderBottomWidth: pressed ? 1 : 4, transform: [{ translateY: pressed ? 3 : 0 }] },
        style,
      ]}
    >
      <Text style={[styles.ghostLabel, { color: danger ? t.roseDeep : t.ink }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- 동그란 아이콘 버튼 ---------- */
interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  color?: string;
}
export function IconButton({ icon, label, onPress, size = 48, color }: IconButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconBtn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg2, borderColor: t.line, borderBottomWidth: pressed ? 1 : 4, transform: [{ translateY: pressed ? 3 : 0 }] },
      ]}
    >
      <Icon name={icon} color={color ?? t.accentDeep} size={size * 0.44} />
    </Pressable>
  );
}

/* ---------- 칩 ---------- */
export type ChipTone = 'accent' | 'pink' | 'sky' | 'butter';
interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  tone?: ChipTone;
  icon?: IconName;
  large?: boolean;
}
export function Chip({ label, selected, onPress, tone = 'accent', icon, large }: ChipProps) {
  const t = useTheme();
  const tones: Record<ChipTone, { bg: string; deep: string; ink: string }> = {
    accent: { bg: t.accent, deep: t.accentDeep, ink: t.accentInk },
    pink: { bg: t.pink, deep: t.pinkDeep, ink: '#ffffff' },
    sky: { bg: t.sky, deep: t.skyDeep, ink: '#16354d' },
    butter: { bg: t.butter, deep: t.butterDeep, ink: '#4d3a08' },
  };
  const c = tones[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        large && styles.chipLg,
        {
          backgroundColor: selected ? c.bg : t.bg2,
          borderColor: selected ? c.bg : t.line,
          borderBottomColor: selected ? c.deep : t.line,
          borderBottomWidth: pressed ? 1 : 3,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
      ]}
    >
      {icon ? <Icon name={icon} size={large ? 18 : 16} color={selected ? c.ink : t.ink2} /> : null}
      <Text style={[styles.chipLabel, large && { fontSize: 15 }, { color: selected ? c.ink : t.ink2 }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- 카드 / 알약 / 힌트 ---------- */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.card, { backgroundColor: t.bg2, borderColor: t.line, shadowColor: t.shadow }, style]}>{children}</View>;
}

export function Pill({ children, color, textColor, style }: { children: ReactNode; color: string; textColor?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: color }, style]}>
      <Text style={{ fontSize: 12, color: textColor ?? t.ink }}>{children}</Text>
    </View>
  );
}

export function Hint({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 13, color: t.ink2, marginTop: 8, lineHeight: 19 }, style]}>{children}</Text>;
}

export function Display({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: fonts.display, fontSize: 32, lineHeight: 42, color: t.ink }, style]}>{children}</Text>;
}

/* ---------- 텍스트 입력 ---------- */
interface InputProps {
  value: string;
  onChangeText: (v: string) => void;
  label: string;
  placeholder?: string;
  big?: boolean;
  numeric?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  style?: StyleProp<TextStyle>;
}
export function Input({ value, onChangeText, label, placeholder, big, numeric, maxLength, onBlur, onSubmitEditing, autoFocus, style }: InputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={t.ink3}
      maxLength={maxLength}
      keyboardType={numeric ? 'number-pad' : 'default'}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="done"
      style={[
        styles.input,
        { backgroundColor: t.bg2, color: t.ink, borderColor: focused ? t.accent : t.line, borderBottomColor: focused ? t.accentDeep : t.line },
        big && { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', paddingVertical: 16 },
        numeric && { width: 100, textAlign: 'center', fontFamily: fonts.display, fontSize: 22, paddingVertical: 8 },
        style,
      ]}
    />
  );
}

/* ---------- 토스트 ---------- */
export function Toast({ message, onDone, durationMs = 3000 }: { message: string | null; onDone: () => void; durationMs?: number }) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) return;
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    const id = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onDone());
    }, durationMs);
    return () => clearTimeout(id);
  }, [message, durationMs, onDone, anim]);
  if (!message) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.toast, { backgroundColor: t.ink, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}
    >
      <Text style={{ color: t.bg, fontSize: 14 }}>{message}</Text>
    </Animated.View>
  );
}

export function useToast(): [string | null, (m: string) => void, () => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const clear = useRef(() => setMsg(null)).current;
  return [msg, setMsg, clear];
}

const styles = StyleSheet.create({
  big: { minHeight: 66, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  bigLabel: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 0.3 },
  ghost: { flex: 1, minHeight: 52, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  ghostLabel: { fontSize: 15 },
  iconBtn: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  chipLg: { paddingVertical: 11, paddingHorizontal: 16 },
  chipLabel: { fontSize: 14 },
  card: { borderWidth: 2, borderRadius: radius.md, padding: 18, gap: 3, shadowOpacity: 1, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  input: { borderWidth: 2, borderBottomWidth: 4, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, fontSize: 18 },
  toast: { position: 'absolute', left: 24, right: 24, bottom: 118, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', zIndex: 10 },
});
