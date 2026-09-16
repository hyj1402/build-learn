# Claude Code 스킬 카탈로그

이 문서는 `build-learn` 프로젝트의 기능 문서가 아니라, **이 환경(Claude Code)에서 현재 사용 가능한 스킬과 검토했던 외부 플러그인을 정리한 개인 참고 목록**입니다. 하나씩 써보면서 "사용해봄"에 체크하고 평가를 적어두는 용도입니다.

> 최초 작성: 2026-09-16. 새 스킬이 설치되거나 평가가 쌓이면 이 문서를 직접 갱신하세요.

## 사용법

- 체크박스는 실제로 써본 뒤 `[x]`로 바꿉니다.
- "평가" 칸에는 잘 됐는지, 이 프로젝트(Next.js + Supabase 개인 아카이브)에 실제로 쓸모 있었는지 한두 줄로 남깁니다.

---

## A. 현재 사용 가능한 스킬 (2026-09-16 기준 설치됨)

### 엔지니어링 (engineering:*)

| 사용 | 스킬                            | 기능                                                        |
| ---- | ------------------------------- | ----------------------------------------------------------- |
| [ ]  | `engineering:code-review`       | PR/diff를 보안·성능·정확성 관점으로 리뷰                    |
| [ ]  | `engineering:debug`             | 재현 → 격리 → 진단 → 수정 순서의 구조화된 디버깅 세션       |
| [ ]  | `engineering:deploy-checklist`  | 배포 전 체크리스트(마이그레이션, 피처 플래그, 롤백 기준 등) |
| [ ]  | `engineering:documentation`     | README·API 문서·운영 런북 작성                              |
| [ ]  | `engineering:testing-strategy`  | 테스트 전략/커버리지/테스트 아키텍처 설계                   |
| [ ]  | `engineering:tech-debt`         | 기술 부채 식별·분류·우선순위화                              |
| [ ]  | `engineering:architecture`      | 아키텍처 결정 기록(ADR) 작성/평가                           |
| [ ]  | `engineering:incident-response` | 장애 트리아지, 상태 공유, 포스트모템 작성                   |
| [ ]  | `engineering:system-design`     | 시스템/서비스/API/데이터 모델 설계                          |
| [ ]  | `engineering:standup`           | 최근 활동을 스탠드업 형식으로 요약                          |

**평가 메모:**

### 코드 품질 (독립 스킬)

| 사용 | 스킬              | 기능                                                                                                                |
| ---- | ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| [ ]  | `code-review`     | 현재 diff/PR/브랜치 리뷰, `--comment`로 PR에 코멘트, `--fix`로 바로 수정 적용, `ultra`는 클라우드 멀티에이전트 리뷰 |
| [ ]  | `simplify`        | 버그가 아니라 재사용성·단순화·효율성만 점검 후 바로 적용                                                            |
| [ ]  | `security-review` | 현재 브랜치의 보류 중인 변경사항 보안 검토                                                                          |

**평가 메모:**

### 실행/설정

| 사용 | 스킬                       | 기능                                                               |
| ---- | -------------------------- | ------------------------------------------------------------------ |
| [ ]  | `run`                      | 프로젝트별 설정에 맞춰 앱을 실제로 띄우고 브라우저로 확인/스크린샷 |
| [ ]  | `init`                     | 새 CLAUDE.md를 코드베이스 문서화 내용으로 초기화                   |
| [ ]  | `update-config`            | 훅·권한·환경변수 등 `settings.json` 설정 변경                      |
| [ ]  | `keybindings-help`         | 키보드 단축키 재바인딩                                             |
| [ ]  | `fewer-permission-prompts` | 자주 쓰는 읽기 전용 명령을 허용 목록에 추가해 권한 프롬프트 줄이기 |

**평가 메모:**

### 생산성 (productivity:*)

| 사용 | 스킬                             | 기능                                                         |
| ---- | -------------------------------- | ------------------------------------------------------------ |
| [ ]  | `productivity:memory-management` | 2단계(작업 메모리/장기 지식베이스) 메모리 체계               |
| [ ]  | `productivity:task-management`   | `TASKS.md` 기반 할 일 관리                                   |
| [ ]  | `productivity:start`             | 생산성 시스템 초기 설정, 기존 할 일 목록에서 부트스트랩      |
| [ ]  | `productivity:update`            | 프로젝트 트래커의 새 작업을 `TASKS.md`에 동기화, 메모리 갱신 |

**평가 메모:**

### Anthropic 공식 (anthropic-skills:*)

| 사용 | 스킬                                  | 기능                                                     |
| ---- | ------------------------------------- | -------------------------------------------------------- |
| [ ]  | `anthropic-skills:docx`               | Word 문서(.docx/.dotx) 생성·편집                         |
| [ ]  | `anthropic-skills:pdf`                | PDF 생성·편집·병합·분할·OCR                              |
| [ ]  | `anthropic-skills:pptx`               | PowerPoint(.pptx/.potx) 생성·편집                        |
| [ ]  | `anthropic-skills:xlsx`               | 스프레드시트(.xlsx/.csv 등) 생성·편집                    |
| [ ]  | `anthropic-skills:skill-creator`      | 새 스킬 제작/평가                                        |
| [ ]  | `anthropic-skills:schedule`           | 반복/예약 작업 생성                                      |
| [ ]  | `anthropic-skills:consolidate-memory` | 메모리 파일 중복 정리·오래된 사실 수정                   |
| [ ]  | `anthropic-skills:import-memory`      | 다른 AI 어시스턴트의 메모리 내보내기를 가져오기          |
| [ ]  | `anthropic-skills:explain-usage`      | 이번 세션 토큰 사용처를 차트로 설명                      |
| [ ]  | `anthropic-skills:morning`            | 모닝 브리핑을 스타일 적용된 HTML로 렌더링                |
| [ ]  | `anthropic-skills:setup-claude`       | 역할에 맞는 플러그인 설치, 도구 연결 등 초기 설정 가이드 |

**평가 메모:**

### 디자인/시각화

| 사용 | 스킬                    | 기능                                                                      |
| ---- | ----------------------- | ------------------------------------------------------------------------- |
| [ ]  | `design`                | 여러 아트보드로 구성된 디자인 캔버스(UI 목업, 랜딩페이지, 포스터 등) 제작 |
| [ ]  | `dataviz`               | 차트/그래프/대시보드 제작 시 색상·형태 가이드                             |
| [ ]  | `artifact-design`       | 아티팩트(웹 페이지) 작성 전 디자인 가이드                                 |
| [ ]  | `artifact-diagramming`  | 아티팩트 안에 다이어그램(SVG) 그리는 노하우                               |
| [ ]  | `artifact-capabilities` | 아티팩트에 부여 가능한 런타임 기능(DB, 자산 저장 등) 안내                 |

**평가 메모:**

### Desktop Commander

| 사용 | 스킬                                           | 기능                                                    |
| ---- | ---------------------------------------------- | ------------------------------------------------------- |
| [ ]  | `desktop-commander:terminal`                   | 상태가 유지되는 셸/REPL, 장시간 실행 프로세스, SSH 등   |
| [ ]  | `desktop-commander:ai-tools-setup`             | Claude Desktop/MCP 서버 설치·연결·점검                  |
| [ ]  | `desktop-commander:computer-health-check`      | PC 상태(디스크, CPU/메모리, 배터리, 시작 프로그램) 점검 |
| [ ]  | `desktop-commander:knowledge-base`             | 마크다운 지식베이스 생성·관리                           |
| [ ]  | `desktop-commander:obsidian-vault`             | Obsidian vault 정리(MOC, 위키링크, 프런트매터 등)       |
| [ ]  | `desktop-commander:desktop-commander-overview` | Desktop Commander 전반 기능 안내                        |

**평가 메모:**

### 반복 실행 / 예약

| 사용 | 스킬       | 기능                                                              |
| ---- | ---------- | ----------------------------------------------------------------- |
| [ ]  | `loop`     | 프롬프트/슬래시 커맨드를 일정 간격 또는 자체 페이싱으로 반복 실행 |
| [ ]  | `schedule` | 클라우드에서 cron 기반으로 실행되는 예약 에이전트 생성/관리       |

**평가 메모:**

### 참고 문서 / Codex 연동

| 사용 | 스킬           | 기능                                                               |
| ---- | -------------- | ------------------------------------------------------------------ |
| [ ]  | `claude-api`   | Claude API/Anthropic SDK 레퍼런스(모델 id, 가격, 캐싱, 툴 사용 등) |
| [ ]  | `codex:rescue` | 막히거나 더 깊은 조사가 필요할 때 Codex로 작업 위임                |
| [ ]  | `codex:setup`  | 로컬 Codex CLI 준비 상태 확인, 리뷰 게이트 토글                    |

**평가 메모:**

### 플러그인 관리 (cowork-plugin-management:*)

| 사용 | 스킬                                                | 기능                                        |
| ---- | --------------------------------------------------- | ------------------------------------------- |
| [ ]  | `cowork-plugin-management:cowork-plugin-customizer` | 조직 도구에 맞춰 기존 플러그인 커스터마이즈 |
| [ ]  | `cowork-plugin-management:create-cowork-plugin`     | 새 플러그인을 처음부터 제작                 |

**평가 메모:**

---

## B. 검토했던 외부 플러그인 후보 (2026-09-15~16 조사, 미설치)

| 사용/설치 | 이름                                                                           | 실제 스타 수(API 확인)                      | 기능                                                                                                                                    | 이 프로젝트 적합성 판단                                                                                                     |
| --------- | ------------------------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [ ]       | [Ponytail](https://github.com/dietrichgebert/ponytail)                         | 139k                                        | 코드 작성 전 "필요한가 → 이미 있나 → 표준/네이티브로 되나 → 한 줄로 되나" 점검, 과잉설계 방지. `/ponytail-review`, `/ponytail-audit` 등 | **추천** — 기존 `WORKFLOW.md`의 "범위 밖 기능 금지" 원칙과 정확히 일치, 설치 비용 낮음                                      |
| [ ]       | [Superpowers](https://github.com/obra/superpowers)                             | 287k                                        | 설계→git worktree 격리→작업 분해→서브에이전트 리뷰→TDD→코드리뷰까지 강제하는 무거운 개발 방법론                                         | 비추천 — 이미 자체 하네스(`AGENTS.md`/`WORKFLOW.md`/`QUALITY_GATES.md`)와 기능 중복, 1인 프로젝트엔 과함                    |
| [ ]       | [Context7](https://github.com/upstash/context7)                                | 62k                                         | 최신 라이브러리 문서를 LLM에 제공                                                                                                       | 설치 불필요 — 이미 claude.ai 커넥터로 연결돼 있음(연결 이름: "Context7")                                                    |
| [ ]       | [claude-mem](https://github.com/thedotmack/claude-mem)                         | 94k                                         | 세션 간 지속 메모리, 로컬 SQLite+벡터 검색                                                                                              | 설치 불필요 — Claude Code 자체 자동 메모리 시스템과 중복                                                                    |
| [ ]       | [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | 213k                                        | 단일 CLAUDE.md 파일, "가정 명시/단순함 우선/범위 밖 수정 금지/목표 지향 실행" 4규칙                                                     | 설치 불필요 — 이미 기본 동작 지침과 `AGENTS.md`에 동일 원칙 포함, 2026-04 이후 업데이트 없음                                |
| [ ]       | [anthropics/skills](https://github.com/anthropics/skills) 중 `frontend-design` | 저장소 전체 176k, 스킬 자체는 설치 수 82만+ | 타이포그래피·모션·레이아웃이 두드러지는 프로덕션급 프런트엔드 UI 생성                                                                   | **검토 가치 있음** — Anthropic 공식, 이 환경엔 아직 없음. Home/About/Projects처럼 사람이 보는 페이지 디자인 다듬기에 실용적 |
| [ ]       | [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | API로 미검증(검색 결과 기준)                | 79개 UI 스타일, 192개 팔레트, 로고/배너/브랜드 아이덴티티까지 포함하는 대형 번들                                                        | 참고만 — 개인 아카이브 사이트 하나엔 범위가 과함                                                                            |
| [ ]       | "Everything Claude Code" 류 대형 번들                                          | 35k                                         | 64개 에이전트·261개 스킬·84개 커맨드(TDD, 보안감사, 배포 등)                                                                            | 설치 불필요 — 이미 위 A절의 `engineering:*` 스킬들로 상당 부분 커버됨                                                       |

**평가 메모:**

---

## 다음에 해볼 것 후보 (직접 채워나가기)

- [ ]
- [ ]
- [ ]
