import { describe, it, expect } from 'vitest';
import { buildHeart, ANCHORS } from '../../src/engine/anatomy';
import { mulberry32 } from '../../src/engine/rng';

describe('buildHeart', () => {
  const pts = buildHeart(5000, mulberry32(1));

  it('요청한 점 개수를 정확히 생성', () => expect(pts.count).toBe(5000));

  it('경계 박스 안 (|x|<2, |y|<1.5, |z|<1.8)', () => {
    for (let i = 0; i < pts.count; i++) {
      expect(Math.abs(pts.pos[i * 3])).toBeLessThan(2);
      expect(Math.abs(pts.pos[i * 3 + 1])).toBeLessThan(1.5);
      expect(Math.abs(pts.pos[i * 3 + 2])).toBeLessThan(1.8);
    }
  });

  it('법선은 단위 벡터', () => {
    for (let i = 0; i < 200; i++) {
      const l = Math.hypot(pts.nrm[i * 3], pts.nrm[i * 3 + 1], pts.nrm[i * 3 + 2]);
      expect(l).toBeCloseTo(1, 2);
    }
  });

  it('같은 시드 → 동일 결과 (재현성)', () => {
    const a = buildHeart(100, mulberry32(9));
    const b = buildHeart(100, mulberry32(9));
    expect(Array.from(a.pos.slice(0, 30))).toEqual(Array.from(b.pos.slice(0, 30)));
  });

  it('기본색은 0..1', () => {
    for (let i = 0; i < pts.count * 3; i++) {
      expect(pts.col[i]).toBeGreaterThanOrEqual(0);
      expect(pts.col[i]).toBeLessThanOrEqual(1);
    }
  });
});

describe('ANCHORS', () => {
  it('콜아웃 앵커 4개 (aorta/lv/rv/apex)', () => {
    expect(ANCHORS).toHaveLength(4);
    for (const a of ANCHORS) expect(a.m).toHaveLength(3);
  });
});
