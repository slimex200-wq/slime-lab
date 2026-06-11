import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../../src/engine/rng';
import { beatCurve, bpmFromCommits, stepHeart, type HeartState } from '../../src/engine/heart-state';

describe('mulberry32', () => {
  it('같은 시드 → 같은 수열', () => {
    const a = mulberry32(42), b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('0..1 범위', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('beatCurve', () => {
  it('수축기 피크(t=0.16)는 1.0', () => expect(beatCurve(0.16)).toBeCloseTo(1.0, 5));
  it('이완기(t>=0.46)는 0', () => {
    expect(beatCurve(0.46)).toBe(0);
    expect(beatCurve(0.9)).toBe(0);
  });
  it('전 구간 0..1.05', () => {
    for (let t = 0; t < 1; t += 0.001) {
      const v = beatCurve(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('bpmFromCommits', () => {
  it('0커밋 → 48 (바닥)', () => expect(bpmFromCommits(0)).toBe(48));
  it('20커밋 → 78', () => expect(bpmFromCommits(20)).toBe(78));
  it('100커밋 → 110 (천장)', () => expect(bpmFromCommits(100)).toBe(110));
});

describe('stepHeart', () => {
  it('proximity로 bpm 최대 1.9배', () => {
    const h: HeartState = { bpm: 60, phase: 0, agit: 1, thump: 0 };
    const { bpmNow } = stepHeart(h, 0.016, 1);
    expect(bpmNow).toBeCloseTo(60 * 1.9, 0);
  });
  it('박동 상승 에지에서 thumpEdge=true 정확히 1회/주기', () => {
    const h: HeartState = { bpm: 60, phase: 0, agit: 0, thump: 0 };
    let edges = 0;
    for (let i = 0; i < 63; i++) {
      if (stepHeart(h, 1 / 60, 0).thumpEdge) edges++;
    }
    expect(edges).toBe(1);
  });
});
