import { FEEDING_TYPES, type FeedingType } from '../domain/feeding';
import { Icon, type IconName } from '../components/Icon';

const ICONS: Record<FeedingType, IconName> = { breast: 'drop', bottle: 'bottle', solid: 'bowl' };
const TONES: Record<FeedingType, string> = { breast: 'pink', bottle: 'sky', solid: 'butter' };

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
          data-tone={TONES[t.value]}
          onClick={() => onChange(t.value)}
        >
          <Icon name={ICONS[t.value]} size={18} /> {t.label}
        </button>
      ))}
    </div>
  );
}
