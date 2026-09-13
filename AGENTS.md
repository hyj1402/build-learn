<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 프로젝트 목적

- BUILD & LEARN은 만든 결과와 학습 과정을 함께 기록하는 개인 개발 아카이브입니다.
- 공개 사이트는 Supabase DB의 `published` Project·Log 데이터를 조회합니다. 브라우저 기반 관리에는 Supabase DB·Auth·Storage와 `/admin`을 사용합니다.
- 기존 MDX 파일은 이전 원본·렌더링 호환성 확인을 위한 백업으로 보존합니다. 운영 검증이 끝난 뒤에도 삭제 여부는 별도 결정합니다.
- 관리자 권한은 사용자 UUID를 코드에서 직접 비교하지 않고 `public.user_roles`와 `public.is_admin()`으로 판별합니다.

## 프로젝트 하네스

- 현재 상태: `docs/harness/PROJECT_STATUS.md`
- 작업 절차: `docs/harness/WORKFLOW.md`
- 완료 조건: `docs/harness/QUALITY_GATES.md`
- 현재 요청: `docs/development/DEVELOPMENT_REQUEST.md`
- 누적 작업 기록: `docs/development/DEVELOPMENT_LOG.md`
- 학습 가이드: `docs/guides/LEARNING_GUIDE.md`
- 주석 규칙: `docs/guides/CODE_COMMENT_GUIDE.md`
- 배포 절차: `docs/deployment/DEPLOY.md`
- 작업 로그 템플릿: `docs/templates/WORK_LOG_TEMPLATE.md`
- Supabase·관리자 기획: `docs/planning/SUPABASE_ADMIN_PLAN.md`
- Supabase 실행 계획: `docs/planning/SUPABASE_EXECUTION_PLAN.md`

## 작업 문서 원칙

- `AGENTS.md`는 상세 설명을 모두 담는 문서가 아니라 현재 작업에 필요한 기준 문서로 안내하는 목차로 유지합니다.
- 코드와 문서가 어긋나면 실제 코드를 확인한 뒤 관련 상태·기획·학습 문서를 함께 갱신합니다.
- 복잡한 작업은 실행 계획에서 단계와 검증 결과를 관리하고 완료 결과는 누적 개발 로그에 남깁니다.
- 문서 점검만 하는 작업도 현재 상태와 충돌을 발견하면 `PROJECT_STATUS.md`와 관련 계획 문서를 함께 갱신합니다.

## 프로젝트 주석 규칙

- 새 기능, 페이지, 컴포넌트, 데이터 함수에는 초보자가 역할과 흐름을 이해할 수 있는 한국어 주석을 반드시 추가합니다.
- 함수 주석은 무엇을 입력받고 무엇을 반환하는지, 왜 필요한지를 설명합니다.
- Next.js 전용 동작(Server/Client Component, metadata, 정적 경로, Suspense)은 일반 React 코드와 다른 이유를 설명합니다.
- 코드 그대로 읽히는 대입·반복 JSX에는 줄마다 주석을 달지 않습니다. 오래된 코드와 어긋날 가능성이 큰 주석보다 함수·구역 단위 주석을 우선합니다.
- 기능 변경 시 코드뿐 아니라 `docs/guides/CODE_COMMENT_GUIDE.md`, 작업 Log와 관련 학습 문서의 설명도 현재 동작과 일치하는지 확인합니다.
