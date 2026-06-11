import { describe, it, expect } from 'vitest';
import { labBpm, getVitals } from '../../src/lib/vitals';

describe('vitals', () => {
  it('weekly 합산으로 lab BPM 계산 (48 + 20×1.5 = 78)', () => {
    expect(labBpm({
      weeple: { weeklyCommits: 10, lastShipDays: 1 },
      muse: { weeklyCommits: 10, lastShipDays: 2 },
    })).toBe(78);
  });

  it('정적 vitals는 14개 표본 키 전부 포함', () => {
    const { data } = getVitals();
    expect(Object.keys(data.specimens)).toHaveLength(14);
  });

  it('archived 표본은 weeklyCommits 0 (플랫라인)', () => {
    const { data } = getVitals();
    expect(data.specimens['diffwatch'].weeklyCommits).toBe(0);
    expect(data.specimens['searchmachine'].weeklyCommits).toBe(0);
  });
});
