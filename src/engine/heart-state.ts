export interface HeartState {
  bpm: number;
  phase: number;
  agit: number;
  thump: number;
}

/** 박동 파형 — 위상 0..1 → 진폭. v8 프로토타입 곡선 그대로. */
export function beatCurve(t: number): number {
  if (t < 0.10) return Math.sin((t / 0.10) * Math.PI) * 0.25;
  if (t < 0.16) return (t - 0.10) / 0.06;
  if (t < 0.26) return 1.0 - (t - 0.16) / 0.10;
  if (t < 0.46) return Math.sin(((t - 0.26) / 0.20) * Math.PI) * 0.18;
  return 0;
}

/** 설계서 §6: bpm = clamp(48 + weeklyCommits × 1.5, 48, 110) */
export function bpmFromCommits(weekly: number): number {
  return Math.min(110, Math.max(48, 48 + weekly * 1.5));
}

/** 심장 상태 1틱 — agit(커서 근접도)로 심박 가속, 박동 상승 에지 신호 반환 */
export function stepHeart(h: HeartState, dt: number, proximity: number) {
  const bpmNow = h.bpm * (1 + h.agit * 0.9);
  const prevBeat = beatCurve(h.phase);
  h.phase = (h.phase + (dt * bpmNow) / 60) % 1;
  const beat = beatCurve(h.phase);
  h.thump = Math.max(0, h.thump - dt * 3.0);
  h.agit += (proximity - h.agit) * Math.min(1, dt * 4);
  return { beat, bpmNow, thumpEdge: prevBeat < 0.5 && beat >= 0.5 };
}
