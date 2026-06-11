# SLIME LAB — 설계 문서 (v1)

> 2026-06-11 확정. 브레인스토밍 세션(히어로 프로토타입 v1~v8)을 거쳐 사용자 승인된 방향의 SoT.
> 프로토타입: `.superpowers/brainstorm/1195-1781181020/content/hero-alive-v8.html`

## 1. 콘셉트

**"The lab has a heartbeat."** — 1인 빌더의 실험실. 모든 프로젝트(표본)가 하나의 심장에 배선되어 있고, 실제 개발 활동(커밋/배포)이 심장을 뛰게 한다. 포트폴리오가 문서가 아니라 **살아있는 유기체**.

- 목표: Awwwards **SOTD(Site of the Day) + Developer Award**, 이후 SOTM 노미네이트. (SOTY는 스튜디오 리그 — 목표로 잡지 않음. 근거: 2025 SOTY = Lando Norris by OFF+BRAND)
- 차별화 논리: 수상작 대부분은 "구경하는 쇼피스". 이 사이트는 **실데이터로 살아있어서** 방문할 때마다 다름. 흉내내려면 진짜 ship해야 함 — 본질적 차별화.
- 검증된 선례: Bruno Simon(1인, SOTM, 40만 방문) — "하나의 미친 콘셉트를 끝까지".

## 2. 확정된 결정 (브레인스토밍 승인 사항)

| 항목 | 결정 |
|---|---|
| 기존 hby-studio | 전부 백지. 브랜드/도메인/스택/분류 모두 재결정 |
| 콘셉트 | 실험실(Lab) — 표본 전시 |
| 표본 범위 | 공개 가능한 것 전부 (16개+, live/beta/archived 라벨, 실패작 포함) |
| 사이트 이름 | 새 lab 아이덴티티 (가칭 **SLIME LAB**, 도메인 후보 리서치는 오픈 아이템) |
| 언어 | 영어 메인, 한국어 한 줄 병기 수준 |
| 히어로 | **30,000점 점묘(파티클) 해부학적 심장** — v8 프로토타입이 기준점 |
| 모션 헌장 | scroll hijack 금지 (기존 피드백 계승). 자연 스크롤 + 반응형 연출만 |

## 3. 정보 구조 (IA)

```
/                    원페이지 수직 내러티브
├─ §1 HERO          심장 (점묘 30k) + 콜아웃 + WIRED-IN 레일 + 바이탈(ECG/BPM/SHIPS)
├─ §2 SPECIMEN INDEX 표본 16개 테이블 (상태 맥박, hover 반응, click → 검사실)
├─ §3 THE DIG       스크롤 시추 — 지층 = 시간. 표층(live) → 화석층(폐기작 + 부검 기록)
└─ §4 CONTACT/FOOTER operator 정보, GitHub/X/email

/specimen/[slug]     검사실 (Examination Room) — 표본당 1페이지
├─ 헤더: LAB—NNN / 이름 / 바이탈 메타 (class·year·status·uptime)
├─ 케이스 스터디: 문제 → 실험 → 결과 (지표 중심, AI 과장 카피 금지)
├─ 실스크린샷/영상 + 라이브 링크
└─ archived 표본은 부검 보고서(† 사인, 장기 재사용 내역) 포맷

이스터에그: ` (백틱) → 터미널 오버레이 (status/autopsy 명령)
```

내비게이션: 자연 스크롤 + 앵커. ESC = 뒤로. 페이지 전환 = View Transitions API.

## 4. 비주얼 시스템

- **배경**: 그래프페이퍼 격자 (40px 보조선 + 240px 주선, 민트 저투명) + 비네트 + 민트 먼지 입자
- **팔레트**: 잉크 다크 `#050807` / 민트 `#2BE4A4`(시스템·UI·생존 신호) / 심장 레드 램프 6단(`#5C0F1C`→`#F08A96`, 유일한 웜 액센트) / 동맥 오렌지 / 정맥 블루
- **타이포**: Geist(헤드라인 -0.04em) / Geist Mono(메타·라벨·레터스페이싱 0.1~0.2em) / Newsreader Italic(강조 단어만)
- **커서**: 기본 커서 숨김 → 민트 점 + 스프링 추적 링. 인터랙티브 호버 시 확장, 심장 위에서 "SHOCK" 라벨
- **마이크로 모션**: 자석 버튼(끌림+스프링 복귀), 텍스트 글자 스태거 등장, 모노 라벨 스크램블 디코딩, hover 시 행 들여쓰기
- **사운드**: 기본 OFF. ON 시 박동 thump(WebAudio 사인 52→34Hz). 커서 근접 시 박동·소리 가속

## 5. 히어로 엔진 (v8 프로토타입 검증 완료)

- **형태**: 해부학적 심장을 CSG(타원체+가변반경 캡슐 합집합)로 설계 — 좌/우심실, 좌/우심방, 심첨, 대동맥궁+분지 3, 폐동맥, 상대정맥. 표면 점 샘플링(타 프리미티브 내부 기각) + 10% 내부 점
- **렌더**: WebGL POINTS + depth test, 점별 곡면 법선 조명(좌상단 광원), 부위별 색 램프, DPR cap 1.5
- **물리(CPU, typed array)**: 점별 스프링 복원 + 감쇠 + 커서 반발(반경 78px+) + 쇼크 충격파 + 미세 유영
- **거동**: ±34° 스윙 자전(실루엣 유지) / 박동 팽창+플래시 / 커서 근접 → agitation(BPM 상승, ECG 동기) / 클릭 → SHOCK(비산→재조립)
- **주변 요소**: 부위별 계측 콜아웃+리더라인(AORTA—ship pipeline, LV—weeple…), 좌측 WIRED-IN 레일(공간 클램프, 키커 침범 금지), ECG 캔버스(shadowBlur 금지 — 이중 스트로크)
- **성능 교훈(반복 금지)**: 풀해상도 셰이더 금지 / ECG shadowBlur 금지 / 모바일은 점 수 12k로 다운스케일

## 6. 라이브 데이터 (콘셉트의 심장)

```
GitHub API ─┐
배포 웹훅  ─┤→ Cloudflare Worker (cron 15분) → KV/정적 JSON → 클라이언트 fetch
```

- **BPM 매핑**: `bpm = clamp(48 + weeklyCommits × 1.5, 48, 110)`. 전체 랩 BPM = 활성 레포 합산
- 표본별: last ship(최근 push/release), 주간 커밋, 상태. archived = 플랫라인
- 인덱스 행 맥박 점·검사실 바이탈도 동일 데이터
- OG 이미지: 현재 BPM·LAST SHIP이 박힌 동적 생성 (Worker) — X 공유 훅
- 실패 모드: 데이터 fetch 실패 시 마지막 캐시 + "TELEMETRY STALE" 라벨 (silent fallback 금지)

## 7. 콘텐츠 모델

표본 = 마크다운 + frontmatter (`/content/specimens/*.md`):
```yaml
no: "001"          # LAB—번호
name: "Weeple"
class: consumer app  # consumer app | creator tool | dev tool | desktop tool | experiment
year: 2025
status: live         # live | beta | frozen | archived
repo: slimex200-wq/weeple   # 라이브 데이터 연동 키 (비공개 가능)
links: { site: "...", store: "..." }
autopsy: null        # archived 전용: { died: 2026-05, cause: "...", organs: "..." }
```
비공개 제외: hansoll, crypto, fork류, vault 기획. 본문 카피는 소스 코드 기반 팩트체크 후 작성(기존 피드백 계승).

## 8. 스택

- **Astro + TypeScript + vanilla WebGL/Canvas** (히어로 엔진은 프레임워크 무관 모듈 `src/engine/`)
  - 근거: 콘텐츠 16페이지는 정적, 히어로는 순수 캔버스 — React 런타임 불필요. Awwwards는 성능도 심사(Lighthouse 100 목표). 점수에 가장 유리한 zero-JS 기본값
- 배포: **Cloudflare Pages** + Worker(데이터 cron, OG 생성)
- 폰트: 셀프호스팅(서브셋) — Google Fonts 런타임 의존 제거
- 테스트: 엔진 순수 함수(beatCurve, 샘플링, BPM 매핑) vitest / E2E는 브라우저 데몬 스크린샷 회귀

## 9. 접근성 / 폴백

- `prefers-reduced-motion`: 자전·박동·파티클 물리 정지, 정적 렌더 1프레임 + 페이드만
- 터치(모바일): 커서 반발 → 탭 = 쇼크. 커스텀 커서 비활성. 점 12k
- WebGL 미지원: 정적 심장 PNG(점묘 렌더 캡처) + 동일 레이아웃
- 시맨틱: 인덱스는 실제 `<table>`/리스트, 콜아웃은 aria-hidden 장식

## 10. 성능 예산

| 항목 | 예산 |
|---|---|
| LCP | < 1.5s |
| JS 번들 (히어로 엔진 포함) | < 90KB gzip |
| 프레임 | 60fps (물리+렌더 < 8ms/frame) |
| Lighthouse | 95+ 전 항목 |

## 11. 마일스톤

- **M1 — 뼈대 출하**: 레포 생성(신규), Astro 셋업, 히어로 엔진 이식(v8 → 모듈), §1+§2, 정적 데이터, CF Pages 배포
- **M2 — 살아나기**: Worker cron + 실데이터 BPM, 검사실 16페이지(케이스 스터디 카피), View Transitions
- **M3 — 깊이**: THE DIG 지층 섹션(화석/부검), 터미널 이스터에그, 사운드, OG 동적 이미지, 모바일/접근성 마감
- **M4 — 제출**: 성능/디테일 폴리시 패스(별도 디자인 QA), Awwwards SOTD 제출 + X 공개

## 12. 오픈 아이템

1. **이름/도메인** — "SLIME LAB" 가칭. 도메인 후보 리서치 후 별도 제안 (M1 중 결정, 배포는 pages.dev 프리뷰로 선진행 가능)
2. 검사실 케이스 스터디 카피 — 표본별 실데이터 수집 필요 (소스/스토어 기준 팩트체크)
3. 히어로 심장의 시각 디테일 튜닝(점 밀도 분포, 콜아웃 문구) — M3 폴리시 패스에서
4. THE DIG 연출 상세 — M3 착수 전 미니 프로토타입으로 재검증

## Out of scope (v1)

다크/라이트 토글(다크 단일), i18n 라우팅, CMS, 블로그, 댓글/뉴스레터, 3D 모델 로더(점묘는 수학 생성 유지)
