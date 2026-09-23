import type { SVGProps } from 'react';

export type IconName = 'bottle' | 'list' | 'gear' | 'check' | 'bell' | 'drop' | 'bowl' | 'back' | 'star';

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

/** 이모지 대신 쓰는 단색 아이콘 — 기기·폰트에 관계없이 동일하게 보인다 */
export function Icon({ name, size = 22, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
  switch (name) {
    case 'bottle':
      return (
        <svg {...common}>
          <path d="M10 3.5h4v2.2c1.5.6 2.5 2 2.5 3.8V18a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3V9.5c0-1.8 1-3.2 2.5-3.8V3.5z" />
          <path d="M9.5 12h5M9.5 15h5M11 3.5V2.2" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common}>
          <rect x="4" y="3.5" width="16" height="17" rx="3" />
          <path d="M8 9h8M8 12.5h8M8 16h5" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.8v2.4M12 18.8v2.4M4.1 7.4l2.1 1.2M17.8 15.4l2.1 1.2M4.1 16.6l2.1-1.2M17.8 8.6l2.1-1.2" />
          <circle cx="12" cy="12" r="7.2" strokeDasharray="2.6 3.1" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} strokeWidth={2.4}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'drop':
      return (
        <svg {...common}>
          <path d="M12 3.5s6 6.2 6 10.3a6 6 0 0 1-12 0C6 9.7 12 3.5 12 3.5z" />
        </svg>
      );
    case 'bowl':
      return (
        <svg {...common}>
          <path d="M4 11h16a8 8 0 0 1-16 0z" />
          <path d="M9 6.5c0-1.5 1.5-1.5 1.5-3M13.5 6.5c0-1.5 1.5-1.5 1.5-3" />
        </svg>
      );
    case 'back':
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2.5l2.6 6.1 6.6.6-5 4.4 1.5 6.5L12 16.7l-5.7 3.4 1.5-6.5-5-4.4 6.6-.6z" />
        </svg>
      );
  }
}

interface MascotProps {
  size?: number;
  /** 'happy' 기본, 'sleepy' 는 대기 화면용 */
  mood?: 'happy' | 'sleepy';
}

/** 쪽쪽 마스코트: 표정 있는 젖병 */
export function Mascot({ size = 120, mood = 'happy' }: MascotProps) {
  return (
    <svg width={size} height={(size * 140) / 120} viewBox="0 0 120 140" aria-hidden="true" focusable={false}>
      {/* 젖꼭지 */}
      <ellipse cx="60" cy="15" rx="13" ry="13" fill="#ffb3c7" />
      <ellipse cx="55" cy="10" rx="4" ry="3" fill="#ffd6e1" />
      {/* 뚜껑 */}
      <rect x="36" y="24" width="48" height="18" rx="9" fill="#ffd166" />
      <rect x="42" y="27" width="10" height="4" rx="2" fill="#ffe59a" />
      {/* 몸통 */}
      <rect x="25" y="40" width="70" height="94" rx="26" fill="#ffffff" stroke="#ffb59a" strokeWidth="4" />
      {/* 우유 */}
      <path d="M31 92 c10 -8 20 -8 29 0 c9 8 19 8 29 0 v18 a22 22 0 0 1 -22 22 h-14 a22 22 0 0 1 -22 -22 z" fill="#ffe8dc" />
      {/* 눈금 */}
      <path d="M84 60h6M84 74h6M84 88h6" stroke="#ffd1bf" strokeWidth="3" strokeLinecap="round" />
      {/* 얼굴 */}
      {mood === 'sleepy' ? (
        <>
          <path d="M43 72 q5 4 10 0" stroke="#5b3f3a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M67 72 q5 4 10 0" stroke="#5b3f3a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="83" rx="4" ry="5" fill="#5b3f3a" opacity="0.8" />
        </>
      ) : (
        <>
          <circle cx="48" cy="71" r="4" fill="#5b3f3a" />
          <circle cx="72" cy="71" r="4" fill="#5b3f3a" />
          <circle cx="49.5" cy="69.5" r="1.4" fill="#fff" />
          <circle cx="73.5" cy="69.5" r="1.4" fill="#fff" />
          <path d="M53 81 q7 7 14 0" stroke="#5b3f3a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* 볼터치 */}
      <circle cx="40" cy="80" r="4.5" fill="#ffb3c7" opacity="0.85" />
      <circle cx="80" cy="80" r="4.5" fill="#ffb3c7" opacity="0.85" />
    </svg>
  );
}
