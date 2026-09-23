import { useEffect, useState } from 'react';
import { INTERVAL_PRESETS, MIN_INTERVAL, MAX_INTERVAL, clampInterval } from '../domain/alarm';

interface Props {
  value: number;
  onChange: (minutes: number) => void;
}

export function IntervalPicker({ value, onChange }: Props) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = clampInterval(Number(text));
    setText(String(n));
    if (n !== value) onChange(n);
  };

  return (
    <div className="interval">
      <div className="chips" role="group" aria-label="알람 간격 프리셋">
        {INTERVAL_PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className="chip"
            aria-pressed={value === m}
            onClick={() => onChange(m)}
          >
            {m}분
          </button>
        ))}
      </div>
      <label className="field field--inline">
        <span>직접 입력</span>
        <span className="field__control">
          <input
            className="input input--num"
            type="number"
            inputMode="numeric"
            min={MIN_INTERVAL}
            max={MAX_INTERVAL}
            aria-label="알람 간격(분)"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= MIN_INTERVAL && n <= MAX_INTERVAL) onChange(n);
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
          <span className="field__unit">분</span>
        </span>
      </label>
      <p className="hint">{Math.floor(value / 60) > 0 ? `${Math.floor(value / 60)}시간 ${value % 60 ? `${value % 60}분` : ''}`.trim() : `${value}분`} 뒤에 알려드려요 · {MIN_INTERVAL}~{MAX_INTERVAL}분</p>
    </div>
  );
}
