/** 터미널 이스터에그 — ` 로 열고 ESC 로 닫는 오버레이 콘솔 */
export interface LabSpecimen {
  slug: string; no: string; name: string; cls: string; year: number; status: string;
  autopsy: { died: string; cause: string; organs: string } | null;
}
export interface LabData {
  specimens: LabSpecimen[];
  /** 라이브 바이탈 — applyVitals 후 채워짐 (호출 시점 조회) */
  vitals?: Record<string, { weeklyCommits: number; lastShipDays: number }> | null;
}

export const CLEAR = '\u0000CLEAR';

/** 순수 명령 파서 — 테스트 대상 */
export function parseCmd(input: string, data: LabData): string[] {
  const [cmd, ...rest] = input.trim().split(/\s+/);
  const arg = rest.join(' ').replace(/^\//, '');
  const find = (slug: string) => data.specimens.find((s) => s.slug === slug);

  switch (cmd) {
    case '':
      return [];
    case 'help':
      return [
        'available commands:',
        '  ls /specimens        list all specimens',
        '  status <slug>        vital signs for one specimen',
        '  autopsy <slug>       postmortem (archived/frozen only)',
        '  uptime               lab-wide status',
        '  clear                wipe the console',
        '  esc                  close',
      ];
    case 'ls':
      return data.specimens.map(
        (s) => `LAB—${s.no}  ${s.slug.padEnd(22)} ${s.cls.padEnd(14)} ${s.status.toUpperCase()}`,
      );
    case 'status': {
      const s = find(arg);
      if (!s) return [`status: specimen '${arg}' not found — try 'ls /specimens'`];
      const lines = [
        `SPECIMEN LAB—${s.no} · ${s.name}`,
        `  class   ${s.cls.toUpperCase()}`,
        `  year    ${s.year}`,
        `  status  ${s.status.toUpperCase()}`,
      ];
      const v = data.vitals?.[s.slug];
      if (v) {
        lines.push(`  pulse   ${v.weeklyCommits} commits/w`, `  ship    ${v.lastShipDays}d ago`);
      }
      return lines;
    }
    case 'autopsy': {
      const s = find(arg);
      if (!s) return [`autopsy: specimen '${arg}' not found`];
      if (!s.autopsy) return [`autopsy: refusing to cut a living specimen (${s.status.toUpperCase()})`];
      return [
        `† AUTOPSY — LAB—${s.no} ${s.name}`,
        `  died    ${s.autopsy.died}`,
        `  cause   ${s.autopsy.cause}`,
        `  organs  ${s.autopsy.organs}`,
      ];
    }
    case 'uptime': {
      const alive = data.specimens.filter((s) => s.status === 'live' || s.status === 'beta').length;
      return [`lab: ${alive}/${data.specimens.length} specimens alive · operator 1 human + AI · seoul, kr`];
    }
    case 'clear':
      return [CLEAR];
    default:
      return [`${cmd}: command not found — try 'help'`];
  }
}

export function initTerminal(data: LabData): { destroy(): void } {
  const el = document.createElement('div');
  el.id = 'lab-term';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Lab console');
  el.innerHTML = `
    <div class="lt-win">
      <div class="lt-head"><i></i><i></i><i></i><span>SLIME LAB CONSOLE — type 'help'</span></div>
      <div class="lt-out"></div>
      <div class="lt-line"><span class="lt-ps">slime@lab:~$</span><input class="lt-in" spellcheck="false" autocomplete="off" /></div>
    </div>`;
  document.body.appendChild(el);
  const out = el.querySelector<HTMLElement>('.lt-out')!;
  const input = el.querySelector<HTMLInputElement>('.lt-in')!;
  const history: string[] = [];
  let hIdx = -1;

  function print(lines: string[], echo?: string) {
    if (echo !== undefined) {
      const e = document.createElement('div');
      e.className = 'lt-echo';
      e.textContent = `slime@lab:~$ ${echo}`;
      out.appendChild(e);
    }
    for (const l of lines) {
      if (l === CLEAR) { out.innerHTML = ''; continue; }
      const d = document.createElement('div');
      d.textContent = l;
      out.appendChild(d);
    }
    out.scrollTop = out.scrollHeight;
  }

  function toggle(open: boolean) {
    el.classList.toggle('open', open);
    if (open) input.focus();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = input.value;
      if (v.trim()) { history.push(v); hIdx = history.length; }
      print(parseCmd(v, data), v);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      if (hIdx > 0) { hIdx--; input.value = history[hIdx] ?? ''; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (hIdx < history.length) { hIdx++; input.value = history[hIdx] ?? ''; }
      e.preventDefault();
    }
    e.stopPropagation();
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === '`' && !el.classList.contains('open')) {
      e.preventDefault();
      toggle(true);
    } else if (e.key === 'Escape' && el.classList.contains('open')) {
      toggle(false);
    }
  }
  addEventListener('keydown', onKey);
  print(["lab console ready — type 'help'"]);

  return {
    destroy() {
      removeEventListener('keydown', onKey);
      el.remove();
    },
  };
}
