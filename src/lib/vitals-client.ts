/** 라이브 바이탈 클라이언트 — Worker fetch + DOM 패치. 실패는 숨기지 않고 STALE 라벨로 노출. */
import { bpmFromCommits } from '../engine/heart-state';
import type { Vitals } from './vitals';

export interface LiveVitals extends Vitals {
  errors: string[];
  auth: 'ok' | 'degraded';
}

export async function fetchLive(url: string, timeoutMs = 3000): Promise<LiveVitals | null> {
  if (!url) return null;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const v = (await res.json()) as LiveVitals;
    if (!v.specimens || Object.keys(v.specimens).length === 0) return null;
    return v;
  } catch {
    return null;
  }
}

/** live가 가진 키만 덮어쓰기 — 미집계 표본은 baked 스냅샷 유지 */
export function mergeVitals(baked: Vitals, live: LiveVitals): Vitals['specimens'] {
  return { ...baked.specimens, ...live.specimens };
}

/* 마지막 머지 결과 — 터미널 등 다른 소비자가 호출 시점 기준으로 조회 */
let lastMerged: Vitals['specimens'] | null = null;
export function getMergedVitals(): Vitals['specimens'] | null {
  return lastMerged;
}

export function applyVitals(
  live: LiveVitals | null,
  baked: Vitals,
  setBpm?: (n: number) => void,
) {
  const label = document.getElementById('telemetry-label');
  if (!live) {
    if (label) {
      label.textContent = 'TELEMETRY STALE';
      label.classList.add('stale');
    }
    return;
  }
  const merged = mergeVitals(baked, live);
  lastMerged = merged;
  const total = Object.values(merged).reduce((s, v) => s + v.weeklyCommits, 0);
  setBpm?.(bpmFromCommits(total));

  if (label) {
    const partial = live.auth === 'degraded' || live.errors.length > 0;
    label.textContent = live.generatedAt.slice(0, 10) + (partial ? ' · PARTIAL' : ' · LIVE');
  }
  const bpmEl = document.getElementById('v-bpm');
  if (bpmEl) bpmEl.textContent = `${Math.round(bpmFromCommits(total))} BPM`;

  document.querySelectorAll<HTMLElement>('[data-vital-slug]').forEach((el) => {
    const v = merged[el.dataset.vitalSlug ?? ''];
    if (!v) return;
    // 주간 커밋 많을수록 맥박 점이 빨리 깜빡임 (0.8s ~ 3s)
    el.style.setProperty('--pulse-dur', `${Math.min(3, Math.max(0.8, 3 - v.weeklyCommits * 0.15))}s`);
  });
  document.querySelectorAll<HTMLElement>('[data-vital-ship]').forEach((el) => {
    const v = merged[el.dataset.vitalShip ?? ''];
    if (v) el.textContent = `${v.lastShipDays}D AGO`;
  });
}
