# Supabase 관리자 기능 실행 계획

> 전체 요구사항과 설계 방향은 `SUPABASE_ADMIN_PLAN.md`에서 관리하고, 이 문서는 실제 구현 순서·검증 결과·남은 문제를 관리합니다.

## 운영 원칙

- 한 번에 한 단계를 진행합니다.
- 완료 표시는 구현과 실제 허용·거부 검증이 모두 끝났을 때만 합니다.
- 실패한 접근과 결정 이유를 기록해 새 채팅에서 같은 시도를 반복하지 않게 합니다.
- DB 전환과 운영 검증이 끝날 때까지 기존 MDX를 삭제하지 않습니다.

## 현재 상태

- 현재 단계: 5단계 대부분 진행 — Projects, Log 모두 공개 목록·상세가 DB 조회로 전환됨. 로컬 검증만 완료, 프로덕션 배포 확인 대기
- 전체 상태: 진행 중
- 다음 작업: TipTap 리치 텍스트 에디터 → 카테고리·이미지 관리 → Vercel 배포 재확인

## 0단계 — 연결과 현재 스키마 확인

- [x] Supabase URL과 공개키 설정
- [x] 브라우저·서버 클라이언트 구성
- [x] Auth Health 및 Settings API 200 응답 확인
- [x] Claude 작업 기록상 `categories`, `projects`, `logs` 테이블과 RLS 생성
- [x] 원격 테이블, 제약조건, 인덱스, RLS 정책 독립 조회 (Claude, 2026-09-10 — `pg_indexes`/`pg_constraint`/`pg_policies` 직접 조회)
- [x] 현재 `is_published`·`content` 구조와 기획의 `publication_status`·`body_json` 구조 조정 (Codex가 이미 반영, Claude가 재조회로 확인)
- [x] Google Provider와 Redirect URL 계획 확정

완료 조건: 실제 원격 상태와 저장소의 스키마 문서가 일치하고 다음 단계에서 사용할 구조가 하나로 확정된다.

## 1단계 — DB 스키마와 RLS 확정

- [x] `draft`, `private`, `published` 공개 상태 적용
- [x] 프로젝트 진행 상태를 공개 상태와 별도 관리
- [ ] 카테고리 확장 구조 확정 (테이블은 존재하나 관리자 화면·시드 데이터 없이는 "확정"으로 보지 않음)
- [ ] TipTap `body_json`과 검색용 텍스트 구조 확정 (컬럼만 존재, 에디터 연동 전)
- [x] 제약조건과 인덱스 검토 (Claude, 2026-09-10 — `categories(content_type, slug)` unique 확인, `publication_status`/`category_id`/`author_id`에 인덱스 누락 발견 후 추가)
- [x] 익명 사용자의 공개 글 조회 허용 검증 (REST API로 실제 확인: published 행만 반환)
- [x] 비공개·임시저장 조회 거부 검증 (REST API로 실제 확인: draft/private 행 응답에서 제외)
- [x] 비관리자의 쓰기 거부 검증 (REST API로 anon key INSERT/UPDATE/DELETE 시도, 모두 실제 반영 없음 확인 — UPDATE/DELETE는 HTTP 204를 반환하지만 PostgREST 특성상 RLS가 대상 행을 0건으로 걸러낸 결과이며 DB 재조회로 미반영 확인)
- [x] 학습 기록 관리자 CRUD 허용 검증 (관리자 계정으로 실제 글 작성 확인, 2026-09-10)
- [ ] 프로젝트 관리자 CRUD 허용 검증 (프로젝트 관리 화면 구현 후 진행)
- [x] Advisor 확인 후 마이그레이션과 스키마 문서 저장 (`get_advisors` security/performance 확인, critical 없음 — `supabase/migrations/`에 베이스라인 + 인덱스 마이그레이션 저장)

완료 조건: 허용할 요청은 성공하고 차단할 요청은 실제로 거부된다.

## 2단계 — Google 로그인과 관리자 권한

- [x] Google Auth Provider 활성화 (Auth Settings API로 `google: true` 확인)
- [x] 로컬·Vercel Redirect URL 등록 (사용자가 Supabase 대시보드에서 직접 등록)
- [x] 로그인 콜백과 로그아웃 구현 (`src/app/auth/callback/route.ts`, `src/components/auth/LogoutButton.tsx`)
- [x] 세션 갱신 구성 (`src/proxy.ts` + `src/lib/supabase/middleware.ts` — Next.js 16의 `middleware.ts` → `proxy.ts` 개명 반영)
- [x] 역할 테이블 기반 관리자 판별 (`public.user_roles`의 `admin` 역할을 관리자 화면과 RLS에서 함께 사용)
- [x] `/admin` 비로그인 접근 차단 (브라우저로 `/admin` 접속 시 `/login`으로 리다이렉트되는 것을 실제 확인)
- [x] 일반 로그인 사용자 접근 차단 코드 구현 (`/admin` layout과 각 Server Action에서 `isAdminUser()`로 재검증)

완료 조건: 소유자만 관리자 화면에 들어가며 로그인 여부만으로 관리자 권한을 얻을 수 없다.

**배포 전 확인**: Vercel에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록하고, 운영 주소에서 Google 로그인·관리자 글 작성·비공개 글 차단을 다시 확인한다.

## 3단계 — 관리자 CRUD와 에디터

- [x] 관리자 대시보드
- [x] 프로젝트 목록·작성·수정·삭제
- [x] 학습 기록 목록·작성·수정·삭제
- [x] 학습 기록의 공개·비공개·임시저장 처리
- [ ] TipTap 기반 리치 텍스트 에디터
- [ ] 미리보기와 slug 중복 검사
- [ ] 카테고리 관리
- [ ] 관리자 이미지 업로드와 Storage 정책

완료 조건: VS Code 없이 브라우저에서 두 콘텐츠 종류와 이미지를 안전하게 관리한다.

## 4단계 — 기존 MDX 이전

- [x] Log MDX 11개(1~9차 + 템플릿 정비 글)의 frontmatter와 본문 변환 (Claude, 2026-09-11 — `<Callout>`/`<InputBox>` 등 MDX 문법을 그대로 `body_text`에 보존해 `compileMDX` 렌더링 그대로 재사용)
- [x] 기존 slug, 날짜, 정렬(`display_order`) 유지
- [x] Callout/InputBox 전용 블록 변환 — 별도 변환 없이 원본 MDX 텍스트를 그대로 저장해 기존 렌더링 파이프라인 재사용
- [ ] 중복 실행해도 데이터가 복제되지 않는 이전 방식 적용 (이번 이전은 1회성 SQL로 수행, 재사용 가능한 스크립트화는 아직 없음)
- [x] 이전 전후 콘텐츠 수와 필수 필드 비교 (11개 전부 확인, 카테고리 조인 오류 발견 후 수정)
- [x] 모든 상세 URL과 본문 확인 (`/log/round-6-editorial-mdx-system`에서 표·인용·Callout·InputBox 렌더링 확인)
- [x] Projects는 Codex가 이력서 데이터 8건으로 별도 이전 완료 (`supabase/seed/20260911_resume_projects.sql`)

완료 조건: 기존 콘텐츠가 빠짐없이 DB에 있고 원래 URL로 표시된다. **Log·Projects 모두 로컬에서 충족, 프로덕션 재확인 대기.**

## 5단계 — 공개 사이트 전환과 배포

- [x] 목록·상세·검색·필터를 DB 조회로 전환 (Projects, Log 모두 완료 — `src/lib/projects-db.ts`, `src/lib/logs-db.ts`)
- [ ] metadata, sitemap, robots 확인 (sitemap은 DB 함수로 갱신했으나 실제 프로덕션 재생성은 미확인)
- [x] 공개 상태별 접근 확인 (draft 글이 목록에 노출되지 않는 것을 로컬에서 확인)
- [ ] 모바일·데스크톱 UI와 콘솔 확인
- [ ] Vercel 환경변수 설정
- [ ] 프로덕션 배포와 회귀 검사
- [ ] 운영 검증 후 기존 MDX 보관 또는 삭제 결정
- [ ] 현재 상태와 학습·배포 문서 갱신

완료 조건: 공개 사이트와 관리자 기능이 프로덕션에서 정상 동작한다.

## 공통 품질 기준

```bash
npm run lint
npm run type-check
npm run format:check
npm run build
```

Auth, RLS, Storage 변경은 성공 사례뿐 아니라 반드시 거부되어야 하는 요청도 테스트합니다. 비밀키, 서비스 역할 키, 개인정보가 Git diff와 브라우저 번들에 포함되지 않았는지 확인합니다.

## 문제 및 결정 기록

- 2026-09-09: Supabase URL과 공개키로 Auth API 응답을 확인했습니다.
- 2026-09-09: Google Provider는 아직 비활성 상태였습니다.
- 2026-09-09: Claude가 생성한 현재 DB 구조와 이후 작성된 관리자 기획의 본문·공개 상태 구조가 다르므로 Auth 구현 전에 조정하기로 했습니다.
- 2026-09-09: 전역 npm 경로가 잘못되어 일반 `npm run`은 실패했지만 프로젝트 내부 실행 파일을 사용한 네 가지 검사는 통과했습니다.
- 2026-09-10: DB 스키마 변경을 로컬 `supabase/migrations/*.sql` 파일로도 관리하기 시작했습니다 (Claude/Codex가 각자 MCP로 원격 DB를 직접 바꿔도 Git으로 추적되지 않던 문제를 해결).
- 2026-09-10: 1단계 RLS 허용·거부 검증을 REST API 실제 요청으로 완료했습니다. anon key로 published 글만 조회되고, draft/private은 응답에서 제외되며, INSERT/UPDATE/DELETE는 전부 실제로 반영되지 않는 것을 확인했습니다.
- 2026-09-10: `categories(content_type, slug)` unique 제약과 성능에 필요한 인덱스 3종(`publication_status`, `category_id`, `author_id` × projects/logs) 누락을 발견해 마이그레이션으로 추가했습니다.
- 2026-09-10: Google Cloud Console OAuth 클라이언트와 Supabase Provider 설정을 사용자가 완료했고, Auth Settings API로 `google: true`를 확인했습니다.
- 2026-09-10: Next.js 16에서 `middleware.ts`가 `proxy.ts`로 이름이 바뀐 것을 `node_modules/next/dist/docs`에서 확인하고 `src/proxy.ts`로 작성했습니다 (AGENTS.md의 "학습된 지식과 다를 수 있으니 문서를 먼저 읽으라"는 지침이 실제로 필요했던 사례).
- 2026-09-10: 관리자 판별은 이메일이나 `user_metadata`가 아니라 서버 전용 `ADMIN_USER_ID` 환경변수와 로그인한 사용자의 UUID를 비교하는 방식으로 구현했습니다. 실제 값은 사용자가 첫 로그인 후 UUID를 확인해 직접 채워야 합니다.
- 2026-09-12: 권한 체계를 `public.user_roles`(`admin`/`member`)로 전환했습니다. 새 Auth 사용자는 트리거로 기본 `member` 역할을 받고, 관리자 권한은 서버 코드와 RLS 모두 `public.is_admin()`으로 확인합니다.
- 2026-09-10: 관리자 UUID에 categories/projects/logs 전체 권한을 주는 RLS 정책을 마이그레이션으로 추가했고, 학습 기록 CRUD를 구현했습니다. Server Action에서도 관리자 UUID를 다시 검사합니다.
- 2026-09-11: Codex가 이력서 기반 프로젝트 8건을 시드하고 Projects 공개 페이지를 DB 조회로 전환했습니다 (`src/lib/projects-db.ts`).
- 2026-09-11: Log MDX 11개를 DB로 이전하고 공개 페이지를 DB 조회로 전환했습니다 (`src/lib/logs-db.ts`). 이 과정에서 `categories` 조인 결과를 배열로 잘못 가정한 버그(PostgREST는 다대일 관계를 객체로 반환)를 발견해 `logs-db.ts`와 `projects-db.ts` 양쪽 모두 수정했습니다.
