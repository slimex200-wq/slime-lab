import { describe, it, expect } from 'vitest';
import { parseCmd, type LabData } from '../../src/engine/terminal';

const DATA: LabData = {
  specimens: [
    { slug: 'weeple', no: '001', name: 'Weeple', cls: 'consumer app', year: 2025, status: 'live', autopsy: null },
    { slug: 'diffwatch', no: '012', name: 'diffwatch', cls: 'dev tool', year: 2026, status: 'archived',
      autopsy: { died: '2026-05', cause: 'scope creep', organs: 'diff engine → srt-saas' } },
  ],
};

describe('parseCmd', () => {
  it('미지 명령은 not found + help 안내', () => {
    const out = parseCmd('frobnicate', DATA);
    expect(out.join(' ')).toContain('command not found');
  });
  it('ls /specimens 는 표본 수만큼 출력', () => {
    expect(parseCmd('ls /specimens', DATA)).toHaveLength(2);
  });
  it('status <slug> 는 상태 정보 출력', () => {
    const out = parseCmd('status weeple', DATA).join(' ');
    expect(out).toContain('LIVE');
    expect(out).toContain('2025');
  });
  it('autopsy 는 산 표본을 거부', () => {
    expect(parseCmd('autopsy weeple', DATA).join(' ')).toContain('living specimen');
    expect(parseCmd('autopsy diffwatch', DATA).join(' ')).toContain('scope creep');
  });
});
