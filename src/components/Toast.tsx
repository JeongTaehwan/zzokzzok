import { useEffect, useState } from 'react';

interface Props {
  message: string | null;
  onDone: () => void;
  durationMs?: number;
}

export function Toast({ message, onDone, durationMs = 3000 }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onDone]);
  if (!message) return null;
  return (
    <div className={`toast ${visible ? 'toast--in' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

/** 토스트 상태 훅 */
export function useToast(): [string | null, (m: string) => void, () => void] {
  const [msg, setMsg] = useState<string | null>(null);
  return [msg, setMsg, () => setMsg(null)];
}
