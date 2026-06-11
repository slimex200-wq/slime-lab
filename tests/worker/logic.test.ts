import { describe, it, expect } from 'vitest';
import { daysSince, buildVitals, type RepoFetcher } from '../../workers/vitals/src/logic';

describe('daysSince', () => {
  it('2일 전 ISO → 2', () => {
    const now = new Date('2026-06-12T00:00:00Z');
    expect(daysSince('2026-06-10T00:00:00Z', now)).toBe(2);
  });
  it('미래 시각은 0으로 클램프', () => {
    const now = new Date('2026-06-12T00:00:00Z');
    expect(daysSince('2026-06-13T00:00:00Z', now)).toBe(0);
  });
});

describe('buildVitals', () => {
  const fetcher: RepoFetcher = async (repo) => {
    if (repo === 'o/a') return { weeklyCommits: 7, pushedAt: '2026-06-11T00:00:00Z' };
    throw new Error('api down');
  };

  it('성공 레포는 집계, repo:null은 건너뜀', async () => {
    const out = await buildVitals(
      [{ slug: 'a', repo: 'o/a' }, { slug: 'b', repo: null }],
      fetcher,
      new Date('2026-06-12T00:00:00Z'),
    );
    expect(out.specimens['a']).toEqual({ weeklyCommits: 7, lastShipDays: 1 });
    expect(out.specimens['b']).toBeUndefined();
    expect(out.errors).toEqual([]);
  });

  it('개별 레포 실패는 errors에 기록하고 계속 (silent fallback 금지)', async () => {
    const out = await buildVitals([{ slug: 'x', repo: 'o/fail' }], fetcher, new Date());
    expect(out.specimens['x']).toBeUndefined();
    expect(out.errors).toEqual(['x']);
  });
});
