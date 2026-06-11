/** 파티클 물리 — 스프링 복원 + 커서 반발 + 쇼크 충격파 (v8 메인 루프 물리 항 이식) */
export interface PhysicsState {
  ox: Float32Array; oy: Float32Array;
  vx: Float32Array; vy: Float32Array;
  n: number;
}

const K = 46, DAMP = 8;

export function createPhysics(n: number): PhysicsState {
  return { ox: new Float32Array(n), oy: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), n };
}

/** basePos: 점별 화면 px (x,y 인터리브). mouse=null이면 반발 없음 */
export function stepPhysics(
  p: PhysicsState, dt: number,
  mouse: { x: number; y: number } | null,
  basePos: Float32Array, repelR: number,
) {
  for (let i = 0; i < p.n; i++) {
    let ax = -p.ox[i] * K - p.vx[i] * DAMP;
    let ay = -p.oy[i] * K - p.vy[i] * DAMP;
    if (mouse) {
      const dx = basePos[i * 2] + p.ox[i] - mouse.x;
      const dy = basePos[i * 2 + 1] + p.oy[i] - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < repelR * repelR) {
        const d = Math.sqrt(d2) + 0.001, f = (repelR - d) / repelR;
        ax += (dx / d) * f * 5600;
        ay += (dy / d) * f * 5600;
      }
    }
    p.vx[i] += ax * dt; p.vy[i] += ay * dt;
    p.ox[i] += p.vx[i] * dt; p.oy[i] += p.vy[i] * dt;
  }
}

export function shock(
  p: PhysicsState, basePos: Float32Array,
  cx: number, cy: number, radius: number, rng: () => number,
) {
  for (let i = 0; i < p.n; i++) {
    const dx = basePos[i * 2] - cx, dy = basePos[i * 2 + 1] - cy;
    const d = Math.hypot(dx, dy) + 0.001, f = Math.max(0, 1 - d / radius);
    if (f <= 0) continue;
    p.vx[i] += (dx / d) * f * (420 + rng() * 520);
    p.vy[i] += (dy / d) * f * (420 + rng() * 520) - f * 100;
  }
}
