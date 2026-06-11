# SLIME LAB

> The lab has a heartbeat. — 1인 빌더의 실험실 포트폴리오. 모든 표본(프로젝트)이 하나의 심장에 배선되어 있고, 개발 활동이 심장을 뛰게 한다.

**Live (M1, 가칭 도메인):** https://slime-lab-bxb.pages.dev

## 스택

Astro 5 (정적) + 순수 TS 엔진(`src/engine/` — WebGL POINTS 점묘 30k, 프레임워크 무관) + Cloudflare Pages.

## 명령

```bash
npm run dev        # 개발 서버
npm test           # vitest (엔진 순수 함수)
npm run build      # 정적 빌드 → dist/
npx wrangler pages deploy dist --project-name slime-lab   # 배포 (수동)
```

## 문서

- 설계 SoT: `docs/superpowers/specs/2026-06-11-slime-lab-design.md`
- M1 구현 계획(완료): `docs/superpowers/plans/2026-06-11-slime-lab-m1.md`
- 표본 콘텐츠: `src/content/specimens/*.md` / 바이탈(M1 정적): `src/data/vitals.json`

## 마일스톤 상태

- **M1 뼈대 출하 — 완료** (히어로 엔진, 표본 인덱스 16, 검사실, 배포)
- M2 — 라이브 데이터(CF Worker cron + GitHub), 케이스 스터디 카피, View Transitions
- M3 — THE DIG 지층, 터미널 이스터에그, 사운드, OG 동적 이미지, 성능 폴리시(LCP 개선)
- M4 — Awwwards SOTD 제출

## 알려진 항목 (M1)

- `vitals.json` 수치는 **플레이스홀더** (M2에서 GitHub 실데이터로 교체, UI에 "DATA AS OF" 표기)
- Lighthouse(모바일 스로틀): perf 90 / a11y·BP·SEO 100 — LCP 3.3s는 엔트런스 reveal 연출 때문, M3 폴리시 대상
- 도메인 미정 (설계서 오픈 아이템 1)
