import { FEEDING_TYPES, type FeedingType } from '../domain/feeding';

interface Props {
  value: FeedingType;
  onChange: (t: FeedingType) => void;
}

export function TypeChips({ value, onChange }: Props) {
  return (
    <div className="chips chips--center" role="group" aria-label="수유 종류">
      {FEEDING_TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          className="chip chip--lg"
          aria-pressed={value === t.value}
          onClick={() => onChange(t.value)}
        >
          <span aria-hidden="true">{t.emoji}</span> {t.label}
        </button>
      ))}
    </div>
  );
}
