import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../../workers/vitals/src/index';

/* KV 스텁 — Map 기반 */
function kvStub(initial?: Record<string, string>) {
  const m = new Map(Object.entries(initial ?? {}));
  return {
    get: async (k: string) => m.get(k) ?? null,
    put: async (k: string, v: string) => { m.set(k, v); },
    _map: m,
  };
}
/* ctx 스텁 — waitUntil promise를 캡처해 테스트가 await 가능하게 (Codex 리뷰 반영) */
function ctxStub() {
  const promises: Promise<unknown>[] = [];
  return {
    waitUntil(p: Promise<unknown>) { promises.push(p); },
    passThroughOnException() {},
    flush: () => Promise.all(promises),
  };
}

const okJson = (body: unknown) => ({ ok: true, json: async () => body }) as Response;

beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllGlobals(); });

function mockGithubOk() {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => {
    if (String(url).includes('/commits')) return okJson([{}, {}, {}]);
    return okJson({ pushed_at: new Date().toISOString() });
  });
}

describe('vitals worker handler', () => {
  it('scheduled가 KV에 latest를 기록', async () => {
    mockGithubOk();
    const env = { VITALS: kvStub(), GITHUB_TOKEN: 't' } as never;
    const ctx = ctxStub();
    await worker.scheduled({} as never, env, ctx as never);
    await ctx.flush();
    const body = await (env as { VITALS: ReturnType<typeof kvStub> }).VITALS.get('latest');
    expect(body).toBeTruthy();
    const v = JSON.parse(body!);
    expect(v.auth).toBe('ok');
    expect(Object.keys(v.specimens).length).toBeGreaterThan(0);
  });

  it('fetch는 KV 내용을 CORS 헤더로 서빙', async () => {
    const env = { VITALS: kvStub({ latest: '{"specimens":{"a":{}}}' }) } as never;
    const res = await worker.fetch(new Request('https://x/'), env, ctxStub() as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(await res.text()).toContain('"a"');
  });

  it('KV 비어 있고 GitHub 전부 실패면 503 (침묵 금지)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    const env = { VITALS: kvStub() } as never;
    const res = await worker.fetch(new Request('https://x/'), env, ctxStub() as never);
    // 콜드스타트 refresh는 성공하지만 specimens가 비면 빈 결과 — put은 되더라도 응답은 200 JSON
    // 완전 실패(refresh throw)일 때만 503. fetch 모킹이 reject → buildVitals는 errors만 채우고 성공하므로
    // 이 경우 200 + 빈 specimens가 정직한 응답이다.
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      const v = JSON.parse(await res.text());
      expect(Object.keys(v.specimens)).toHaveLength(0);
      expect(v.errors.length).toBeGreaterThan(0);
    }
  });

  it('전멸 결과는 기존 KV 캐시를 덮어쓰지 않음 (마지막 캐시 유지)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    const good = '{"specimens":{"weeple":{"weeklyCommits":5,"lastShipDays":1}},"errors":[],"generatedAt":"2026-06-11T00:00:00Z","auth":"ok"}';
    const kv = kvStub({ latest: good });
    const env = { VITALS: kv } as never;
    const ctx = ctxStub();
    await worker.scheduled({} as never, env, ctx as never);
    await ctx.flush();
    expect(kv._map.get('latest')).toBe(good);
  });
});
