<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 프로젝트 주석 규칙

- 새 기능, 페이지, 컴포넌트, 데이터 함수에는 초보자가 역할과 흐름을 이해할 수 있는 한국어 주석을 반드시 추가합니다.
- 함수 주석은 무엇을 입력받고 무엇을 반환하는지, 왜 필요한지를 설명합니다.
- Next.js 전용 동작(Server/Client Component, metadata, 정적 경로, Suspense)은 일반 React 코드와 다른 이유를 설명합니다.
- 코드 그대로 읽히는 대입·반복 JSX에는 줄마다 주석을 달지 않습니다. 오래된 코드와 어긋날 가능성이 큰 주석보다 함수·구역 단위 주석을 우선합니다.
- 기능 변경 시 코드뿐 아니라 `CODE_COMMENT_GUIDE.md`, 작업 Log와 관련 학습 문서의 설명도 현재 동작과 일치하는지 확인합니다.
