import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'bottle' | 'list' | 'gear' | 'check' | 'bell' | 'drop' | 'bowl' | 'back' | 'star' | 'close';

interface Props {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** 단색 라인 아이콘 — 기기/폰트에 관계없이 동일하게 보인다 */
export function Icon({ name, size = 22, color, strokeWidth = 1.9 }: Props) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'bottle':
      return (
        <Svg {...common}>
          <Path d="M10 3.5h4v2.2c1.5.6 2.5 2 2.5 3.8V18a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3V9.5c0-1.8 1-3.2 2.5-3.8V3.5z" />
          <Path d="M9.5 12h5M9.5 15h5M11 3.5V2.2" />
        </Svg>
      );
    case 'list':
      return (
        <Svg {...common}>
          <Rect x={4} y={3.5} width={16} height={17} rx={3} />
          <Path d="M8 9h8M8 12.5h8M8 16h5" />
        </Svg>
      );
    case 'gear':
      return (
        <Svg {...common}>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M12 2.8v2.4M12 18.8v2.4M4.1 7.4l2.1 1.2M17.8 15.4l2.1 1.2M4.1 16.6l2.1-1.2M17.8 8.6l2.1-1.2" />
          <Circle cx={12} cy={12} r={7.2} strokeDasharray="2.6 3.1" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common} strokeWidth={2.4}>
          <Path d="M5 12.5l4.5 4.5L19 7.5" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common} strokeWidth={2.2}>
          <Path d="M6 6l12 12M18 6L6 18" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
          <Path d="M10 20a2 2 0 0 0 4 0" />
        </Svg>
      );
    case 'drop':
      return (
        <Svg {...common}>
          <Path d="M12 3.5s6 6.2 6 10.3a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5z" />
        </Svg>
      );
    case 'bowl':
      return (
        <Svg {...common}>
          <Path d="M4 11h16a8 8 0 0 1-16 0z" />
          <Path d="M9 6.5c0-1.5 1.5-1.5 1.5-3M13.5 6.5c0-1.5 1.5-1.5 1.5-3" />
        </Svg>
      );
    case 'back':
      return (
        <Svg {...common} strokeWidth={2.2}>
          <Path d="M15 5l-7 7 7 7" />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 2.5l2.6 6.1 6.6.6-5 4.4 1.5 6.5L12 16.7l-5.7 3.4 1.5-6.5-5-4.4 6.6-.6z" />
        </Svg>
      );
  }
}
