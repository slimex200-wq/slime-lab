import { describe, it, expect } from 'vitest';
import { createPhysics, stepPhysics, shock } from '../../src/engine/physics';
import { mulberry32 } from '../../src/engine/rng';

describe('physics', () => {
  it('정지 상태는 그대로', () => {
    const p = createPhysics(10);
    stepPhysics(p, 0.016, null, new Float32Array(20), 78);
    expect(p.ox[0]).toBe(0);
    expect(p.vx[0]).toBe(0);
  });

  it('오프셋은 스프링으로 0에 수렴', () => {
    const p = createPhysics(1);
    p.ox[0] = 50;
    for (let i = 0; i < 300; i++) stepPhysics(p, 1 / 60, null, new Float32Array(2), 78);
    expect(Math.abs(p.ox[0])).toBeLessThan(0.5);
  });

  it('커서 반경 안의 점은 커서 반대쪽으로 밀려남', () => {
    const p = createPhysics(1);
    const base = new Float32Array([100, 100]);
    stepPhysics(p, 0.016, { x: 90, y: 100 }, base, 78);
    expect(p.vx[0]).toBeGreaterThan(0);
  });

  it('shock은 중심에서 바깥 방향 속도를 더함', () => {
    const p = createPhysics(1);
    const base = new Float32Array([200, 100]);
    shock(p, base, 100, 100, 300, mulberry32(3));
    expect(p.vx[0]).toBeGreaterThan(0);
  });
});
