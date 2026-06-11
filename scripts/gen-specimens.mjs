// 일회성 생성 스크립트 — 표본 16개 md + vitals.json
import { mkdirSync, writeFileSync } from 'node:fs';

const S = [
  { no: '001', slug: 'weeple', name: 'Weeple', cls: 'consumer app', yr: 2025, st: 'live',
    d: 'An AI scheduling companion for people who plan in natural language. The longest-running culture in the lab — in production since 2025 and still shipping.' },
  { no: '002', slug: 'muse-prompt-studio', name: 'Muse Prompt Studio', cls: 'creator tool', yr: 2026, st: 'live',
    d: 'A prompt workbench for image-model power users. Born from my own product-photography workflow pain.' },
  { no: '003', slug: 'srt-saas', name: 'SRT SaaS', cls: 'creator tool', yr: 2026, st: 'live',
    d: 'Subtitle pipeline as a service. V2 shipped; commercial launch gated on external payment review.' },
  { no: '004', slug: 'tokodachi', name: 'Tokodachi', cls: 'experiment', yr: 2026, st: 'beta',
    d: 'A pixel creature that lives on your desktop and reacts to your terminal.' },
  { no: '005', slug: 'rightbefore', name: 'RightBefore', cls: 'desktop tool', yr: 2026, st: 'live',
    d: 'A Tauri desktop app published on a public update feed. Built and shipped twice in its first week.' },
  { no: '006', slug: 'kage-studio', name: 'Kage Studio', cls: 'creator tool', yr: 2026, st: 'beta',
    d: 'Canvas + subtitle studio for video work, with a Whisper-based accuracy pipeline.' },
  { no: '007', slug: 'beep-get', name: 'beep-get', cls: 'consumer app', yr: 2026, st: 'beta',
    d: 'A widget-first utility with an identity-pack skin system.' },
  { no: '008', slug: 'orido', name: 'Orido', cls: 'consumer app', yr: 2026, st: 'beta',
    d: 'A credit-based consumer service. Core infrastructure is live; the product is still growing into it.' },
  { no: '009', slug: 'receipt-anything', name: 'Receipt Anything', cls: 'consumer app', yr: 2026, st: 'beta',
    d: 'Turn anything into a receipt. MVP scaffold complete; store-side launch tasks remain.' },
  { no: '010', slug: 'flatsnap', name: 'FlatSnap', cls: 'experiment', yr: 2026, st: 'beta',
    d: 'Style-pinned product photography via image models, tuned through blind profile tests.' },
  { no: '011', slug: 'insane-search', name: 'insane-search', cls: 'dev tool', yr: 2026, st: 'live',
    d: 'An adaptive crawler tuned for Korean community sources, with a multi-phase scheduler.' },
  { no: '012', slug: 'diffwatch', name: 'diffwatch', cls: 'dev tool', yr: 2026, st: 'archived',
    autopsy: { died: '2026-05', cause: 'scope creep, weak retention loop', organs: 'diff engine → srt-saas' },
    d: 'A diff-monitoring tool. Flatlined — but its organs live on in srt-saas.' },
  { no: '013', slug: 'searchmachine', name: 'searchmachine', cls: 'dev tool', yr: 2026, st: 'archived',
    autopsy: { died: '2026-04', cause: 'economics — unit cost never closed', organs: 'crawl heuristics → insane-search' },
    d: 'A search aggregation experiment. The unit economics never closed; the crawl heuristics survived.' },
  { no: '014', slug: 'youtube-shorts-music', name: 'YT Shorts Music', cls: 'creator tool', yr: 2026, st: 'beta',
    d: 'A music-shorts generator pipeline in real personal use.' },
  { no: '015', slug: 'ai-threads', name: 'ai-threads', cls: 'creator tool', yr: 2026, st: 'beta',
    d: 'An automated Threads posting pipeline for AI news digests.' },
  { no: '016', slug: 'mailcal', name: 'MailCal', cls: 'experiment', yr: 2026, st: 'frozen',
    d: 'Email-to-calendar extraction. Frozen at proof-of-concept stage — preserved, not buried.' },
];

mkdirSync('src/content/specimens', { recursive: true });
mkdirSync('src/data', { recursive: true });

for (const s of S) {
  const autopsy = s.autopsy
    ? `autopsy:\n  died: "${s.autopsy.died}"\n  cause: "${s.autopsy.cause}"\n  organs: "${s.autopsy.organs}"`
    : 'autopsy: null';
  const md = `---
no: "${s.no}"
name: "${s.name}"
class: ${s.cls}
year: ${s.yr}
status: ${s.st}
repo: null
links: {}
${autopsy}
---

${s.d}
`;
  writeFileSync(`src/content/specimens/${s.slug}.md`, md);
}

const vitals = { generatedAt: '2026-06-11T00:00:00Z', specimens: {} };
const seed = { weeple: [14, 2], 'muse-prompt-studio': [8, 6], 'srt-saas': [6, 3], tokodachi: [5, 5], rightbefore: [4, 1], 'kage-studio': [2, 21], 'beep-get': [3, 9], orido: [2, 14], 'receipt-anything': [1, 18], flatsnap: [1, 12], 'insane-search': [3, 7], 'youtube-shorts-music': [1, 10], 'ai-threads': [2, 8] };
for (const s of S) {
  const [w, d] = seed[s.slug] ?? [0, 999];
  vitals.specimens[s.slug] = { weeklyCommits: s.st === 'archived' || s.st === 'frozen' ? 0 : w, lastShipDays: d };
}
writeFileSync('src/data/vitals.json', JSON.stringify(vitals, null, 2) + '\n');
console.log(`generated ${S.length} specimens + vitals.json`);
