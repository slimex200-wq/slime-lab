import { bpmFromCommits } from '../engine/heart-state';
import raw from '../data/vitals.json';

export interface Vitals {
  generatedAt: string;
  specimens: Record<string, { weeklyCommits: number; lastShipDays: number }>;
}

/** 전체 랩 BPM = 활성 표본 주간 커밋 합산 → bpm 매핑 (설계서 §6) */
export function labBpm(specimens: Vitals['specimens']): number {
  const total = Object.values(specimens).reduce((s, v) => s + v.weeklyCommits, 0);
  return bpmFromCommits(total);
}

export function getVitals(): { data: Vitals; stale: boolean } {
  const data = raw as Vitals;
  return { data, stale: false };
  // M1은 정적 스냅샷 — stale 판정은 M2 라이브 fetch 도입 시 활성화.
  // UI는 "DATA AS OF <generatedAt>"을 상시 표기해 데이터 시점을 정직하게 노출.
}
