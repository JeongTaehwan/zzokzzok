import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/tokens';

export type RingMode = 'idle' | 'feeding' | 'scheduled';

interface Props {
  /** 0~1, 링이 채워진 비율 */
  progress: number;
  mode: RingMode;
  size?: number;
  children: ReactNode;
}

const STROKE = 14;

export function Ring({ progress, mode, size = 268, children }: Props) {
  const t = useTheme();
  const r = (size - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const fill = mode === 'idle' ? t.bg3 : mode === 'feeding' ? t.mintDeep : t.accent;

  // 수유 중: 숨쉬듯 맥동
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (mode !== 'feeding') {
      breathe.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mode, breathe]);

  // 바깥 점선 링: 아주 천천히 회전
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const outer = size + 32;
  return (
    <Animated.View
      testID="ring"
      accessibilityLabel={`ring-${mode}`}
      style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center', transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] }) }] }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
        <Svg width={outer} height={outer}>
          <Circle cx={outer / 2} cy={outer / 2} r={outer / 2 - 3} stroke={t.pink} strokeWidth={3} strokeDasharray="0.1 9" strokeLinecap="round" fill="none" opacity={0.7} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.bg3} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          fill="none"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', padding: 44 }]}>{children}</View>
    </Animated.View>
  );
}
