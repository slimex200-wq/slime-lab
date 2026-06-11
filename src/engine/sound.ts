/** 심장 박동음 — WebAudio 사인 thump (v8 이식). 기본 OFF, AudioContext는 첫 토글에서 lazy 생성. */
export interface SoundCtl {
  readonly enabled: boolean;
  toggle(): boolean;
  thump(gain?: number): void;
}

export function createSound(): SoundCtl {
  let ctx: AudioContext | null = null;
  let on = false;
  return {
    get enabled() { return on; },
    toggle() {
      on = !on;
      if (on && !ctx) ctx = new AudioContext();
      if (on && ctx?.state === 'suspended') void ctx.resume();
      return on;
    },
    thump(gain = 0.5) {
      if (!on || !ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(52, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(34, ctx.currentTime + 0.16);
      g.gain.setValueAtTime(0.25 * gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.24);
    },
  };
}
