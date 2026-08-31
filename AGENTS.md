<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 프로젝트 목적

- BUILD & LEARN은 만든 결과와 학습 과정을 함께 기록하는 개인 개발 아카이브입니다.
- 콘텐츠는 MDX 파일을 우선 사용하며, 실제 운영상 필요가 생기기 전에는 DB나 관리자 기능을 성급하게 추가하지 않습니다.

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

## 프로젝트 주석 규칙

- 새 기능, 페이지, 컴포넌트, 데이터 함수에는 초보자가 역할과 흐름을 이해할 수 있는 한국어 주석을 반드시 추가합니다.
- 함수 주석은 무엇을 입력받고 무엇을 반환하는지, 왜 필요한지를 설명합니다.
- Next.js 전용 동작(Server/Client Component, metadata, 정적 경로, Suspense)은 일반 React 코드와 다른 이유를 설명합니다.
- 코드 그대로 읽히는 대입·반복 JSX에는 줄마다 주석을 달지 않습니다. 오래된 코드와 어긋날 가능성이 큰 주석보다 함수·구역 단위 주석을 우선합니다.
- 기능 변경 시 코드뿐 아니라 `docs/guides/CODE_COMMENT_GUIDE.md`, 작업 Log와 관련 학습 문서의 설명도 현재 동작과 일치하는지 확인합니다.
