/**
 * 해부학적 심장 — CSG 점묘 샘플링 (v8 프로토타입 이식)
 * 장기를 프리미티브(타원체 + 가변반경 캡슐)의 합집합으로 설계:
 * 좌/우심실, 좌/우심방, 심첨 원뿔, 대동맥궁+분지 3, 폐동맥, 상대정맥.
 * 각 프리미티브 표면에서 점을 뽑고 다른 프리미티브 내부에 들어간 점은 기각(합집합 표면).
 */

export interface AnatomyPoints {
  pos: Float32Array;
  nrm: Float32Array;
  /** 기본색(조명 전) 0..1 — 렌더러에 직접 주지 않는다. mount가 매 프레임 조명 적용 후 Uint8 버퍼 생성 */
  col: Float32Array;
  size: Float32Array;
  phase: Float32Array;
  count: number;
}

type Tag = 'm' | 'a' | 'v';
interface Ell { t: Tag; c: [number, number, number]; r: [number, number, number]; w: number; }
interface Cap {
  t: Tag; p: [number, number, number][]; r0: number; r1: number; w: number;
  _segs?: { a: number[]; b: number[]; l: number; acc: number }[]; _L?: number;
}

/* 모델 공간: x=우, y=깊이, z=상. w = 30k 기준 점 배분(비율 환산용) */
const ELLS: Ell[] = [
  { t: 'm', c: [0.22, 0.00, -0.18], r: [0.60, 0.55, 0.78], w: 6800 },  // 좌심실
  { t: 'm', c: [-0.34, 0.04, 0.02], r: [0.54, 0.50, 0.60], w: 5600 },  // 우심실
  { t: 'm', c: [0.45, -0.04, 0.52], r: [0.34, 0.30, 0.30], w: 2100 },  // 좌심방
  { t: 'm', c: [-0.56, 0.00, 0.45], r: [0.34, 0.32, 0.31], w: 2100 },  // 우심방
];
const CAPS: Cap[] = [
  { t: 'm', p: [[0.12, 0, -0.45], [-0.08, 0, -0.92]], r0: 0.34, r1: 0.10, w: 2400 },               // 심첨
  { t: 'a', p: [[0.02, 0, 0.55], [-0.02, 0, 0.95], [0.22, 0, 1.14], [0.50, 0, 1.02], [0.58, 0, 0.82]], r0: 0.16, r1: 0.13, w: 3000 }, // 대동맥궁
  { t: 'a', p: [[0.10, 0, 1.10], [0.07, 0, 1.34]], r0: 0.055, r1: 0.05, w: 380 },
  { t: 'a', p: [[0.24, 0, 1.16], [0.25, 0, 1.42]], r0: 0.055, r1: 0.05, w: 380 },
  { t: 'a', p: [[0.38, 0, 1.12], [0.42, 0, 1.36]], r0: 0.055, r1: 0.05, w: 380 },
  { t: 'a', p: [[-0.12, 0.10, 0.52], [-0.42, 0.14, 0.82], [-0.66, 0.10, 0.88]], r0: 0.13, r1: 0.11, w: 1700 }, // 폐동맥
  { t: 'v', p: [[-0.60, -0.06, 0.55], [-0.66, -0.10, 1.05]], r0: 0.105, r1: 0.10, w: 1100 },        // 상대정맥
];
const W_TOTAL = ELLS.reduce((s, e) => s + e.w, 0) + CAPS.reduce((s, c) => s + c.w, 0); // 25940
const INTERIOR_RATIO = 1 - W_TOTAL / 30000; // 나머지는 내부 점

const RAMP_M = [[0.36, 0.06, 0.11], [0.55, 0.10, 0.16], [0.70, 0.14, 0.21], [0.79, 0.23, 0.29], [0.85, 0.33, 0.39], [0.94, 0.54, 0.59]];
const RAMP_A = [[0.50, 0.15, 0.08], [0.69, 0.26, 0.13], [0.84, 0.42, 0.23], [0.93, 0.58, 0.36]];
const RAMP_V = [[0.16, 0.20, 0.44], [0.26, 0.32, 0.62], [0.38, 0.46, 0.80], [0.52, 0.60, 0.92]];
const MINT = [0.17, 0.89, 0.64];

const TILT = -0.25; // y(깊이)축 기울임 — 심첨이 좌하로
const TC = Math.cos(TILT), TS = Math.sin(TILT);

/** 콜아웃 앵커 (틸트 적용 후 모델 좌표) */
export const ANCHORS: { id: string; m: [number, number, number] }[] = (
  [
    { id: 'aorta', m: [0.24, 0, 1.30] },
    { id: 'lv', m: [0.80, 0, -0.10] },
    { id: 'rv', m: [-0.86, 0.06, 0.10] },
    { id: 'apex', m: [-0.12, 0, -1.02] },
  ] as { id: string; m: [number, number, number] }[]
).map(({ id, m }) => ({ id, m: [m[0] * TC + m[2] * TS, m[1], -m[0] * TS + m[2] * TC] }));

function insideEll(p: number[], e: Ell, sh: number): boolean {
  const dx = (p[0] - e.c[0]) / (e.r[0] * sh);
  const dy = (p[1] - e.c[1]) / (e.r[1] * sh);
  const dz = (p[2] - e.c[2]) / (e.r[2] * sh);
  return dx * dx + dy * dy + dz * dz < 1;
}
function capGeom(cp: Cap): Required<Pick<Cap, '_segs' | '_L'>> & Cap {
  if (cp._L) return cp as never;
  cp._segs = [];
  let L = 0;
  for (let i = 0; i < cp.p.length - 1; i++) {
    const a = cp.p[i], b = cp.p[i + 1];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    cp._segs.push({ a, b, l, acc: L });
    L += l;
  }
  cp._L = L;
  return cp as never;
}
function insideCap(p: number[], cp: Cap, sh: number): boolean {
  const g = capGeom(cp);
  for (const s of g._segs) {
    const ax = s.a[0], ay = s.a[1], az = s.a[2];
    const bx = s.b[0] - ax, by = s.b[1] - ay, bz = s.b[2] - az;
    const l2 = bx * bx + by * by + bz * bz;
    let t = ((p[0] - ax) * bx + (p[1] - ay) * by + (p[2] - az) * bz) / l2;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + bx * t - p[0], qy = ay + by * t - p[1], qz = az + bz * t - p[2];
    const tg = (s.acc + s.l * t) / g._L;
    const r = (cp.r0 + (cp.r1 - cp.r0) * tg) * sh;
    if (qx * qx + qy * qy + qz * qz < r * r) return true;
  }
  return false;
}
function insideOthers(p: number[], self: Ell | Cap): boolean {
  for (const e of ELLS) if (e !== self && insideEll(p, e, 0.99)) return true;
  for (const c of CAPS) if (c !== self && insideCap(p, c, 0.99)) return true;
  return false;
}

export function buildHeart(n: number, rng: () => number): AnatomyPoints {
  const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const size = new Float32Array(n), phase = new Float32Array(n);
  let i = 0;

  function put(p: number[], nv: number[], tag: Tag, interior: boolean) {
    const x = p[0] * TC + p[2] * TS, z = -p[0] * TS + p[2] * TC, y = p[1];
    const nx = nv[0] * TC + nv[2] * TS, nz = -nv[0] * TS + nv[2] * TC, ny = nv[1];
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    nrm[i * 3] = nx; nrm[i * 3 + 1] = ny; nrm[i * 3 + 2] = nz;
    const zb = (z + 1.05) / 2.5;
    let c: number[];
    if (rng() < 0.011) c = MINT;
    else if (tag === 'm') {
      const b = Math.min(5, Math.max(0, Math.floor(zb * 5 + (rng() - 0.5) * 1.7)));
      c = RAMP_M[interior ? Math.max(0, b - 2) : b];
    } else if (tag === 'a') {
      c = RAMP_A[Math.min(3, Math.max(0, Math.floor(zb * 3 + (rng() - 0.5) * 1.4)))];
    } else {
      c = RAMP_V[Math.min(3, Math.max(0, Math.floor(zb * 3 + (rng() - 0.5) * 1.4)))];
    }
    col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    size[i] = (interior ? 1.1 : 1.5) + rng() * 1.1;
    phase[i] = rng() * Math.PI * 2;
    i++;
  }

  const scale = (w: number) => Math.round((w / 30000) * n);

  for (const e of ELLS) {
    const target = scale(e.w);
    let made = 0, guard = 0;
    while (made < target && i < n && guard < target * 40) {
      guard++;
      const u = rng() * 2 - 1, ph = rng() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      const d = [s * Math.cos(ph), s * Math.sin(ph), u];
      const p = [e.c[0] + d[0] * e.r[0], e.c[1] + d[1] * e.r[1], e.c[2] + d[2] * e.r[2]];
      if (insideOthers(p, e)) continue;
      const nv = [d[0] / e.r[0], d[1] / e.r[1], d[2] / e.r[2]];
      const nl = Math.hypot(nv[0], nv[1], nv[2]) || 1;
      put(p, [nv[0] / nl, nv[1] / nl, nv[2] / nl], e.t, false);
      made++;
    }
  }

  for (const cp of CAPS) {
    const g = capGeom(cp);
    const target = scale(cp.w);
    let made = 0, guard = 0;
    while (made < target && i < n && guard < target * 40) {
      guard++;
      const dlen = rng() * g._L;
      let seg = g._segs[0];
      for (const s of g._segs) if (dlen >= s.acc && dlen <= s.acc + s.l) { seg = s; break; }
      const tl = (dlen - seg.acc) / seg.l;
      const cpos = [seg.a[0] + (seg.b[0] - seg.a[0]) * tl, seg.a[1] + (seg.b[1] - seg.a[1]) * tl, seg.a[2] + (seg.b[2] - seg.a[2]) * tl];
      const tg = dlen / g._L, r = cp.r0 + (cp.r1 - cp.r0) * tg;
      let T = [seg.b[0] - seg.a[0], seg.b[1] - seg.a[1], seg.b[2] - seg.a[2]];
      const Tl = Math.hypot(T[0], T[1], T[2]) || 1;
      T = [T[0] / Tl, T[1] / Tl, T[2] / Tl];
      const up = Math.abs(T[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
      let n1 = [T[1] * up[2] - T[2] * up[1], T[2] * up[0] - T[0] * up[2], T[0] * up[1] - T[1] * up[0]];
      const n1l = Math.hypot(n1[0], n1[1], n1[2]) || 1;
      n1 = [n1[0] / n1l, n1[1] / n1l, n1[2] / n1l];
      const n2 = [T[1] * n1[2] - T[2] * n1[1], T[2] * n1[0] - T[0] * n1[2], T[0] * n1[1] - T[1] * n1[0]];
      const ph = rng() * Math.PI * 2, cph = Math.cos(ph), sph = Math.sin(ph);
      const nv = [n1[0] * cph + n2[0] * sph, n1[1] * cph + n2[1] * sph, n1[2] * cph + n2[2] * sph];
      const p = [cpos[0] + nv[0] * r, cpos[1] + nv[1] * r, cpos[2] + nv[2] * r];
      if (insideOthers(p, cp)) continue;
      put(p, nv, cp.t, false);
      made++;
    }
  }

  // 내부 점 (심실 안 — 깊이감)
  const interiorTarget = Math.min(n - i, Math.round(n * INTERIOR_RATIO));
  let made = 0, guard = 0;
  while (made < interiorTarget && i < n && guard < interiorTarget * 30 + 100) {
    guard++;
    const e = ELLS[rng() < 0.55 ? 0 : 1];
    const u = rng() * 2 - 1, ph = rng() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const rr = Math.cbrt(rng()) * 0.92;
    const p = [e.c[0] + s * Math.cos(ph) * e.r[0] * rr, e.c[1] + s * Math.sin(ph) * e.r[1] * rr, e.c[2] + u * e.r[2] * rr];
    put(p, [s * Math.cos(ph), s * Math.sin(ph), u], 'm', true);
    made++;
  }

  // 미달분은 좌심실 표면으로 채움
  guard = 0;
  while (i < n && guard < n * 50) {
    guard++;
    const e = ELLS[0];
    const u = rng() * 2 - 1, ph = rng() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const d = [s * Math.cos(ph), s * Math.sin(ph), u];
    const p = [e.c[0] + d[0] * e.r[0], e.c[1] + d[1] * e.r[1], e.c[2] + d[2] * e.r[2]];
    if (insideOthers(p, e)) continue;
    const nv = [d[0] / e.r[0], d[1] / e.r[1], d[2] / e.r[2]];
    const nl = Math.hypot(nv[0], nv[1], nv[2]) || 1;
    put(p, [nv[0] / nl, nv[1] / nl, nv[2] / nl], 'm', false);
  }

  return { pos, nrm, col, size, phase, count: i };
}
