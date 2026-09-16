# BUILD & LEARN

만들고 배우고, 그 과정을 기록하는 개인 개발 아카이브입니다.

- 배포 주소: https://build-learn-five.vercel.app/

## 스택

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 (`@import "tailwindcss"` + `src/styles`의 커스텀 CSS 변수)
- Supabase (Postgres, Auth, Storage) — 콘텐츠 DB, Google 로그인, 관리자 권한(RLS)

## 주요 기능

- 공개 사이트: Projects·Log 목록/상세, About, Contact
- Google 로그인 회원은 Log 게시글에 댓글 작성 가능 (가입 화면 없이 Google 로그인 시 자동 가입, 기본 권한은 `member`)
- 다크 모드: 시스템 설정 자동 감지 + 수동 전환(관리자 사이드바에 토글 버튼)
- `/admin`: 콘텐츠(Projects·Log) 작성/발행 관리, 문의함, Tech Radar(기술 블로그 RSS 수집), 파일 관리, 현황 대시보드(콘텐츠·회원·댓글 지표와 주간 추이)
- 관리자 권한은 UUID 하드코딩 비교가 아니라 `public.user_roles`/`public.is_admin()`으로 판별

## 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 환경변수 참고)
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## 환경변수

`.env.example`에 필요한 변수 이름과 설명이 있습니다. 최소한 Supabase 연결값(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)이 있어야 사이트와 `/admin`이 동작하며, 나머지(Resend 메일 알림, Anthropic 다이제스트 요약)는 선택 사항입니다.

## 검증

```bash
npm run lint
npm run type-check
npm run format:check
npm run build
```

## 콘텐츠 작성

- Projects·Log 콘텐츠는 `/admin`에서 Supabase DB에 직접 작성·발행합니다.
- `src/content/**/*.mdx`는 예전 MDX 기반 구조의 백업 원본으로만 남아 있으며, 공개 사이트는 더 이상 이 파일들을 읽지 않습니다.

## 더 알아보기

- 프로젝트 목적, 하네스 문서, 주석 규칙 등은 [AGENTS.md](AGENTS.md)에 목차로 정리되어 있습니다.
- Next.js를 처음 접하는 경우 [docs/guides/NEXTJS_REQUEST_FLOW_GUIDE.md](docs/guides/NEXTJS_REQUEST_FLOW_GUIDE.md)에서 요청 흐름을 단계별로 설명합니다.
