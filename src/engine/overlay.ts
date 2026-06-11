/** 주석 레이어 — 콜아웃 리더라인 + 민트 먼지 + 레일 클램프 (v8 이식) */
import { ANCHORS } from './anatomy';

export interface HeartTransform {
  cs: number; sn: number;      // 스윙 회전 cos/sin
  sc: number;                  // 스케일(px)
  cx: number; cy: number;      // 심장 화면 중심
  introE: number;              // 등장 이징 0..1
}

export interface CalloutSpec { id: string; el: HTMLElement; ox: number; oy: number; }

export interface OverlayCtl {
  draw(dt: number, t: HeartTransform, heroVisible: boolean): void;
  clampRail(): void;
  resize(): void;
  destroy(): void;
}

interface Dust { x: number; y: number; vx: number; vy: number; a: number; s: number; }

export function initOverlay(
  canvas: HTMLCanvasElement,
  callouts: CalloutSpec[],
  rail: HTMLElement | null,
  kicker: HTMLElement | null,
  rng: () => number,
): OverlayCtl {
  const ctx = canvas.getContext('2d')!;
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();

  const dust: Dust[] = [];
  for (let i = 0; i < 130; i++) {
    dust.push({
      x: rng() * innerWidth, y: rng() * innerHeight,
      vx: (rng() - 0.5) * 8, vy: (rng() - 0.5) * 8,
      a: 0.06 + rng() * 0.13, s: rng() < 0.85 ? 2 : 3,
    });
  }

  const anchorById = new Map(ANCHORS.map((a) => [a.id, a.m]));

  function clampRail() {
    if (!rail || !kicker) return;
    const rows = Array.from(rail.querySelectorAll<HTMLElement>('.rl'));
    if (!rows.length) return;
    rows.forEach((r) => { r.style.display = ''; });
    rail.querySelector('#rl-more')?.remove();
    // 스크롤 무관 계산: kicker는 문서 흐름(스크롤 보정 필요), rail은 fixed(화면 고정).
    // 검사실에서 back 복귀 시 스크롤이 아래에 있어도 "스크롤 0 기준" 공간으로 판정해야 함.
    const kickerScreenTopAtZero = kicker.getBoundingClientRect().top + scrollY;
    const avail = kickerScreenTopAtZero - rail.getBoundingClientRect().top - 34;
    const rowH = rows[0].getBoundingClientRect().height || 18;
    let fit = Math.floor(avail / rowH);
    if (fit < rows.length) {
      fit = Math.max(0, fit - 1);
      rows.forEach((r, idx) => { if (idx >= fit) r.style.display = 'none'; });
      const d = document.createElement('div');
      d.className = 'rl arch';
      d.id = 'rl-more';
      d.innerHTML = `<i></i><span class="ln">+${rows.length - fit}</span><em>more wired in</em>`;
      rail.appendChild(d);
    }
  }

  return {
    resize,
    clampRail,
    draw(dt, t, heroVisible) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dust) {
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.x < 0) d.x += innerWidth; if (d.x > innerWidth) d.x -= innerWidth;
        if (d.y < 0) d.y += innerHeight; if (d.y > innerHeight) d.y -= innerHeight;
        ctx.globalAlpha = d.a;
        ctx.fillStyle = '#2BE4A4';
        ctx.fillRect(d.x, d.y, d.s, d.s);
      }
      ctx.globalAlpha = 1;
      if (!heroVisible) return;
      ctx.strokeStyle = 'rgba(43,228,164,.35)';
      ctx.fillStyle = '#2BE4A4';
      ctx.lineWidth = 1;
      for (const c of callouts) {
        const m = anchorById.get(c.id);
        if (!m) continue;
        const rx = m[0] * t.cs + m[1] * t.sn;
        const ax = t.cx + rx * t.sc * t.introE;
        const ay = t.cy - m[2] * t.sc * t.introE;
        const lx = ax + c.ox, ly = ay + c.oy;
        c.el.style.left = `${lx}px`;
        c.el.style.top = `${ly - 12}px`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + c.ox * 0.55, ly);
        ctx.lineTo(c.ox > 0 ? lx - 4 : lx + c.el.offsetWidth + 4, ly);
        ctx.stroke();
        ctx.fillRect(ax - 1.5, ay - 1.5, 3, 3);
      }
    },
    destroy() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
  };
}
