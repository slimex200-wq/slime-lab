/** ECG 스트립 (v8 이식). shadowBlur 금지 — 이중 스트로크 글로우 (설계서 §5 성능 교훈). */
export interface Ecg {
  push(value: number, dt: number): void;
  draw(): void;
}

export function createEcg(canvas: HTMLCanvasElement): Ecg {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 460;
  canvas.height = 108;
  const pts: { x: number; y: number }[] = [];
  let ex = 0;

  return {
    push(value, dt) {
      const w = canvas.width, h = canvas.height, mid = h * 0.62;
      ex += w * 0.32 * dt;
      pts.push({ x: ex, y: mid - value * h * 0.4 });
      while (pts.length && pts[0].x < ex - w) pts.shift();
    },
    draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(43,228,164,.13)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 36) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(43,228,164,.25)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      pts.forEach((p, i) => { const px = w - (ex - p.x); i ? ctx.lineTo(px, p.y) : ctx.moveTo(px, p.y); });
      ctx.stroke();
      ctx.strokeStyle = '#2BE4A4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((p, i) => { const px = w - (ex - p.x); i ? ctx.lineTo(px, p.y) : ctx.moveTo(px, p.y); });
      ctx.stroke();
    },
  };
}
