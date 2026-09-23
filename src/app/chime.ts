/** 앱 내 알람 차임 (Web Audio 합성 — 별도 오디오 파일 불필요) */
type AudioCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  const Ctor = (typeof AudioContext !== 'undefined' ? AudioContext : w.webkitAudioContext) as AudioCtor | undefined;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

export function playChime(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const notes = [659.25, 783.99, 987.77, 1318.5]; // E5 G5 B5 E6
    notes.forEach((freq, i) => {
      const t0 = c.currentTime + i * 0.16;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + 0.75);
    });
  } catch {
    /* 오디오 불가 환경 */
  }
}
