/// <reference types="@cloudflare/workers-types" />
/** slime-lab-vitals — cron 15분마다 GitHub 활동 집계 → KV, fetch는 CORS JSON 서빙 */
import { buildVitals, type RepoFetcher, type RepoMapEntry } from './logic';

interface Env {
  VITALS: KVNamespace;
  GITHUB_TOKEN?: string;
}

/** 표본 frontmatter와 동일한 매핑 (미매핑 5종은 null — 형 확인 후 채움) */
const REPO_MAP: RepoMapEntry[] = [
  { slug: 'weeple', repo: null },
  { slug: 'muse-prompt-studio', repo: null },
  { slug: 'srt-saas', repo: 'slimex200-wq/srt-saas' },
  { slug: 'tokodachi', repo: 'slimex200-wq/tokodachi' },
  { slug: 'rightbefore', repo: 'slimex200-wq/rightbefore-releases' },
  { slug: 'kage-studio', repo: 'slimex200-wq/kage-studio' },
  { slug: 'beep-get', repo: 'slimex200-wq/beep-get' },
  { slug: 'orido', repo: 'slimex200-wq/orido' },
  { slug: 'receipt-anything', repo: 'slimex200-wq/receipt-anything' },
  { slug: 'flatsnap', repo: 'slimex200-wq/flatsnap' },
  { slug: 'insane-search', repo: null },
  { slug: 'diffwatch', repo: 'slimex200-wq/diffwatch', flatline: true },
  { slug: 'searchmachine', repo: 'slimex200-wq/searchmachine', flatline: true },
  { slug: 'youtube-shorts-music', repo: 'slimex200-wq/youtube-my-library' },
  { slug: 'ai-threads', repo: 'slimex200-wq/ai-threads' },
  { slug: 'mailcal', repo: null },
];

function githubFetcher(token: string | undefined): RepoFetcher {
  const headers: Record<string, string> = {
    'user-agent': 'slime-lab-vitals',
    accept: 'application/vnd.github+json',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return async (repo) => {
    const meta = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!meta.ok) throw new Error(`repo meta ${meta.status}`);
    const m = (await meta.json()) as { pushed_at: string };
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const commits = await fetch(
      `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`,
      { headers },
    );
    // 빈 레포의 commits API는 409 — weekly 0으로 처리
    const weekly = commits.ok ? ((await commits.json()) as unknown[]).length : 0;
    return { weeklyCommits: weekly, pushedAt: m.pushed_at };
  };
}

async function refresh(env: Env): Promise<string> {
  const out = await buildVitals(REPO_MAP, githubFetcher(env.GITHUB_TOKEN), new Date());
  const body = JSON.stringify({ ...out, auth: env.GITHUB_TOKEN ? 'ok' : 'degraded' });
  // 설계서 §6 마지막 캐시 유지: 전멸(0건) 결과로 멀쩡한 캐시를 덮어쓰지 않는다.
  // 클라이언트는 generatedAt 날짜로 신선도를 그대로 노출한다 (침묵 금지).
  if (Object.keys(out.specimens).length === 0) {
    const existing = await env.VITALS.get('latest');
    if (existing) return existing;
  }
  await env.VITALS.put('latest', body);
  return body;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(refresh(env));
  },
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const headers = {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=60',
    };
    let body = await env.VITALS.get('latest');
    if (!body) {
      // 첫 호출(cron 이전) — 즉석 집계로 콜드스타트 해소
      try {
        body = await refresh(env);
      } catch {
        return new Response(JSON.stringify({ error: 'no data yet' }), { status: 503, headers });
      }
    }
    // URL에 ?refresh가 있으면 백그라운드 갱신 (수동 트리거용)
    if (new URL(req.url).searchParams.has('refresh')) ctx.waitUntil(refresh(env));
    return new Response(body, { status: 200, headers });
  },
};
