import type { ReactNode } from 'react';

export type RingMode = 'idle' | 'feeding' | 'scheduled';

interface Props {
  /** 0~1, 링이 채워진 비율 */
  progress: number;
  mode: RingMode;
  children: ReactNode;
}

const SIZE = 260;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function Ring({ progress, mode, children }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div className={`ring ring--${mode}`} data-testid="ring">
      <svg className="ring__svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle className="ring__track" cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} />
        <circle
          className="ring__fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          strokeWidth={STROKE}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
        />
      </svg>
      <div className="ring__inner">{children}</div>
    </div>
  );
}
