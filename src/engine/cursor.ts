/** 커스텀 커서(점 + 스프링 링) + 자석 버튼 (v8 이식) */
export interface CursorCtl {
  step(dt: number, mouse: { x: number; y: number }, pokeActive: boolean): void;
  bindHover(root: ParentNode): void;
  destroy(): void;
}

export function initCursor(dot: HTMLElement, ring: HTMLElement): CursorCtl {
  let rx = innerWidth / 2, ry = innerHeight / 2;
  const bound: [Element, () => void, () => void][] = [];

  // 점(dot)은 rAF 가 아니라 포인터 이벤트로 즉시 추적 — 네이티브 커서와 1:1.
  // rAF 갱신은 최소 1프레임(~16ms@60fps) 뒤처져 "굼뜬" 느낌을 줬다.
  function trackDot(e: PointerEvent) {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  }
  addEventListener('pointermove', trackDot, { passive: true });

  function bindHover(root: ParentNode) {
    root.querySelectorAll('button, a, .srow').forEach((el) => {
      const on = () => ring.classList.add('hov');
      const off = () => ring.classList.remove('hov');
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      bound.push([el, on, off]);
    });
  }

  return {
    step(dt, mouse, pokeActive) {
      // ring 스프링만 rAF 에서 보간 — k 14→22 로 트레일을 더 탄력 있게
      const k = Math.min(1, dt * 22);
      rx += (mouse.x - rx) * k;
      ry += (mouse.y - ry) * k;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      ring.classList.toggle('poke', pokeActive);
    },
    bindHover,
    destroy() {
      removeEventListener('pointermove', trackDot);
      for (const [el, on, off] of bound) {
        el.removeEventListener('mouseenter', on);
        el.removeEventListener('mouseleave', off);
      }
      bound.length = 0;
    },
  };
}

/** 자석 버튼 — 커서 쪽으로 끌렸다가 스프링 복귀 */
export function initMagnetics(root: ParentNode): () => void {
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      el.style.transform =
        `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    };
    const leave = () => {
      el.style.transition = 'transform .45s cubic-bezier(.2,.9,.3,1.4)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 450);
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    cleanups.push(() => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  });
  return () => cleanups.forEach((f) => f());
}
