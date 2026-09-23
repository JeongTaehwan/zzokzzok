import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  /** happy: 웃는 얼굴(알람) / sleepy: 졸린 얼굴(대기) */
  mood?: 'happy' | 'sleepy';
  /** bob: 둥실둥실 / wiggle: 좌우 흔들 / none */
  motion?: 'bob' | 'wiggle' | 'none';
}

/** 쪽쪽 마스코트: 표정 있는 젖병 */
export function Mascot({ size = 120, mood = 'happy', motion = 'none' }: Props) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (motion === 'none') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: motion === 'bob' ? 1500 : 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: motion === 'bob' ? 1500 : 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [motion, v]);

  const transform =
    motion === 'bob'
      ? [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }]
      : motion === 'wiggle'
        ? [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] }) }]
        : [];

  return (
    <Animated.View style={{ transform }}>
      <Svg width={size} height={(size * 140) / 120} viewBox="0 0 120 140">
        <Ellipse cx={60} cy={15} rx={13} ry={13} fill="#ffb3c7" />
        <Ellipse cx={55} cy={10} rx={4} ry={3} fill="#ffd6e1" />
        <Rect x={36} y={24} width={48} height={18} rx={9} fill="#ffd166" />
        <Rect x={42} y={27} width={10} height={4} rx={2} fill="#ffe59a" />
        <Rect x={25} y={40} width={70} height={94} rx={26} fill="#ffffff" stroke="#ffb59a" strokeWidth={4} />
        <Path d="M31 92 c10 -8 20 -8 29 0 c9 8 19 8 29 0 v18 a22 22 0 0 1 -22 22 h-14 a22 22 0 0 1 -22 -22 z" fill="#ffe8dc" />
        <Path d="M84 60h6M84 74h6M84 88h6" stroke="#ffd1bf" strokeWidth={3} strokeLinecap="round" />
        {mood === 'sleepy' ? (
          <>
            <Path d="M43 72 q5 4 10 0" stroke="#5b3f3a" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M67 72 q5 4 10 0" stroke="#5b3f3a" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Ellipse cx={60} cy={83} rx={4} ry={5} fill="#5b3f3a" opacity={0.8} />
          </>
        ) : (
          <>
            <Circle cx={48} cy={71} r={4} fill="#5b3f3a" />
            <Circle cx={72} cy={71} r={4} fill="#5b3f3a" />
            <Circle cx={49.5} cy={69.5} r={1.4} fill="#fff" />
            <Circle cx={73.5} cy={69.5} r={1.4} fill="#fff" />
            <Path d="M53 81 q7 7 14 0" stroke="#5b3f3a" strokeWidth={3} fill="none" strokeLinecap="round" />
          </>
        )}
        <Circle cx={40} cy={80} r={4.5} fill="#ffb3c7" opacity={0.85} />
        <Circle cx={80} cy={80} r={4.5} fill="#ffb3c7" opacity={0.85} />
      </Svg>
    </Animated.View>
  );
}
