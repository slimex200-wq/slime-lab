/** 히어로 엔진 오케스트레이터 — v8 메인 루프를 모듈 조립으로 재구성 */
import { mulberry32 } from './rng';
import { buildHeart } from './anatomy';
import { type HeartState, stepHeart } from './heart-state';
import { createPhysics, stepPhysics, shock } from './physics';
import { createPointRenderer } from './renderer';
import { createEcg } from './ecg';
import { initOverlay, type CalloutSpec } from './overlay';
import { initCursor, initMagnetics } from './cursor';

export interface MountOpts {
  host: HTMLElement;
  bpm: number;
  pointCount?: number;
  reducedMotion?: boolean;
  /** 박동 상승 에지 훅 (히어로가 보일 때만 호출됨) */
  onBeat?: () => void;
  /** 쇼크(클릭) 훅 — 박동음보다 크게 등 차별화용 */
  onShock?: () => void;
}

const SEED = 20260611;
const CALLOUT_OFFSETS: Record<string, { ox: number; oy: number }> = {
  aorta: { ox: 70, oy: -46 },
  lv: { ox: 90, oy: 10 },
  rv: { ox: -260, oy: -16 },
  apex: { ox: -250, oy: 54 },
};

export interface HeartHandle { destroy(): void; setBpm(n: number): void; }

export function mountHeart(opts: MountOpts): HeartHandle | { fallback: true } {
  const { host } = opts;
  const q = <T extends Element>(sel: string) => host.querySelector<T>(sel);
  const glCanvas = q<HTMLCanvasElement>('.hero-canvas');
  const annoCanvas = q<HTMLCanvasElement>('.hero-anno');
  const ecgCanvas = q<HTMLCanvasElement>('#ecg');
  if (!glCanvas || !annoCanvas) return { fallback: true };

  const coarse = matchMedia('(pointer: coarse)').matches;
  const N = opts.pointCount ?? (coarse ? 12000 : 30000);

  const renderer = createPointRenderer(glCanvas, N);
  if (!renderer.gl) return { fallback: true };

  const pts = buildHeart(N, mulberry32(SEED));
  const phys = createPhysics(N);
  const heart: HeartState = { bpm: opts.bpm, phase: 0, agit: 0, thump: 0 };
  const shockRng = mulberry32(SEED + 1);

  // 동적 버퍼 (renderer 계약: col은 조명 적용된 Uint8)
  const POS = new Float32Array(N * 2);
  const DEP = new Float32Array(N);
  const COL = new Uint8Array(N * 3);
  const PSZ = new Float32Array(N);
  const BASE = new Float32Array(N * 2); // 물리용 — 오프셋 제외 화면 기준 좌표

  const callouts: CalloutSpec[] = Object.entries(CALLOUT_OFFSETS)
    .map(([id, o]) => {
      const el = q<HTMLElement>(`#co-${id}`);
      return el ? { id, el, ox: o.ox, oy: o.oy } : null;
    })
    .filter((c): c is CalloutSpec => c !== null);
  const overlay = initOverlay(
    annoCanvas, callouts,
    q<HTMLElement>('#rail'), q<HTMLElement>('.kicker'),
    mulberry32(SEED + 2),
  );
  const ecg = ecgCanvas ? createEcg(ecgCanvas) : null;

  const dotEl = q<HTMLElement>('#cur-dot');
  const ringEl = q<HTMLElement>('#cur-ring');
  const cursor = !coarse && dotEl && ringEl ? initCursor(dotEl, ringEl) : null;
  cursor?.bindHover(document);
  const unMagnet = coarse ? null : initMagnetics(document);
  if (!coarse) document.body.classList.add('has-engine');

  const bpmEl = q<HTMLElement>('#v-bpm');
  const pokeEl = q<HTMLElement>('#v-poke');

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let pokeCount = 0;
  let raf = 0;
  let last = 0;
  let t0 = 0;
  let destroyed = false;

  const heartC = { x: 0, y: 0, s: 1 };
  function layout() {
    if (innerWidth < 900) {
      // 모바일: 헤드라인 위 공간에 크게
      heartC.x = innerWidth * 0.55;
      heartC.y = innerHeight * 0.28;
      heartC.s = Math.min(innerHeight * 0.16, innerWidth * 0.30);
    } else {
      heartC.x = innerWidth * 0.65;
      heartC.y = innerHeight * 0.47;
      heartC.s = Math.min(innerHeight * 0.225, innerWidth * 0.15);
    }
  }
  layout();

  function onResize() { renderer.resize(); overlay.resize(); layout(); overlay.clampRail(); }
  function onMove(e: PointerEvent) { mouse.x = e.clientX; mouse.y = e.clientY; }
  function triggerShock(x: number, y: number) {
    heart.thump = 1;
    pokeCount++;
    if (pokeEl) pokeEl.textContent = String(pokeCount);
    shock(phys, BASE, x, y, heartC.s * 3.0, shockRng);
    opts.onShock?.();
  }
  /** 스크롤 진행도: 히어로 위 1 → 인덱스 진입 0. 심장/콜아웃/레일이 흐려지며 가라앉음 */
  let lastFade = -1;
  function heroFade(): number {
    return Math.max(0, 1 - scrollY / (innerHeight * 0.7));
  }
  function applyFade(fade: number) {
    if (Math.abs(fade - lastFade) < 0.01) return;
    lastFade = fade;
    const op = String(0.10 + 0.90 * fade);
    glCanvas!.style.opacity = op;
    glCanvas!.style.filter = fade < 0.99 ? `blur(${((1 - fade) * 5).toFixed(1)}px)` : '';
    annoCanvas!.style.opacity = op;
    const vis = fade < 0.04 ? 'hidden' : '';
    for (const c of callouts) { c.el.style.opacity = String(fade); c.el.style.visibility = vis; }
    const railEl = q<HTMLElement>('#rail');
    if (railEl) { railEl.style.opacity = String(fade); railEl.style.visibility = vis; }
  }

  function onDown(e: PointerEvent) {
    if (heroFade() < 0.5) return; // 인덱스 영역에선 심장 비활성
    if (Math.hypot(e.clientX - heartC.x, e.clientY - heartC.y) < heartC.s * 2.2) {
      triggerShock(e.clientX, e.clientY);
    }
  }

  addEventListener('resize', onResize);
  addEventListener('pointermove', onMove);
  addEventListener('pointerdown', onDown);
  setTimeout(() => overlay.clampRail(), 350);

  function frame(ts: number) {
    if (destroyed) return;
    if (!last) { last = ts; t0 = ts; }
    const dt = Math.min(0.045, (ts - last) / 1000);
    last = ts;
    const tt = (ts - t0) / 1000;

    const prox = Math.max(0, 1 - Math.hypot(mouse.x - heartC.x, mouse.y - heartC.y) / (heartC.s * 3.2));
    const { beat, bpmNow, thumpEdge } = stepHeart(heart, dt, prox);
    if (thumpEdge && heroFade() > 0.5) opts.onBeat?.();

    const th = 0.6 * Math.sin(tt * 0.28);            // 스윙 ±34°
    const cs = Math.cos(th), sn = Math.sin(th);
    const sc = heartC.s * (1 + beat * 0.07 + heart.thump * 0.06);
    const flash = beat * 0.45 + heart.thump * 0.55;
    const Lx = -0.50, Ly = 0.55, Lz = 0.67;
    const intro = Math.min(1, tt * 0.7);
    const introE = 1 - Math.pow(1 - intro, 3);
    const dpr = renderer.dpr;

    for (let i = 0; i < N; i++) {
      const x = pts.pos[i * 3], y = pts.pos[i * 3 + 1], z = pts.pos[i * 3 + 2];
      const rx = x * cs + y * sn, ry = -x * sn + y * cs;
      const bx = heartC.x + rx * sc * introE, by = heartC.y - z * sc * introE;
      BASE[i * 2] = bx; BASE[i * 2 + 1] = by;
      POS[i * 2] = (bx + phys.ox[i] + Math.sin(tt * 1.6 + pts.phase[i]) * 0.7) * dpr;
      POS[i * 2 + 1] = (by + phys.oy[i] + Math.cos(tt * 1.2 + pts.phase[i]) * 0.7) * dpr;
      DEP[i] = ry * 0.25;
      const nrx = pts.nrm[i * 3] * cs + pts.nrm[i * 3 + 1] * sn;
      const nry = -pts.nrm[i * 3] * sn + pts.nrm[i * 3 + 1] * cs;
      const nrz = pts.nrm[i * 3 + 2];
      let diff = nrx * Lx + nrz * Ly + -nry * Lz;
      if (diff < 0) diff = 0;
      const br = 0.30 + 0.78 * diff + flash * 0.40;
      COL[i * 3] = Math.min(255, pts.col[i * 3] * br * 255);
      COL[i * 3 + 1] = Math.min(255, pts.col[i * 3 + 1] * br * 255);
      COL[i * 3 + 2] = Math.min(255, pts.col[i * 3 + 2] * br * 255);
      PSZ[i] = Math.max(1, (pts.size[i] + flash * 0.9 - ry * 0.45) * dpr);
    }
    stepPhysics(phys, dt, coarse ? null : mouse, BASE, 78 + heart.agit * 30);
    renderer.draw(POS, DEP, COL, PSZ, N);

    if (bpmEl) bpmEl.textContent = `${Math.round(bpmNow)} BPM`;
    if (ecg) { ecg.push(beat + heart.thump * 0.8, dt); ecg.draw(); }
    const fade = heroFade();
    applyFade(fade);
    overlay.draw(dt, { cs, sn, sc, cx: heartC.x, cy: heartC.y, introE }, fade > 0.5);
    const pokeActive =
      !coarse && fade > 0.5 && Math.hypot(mouse.x - heartC.x, mouse.y - heartC.y) < heartC.s * 2.0;
    cursor?.step(dt, mouse, pokeActive);

    if (!opts.reducedMotion) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    setBpm(n: number) { heart.bpm = n; },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      cursor?.destroy();
      unMagnet?.();
      overlay.destroy();
      document.body.classList.remove('has-engine');
    },
  };
}
