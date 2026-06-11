/** vitals Worker 순수 로직 — GitHub 집계를 fetcher로 추상화 (테스트 가능) */
export interface RepoVital { weeklyCommits: number; pushedAt: string; }
export type RepoFetcher = (repo: string) => Promise<RepoVital>;

export interface VitalsOut {
  generatedAt: string;
  specimens: Record<string, { weeklyCommits: number; lastShipDays: number }>;
  errors: string[];
}

export function daysSince(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000));
}

export interface RepoMapEntry {
  slug: string;
  repo: string | null;
  /** archived/frozen 표본 — 설계서 §6: 플랫라인. lastShip은 사실대로, 맥박은 0 고정 */
  flatline?: boolean;
}

export async function buildVitals(
  map: RepoMapEntry[],
  fetcher: RepoFetcher,
  now: Date,
): Promise<VitalsOut> {
  const out: VitalsOut = { generatedAt: now.toISOString(), specimens: {}, errors: [] };
  for (const { slug, repo, flatline } of map) {
    if (!repo) continue;
    try {
      const v = await fetcher(repo);
      out.specimens[slug] = {
        weeklyCommits: flatline ? 0 : v.weeklyCommits,
        lastShipDays: daysSince(v.pushedAt, now),
      };
    } catch {
      out.errors.push(slug); // 실패를 숨기지 않는다 — 응답에 그대로 노출
    }
  }
  return out;
}
