// prebuild: Worker 최신 바이탈을 빌드 스냅샷으로 굽는다.
// 실패 시 기존 src/data/vitals.json 유지 (빌드는 막지 않되, 콘솔에 명시 — 침묵 금지)
import { readFileSync, writeFileSync } from 'node:fs';

const URL = 'https://slime-lab-vitals.slimex200.workers.dev';
const PATH = 'src/data/vitals.json';

try {
  const res = await fetch(URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const live = await res.json();
  if (!live.specimens || Object.keys(live.specimens).length === 0) throw new Error('empty specimens');
  const baked = JSON.parse(readFileSync(PATH, 'utf8'));
  // live가 가진 키만 갱신 — 미매핑 표본은 기존 스냅샷 유지
  const merged = {
    generatedAt: live.generatedAt,
    specimens: { ...baked.specimens, ...live.specimens },
  };
  writeFileSync(PATH, JSON.stringify(merged, null, 2) + '\n');
  console.log(`[bake-vitals] OK — ${Object.keys(live.specimens).length} live keys, generatedAt ${live.generatedAt}`);
} catch (e) {
  console.warn(`[bake-vitals] FAILED (${e.message}) — 기존 스냅샷으로 빌드 진행`);
}
