import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme/tokens';

/** 파스텔 블롭 + 물방울 무늬 배경 */
export function Backdrop({ variant = 'default' }: { variant?: 'default' | 'alarm' }) {
  const t = useTheme();
  const blobs =
    variant === 'alarm'
      ? [
          { cx: '50%', cy: '36%', r: 210, c: t.blob1 },
          { cx: '12%', cy: '14%', r: 110, c: t.blob2 },
          { cx: '88%', cy: '20%', r: 120, c: t.blob3 },
          { cx: '80%', cy: '84%', r: 110, c: t.blob4 },
        ]
      : [
          { cx: '10%', cy: '6%', r: 150, c: t.blob1 },
          { cx: '94%', cy: '12%', r: 110, c: t.blob2 },
          { cx: '88%', cy: '86%', r: 170, c: t.blob3 },
          { cx: '6%', cy: '74%', r: 110, c: t.blob4 },
        ];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.bg }]}>
      <Svg width="100%" height="100%">
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`g${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0.55" stopColor={b.c} stopOpacity={1} />
              <Stop offset="1" stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
          <Pattern id="dots" width={22} height={22} patternUnits="userSpaceOnUse">
            <Circle cx={6} cy={8} r={1.6} fill={t.dot} />
          </Pattern>
        </Defs>
        {blobs.map((b, i) => (
          <Circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#g${i})`} />
        ))}
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
}
