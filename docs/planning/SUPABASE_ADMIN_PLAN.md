# BUILD & LEARN — Supabase·관리자 기능 기획

> 새 작업이나 새 채팅에서는 이 문서를 먼저 읽고 현재 결정 사항과 작업 순서를 확인합니다.

> **2026-09-13 현재 기준:** 이 문서는 최초 도입 시의 제품 기획과 결정 배경을 보존합니다. 현재 구현 범위와 활성 작업은 `PROJECT_STATUS.md` 및 `SUPABASE_EXECUTION_PLAN.md`를 우선합니다. 아래의 “현재 확인된 상태”, “구현 순서”, “다음 채팅”은 역사 기록으로만 읽습니다.

## 현재 설계 기준

- 공개 Project·Log는 Supabase의 `published` 데이터를 조회하고, 기존 MDX는 이전 원본·호환성 확인용 백업으로 보존합니다.
- 관리자 권한은 UUID 직접 비교가 아니라 `public.user_roles`와 `public.is_admin()`으로 확인합니다.
- 현재 편집기는 TipTap을 사용하고, 본문은 기존 콘텐츠 호환성을 위해 Markdown `body_text`로 저장합니다. `body_json`은 확정된 구현이 아닙니다.
- 대표·본문 이미지는 `content-images` Storage 버킷을 통해 관리자만 업로드합니다.
- Contact는 DB 수신함이 기본이며, Resend 알림과 Claude 다이제스트는 환경변수가 있을 때만 동작하는 선택 기능입니다.
- 카테고리 관리 UI, 고급 TipTap 블록, 자동 수집, 관리자 승격 절차는 후속 결정 항목입니다.

## 1. 프로젝트 개요

- 프로젝트 위치: `C:\homeProject\build-learn`
- 저장소: `https://github.com/hyj1402/build-learn.git`
- 배포 사이트: `https://build-learn-five.vercel.app/`
- 기술 구성: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, MDX
- 목적: 만든 프로젝트와 학습 과정을 함께 기록하는 개인 개발 아카이브

현재 콘텐츠는 `src/content/projects`, `src/content/logs`의 MDX 파일로 관리한다. 앞으로 운영자가 브라우저에서 직접 글을 작성하고 이미지도 올릴 수 있도록 Supabase DB, Auth, Storage와 관리자 화면을 도입한다.

## 2. 최초 기획 당시 확인된 상태 (역사 기록)

2026-09-09 로컬 저장소 점검 기준:

- Supabase 외부 프로젝트 또는 도구 연결은 별도로 생성되었을 수 있다.
- 기존 Next.js 저장소에는 아직 Supabase 클라이언트 패키지와 연결 코드가 없다.
- `.env.local` 및 Supabase 환경변수가 없다.
- DB 조회·저장 코드와 관리자 화면이 없다.
- `.gitignore`는 `.env*`를 제외하므로 로컬 환경변수 파일이 Git에 올라가지 않도록 설정되어 있다.
- 기존 MDX 콘텐츠는 프로젝트 6개, 학습 기록 10개로 총 16개다.
- 일부 학습 기록은 일반 Markdown 외에 `<Callout>`과 `<InputBox>` MDX 컴포넌트를 사용한다.

따라서 "Supabase 프로젝트 생성/도구 연결"과 "기존 웹 애플리케이션 연결"을 구분해야 한다. 구현을 시작할 때 실제 Supabase 프로젝트 URL, publishable key, 프로젝트 접근 권한을 다시 확인한다.

## 3. 확정 요구사항

### 사용자와 로그인

- Google OAuth 2.0 로그인을 사용한다.
- 현재 콘텐츠 관리자는 소유자 한 명뿐이다.
- 향후 일반 사용자 로그인과 게시판·문의 기능을 추가할 수 있어야 한다.
- 로그인 성공만으로 관리자 권한을 주지 않는다.
- 관리자 권한은 이메일 문자열이나 사용자가 바꿀 수 있는 `user_metadata`가 아니라 고정된 사용자 UUID 또는 안전한 `app_metadata`를 기준으로 판별한다.

### 콘텐츠 종류

- 1차 범위는 `프로젝트`와 `학습 기록`이다.
- 카테고리는 앞으로 관리자 화면에서 추가·수정할 수 있어야 한다.
- 추후 게시판 등 새로운 콘텐츠 종류를 추가할 수 있어야 한다.
- 프로젝트 전용 필드와 학습 기록 필드를 무리하게 한 테이블에 섞지 않는다.

### 공개 상태

콘텐츠의 `publication_status`는 세 가지다.

| 값          | 의미                          | 공개 범위   |
| ----------- | ----------------------------- | ----------- |
| `draft`     | 작성 중인 임시저장 글         | 관리자만    |
| `private`   | 작성은 완료했지만 비공개인 글 | 관리자만    |
| `published` | 발행된 글                     | 모든 방문자 |

프로젝트 자체의 진행 상태인 `planned`, `in_progress`, `completed`, `archived` 등은 `project_status`라는 별도 필드로 둔다. 공개 상태와 프로젝트 진행 상태를 하나의 `status`에 섞지 않는다.

### 글 작성 방식

- VS Code나 파일을 열지 않고 `/admin`의 브라우저 화면에서 작성한다.
- Markdown 문법을 직접 입력하는 에디터보다 일반 문서 편집기처럼 쓰는 리치 텍스트 에디터를 우선한다.
- 1차 후보는 TipTap이다.
- 본문 원본은 HTML 문자열만 저장하지 않고 구조화된 JSON(`jsonb`)으로 저장한다.
- 검색, 미리보기, 접근성 처리를 위해 순수 텍스트도 별도 생성할 수 있다.
- 제목, 요약, 카테고리, 태그, 공개 상태 등은 에디터 본문과 분리된 입력 필드로 관리한다.
- 표, 링크, 목록, 인용, 코드 블록, 이미지, Callout을 지원 대상으로 검토한다.

### 이미지

- 현재는 관리자만 콘텐츠 이미지를 업로드할 수 있다.
- 이미지는 Supabase Storage에 저장한다.
- 향후 일반 사용자 업로드와 섞이지 않도록 저장 영역을 분리한다.

예상 버킷 또는 경로:

- `content-images`: 관리자 콘텐츠 이미지
- `user-uploads`: 향후 게시판 사용자 이미지
- `inquiry-files`: 향후 문의 첨부파일

비공개 콘텐츠의 이미지는 단순 공개 URL만으로 노출되지 않도록 공개/비공개 버킷 정책과 signed URL 사용 여부를 구현 전에 확정한다.

### 기존 콘텐츠 이전

- 기존 MDX 글 16개를 모두 DB로 이전한다.
- 기존 slug와 공개 URL을 유지한다.
- DB 전환과 Vercel 검증이 끝날 때까지 MDX 원본을 삭제하지 않는다.
- 일반 Markdown 요소는 에디터 JSON으로 자동 변환한다.
- `<Callout>`과 `<InputBox>`가 들어간 글은 전용 에디터 블록으로 변환하거나 수동 검수한다.
- DB 조회 전환 후 목록, 상세 페이지, 검색, 필터, metadata, sitemap이 이전과 동일하게 동작하는지 확인한다.

## 4. 권장 데이터 구조

아래 구조는 구현 전 검토용 초안이다. 실제 SQL은 Supabase 최신 문서와 프로젝트 상태를 확인한 뒤 마이그레이션으로 확정한다.

### `projects`

- `id`: UUID 기본 키
- `slug`: 고유 URL 식별자
- `title`, `summary`
- `body_json`: TipTap 본문 JSON
- `body_text`: 검색용 순수 텍스트
- `thumbnail_path`
- `publication_status`
- `project_status`
- `tech_stack`
- `period_start`, `period_end`
- `demo_type`, `demo_url`, `download_url`
- `is_featured`
- `author_id`: `auth.users.id` 참조
- `created_at`, `updated_at`, `published_at`

### `logs`

- `id`: UUID 기본 키
- `slug`: 고유 URL 식별자
- `title`, `summary`
- `body_json`, `body_text`
- `thumbnail_path`
- `publication_status`
- `author_id`
- `display_order`: 기존 `order` 이전용
- `created_at`, `updated_at`, `published_at`

### `categories`

- `id`: UUID 기본 키
- `name`, `slug`
- `content_type`: 현재는 `project` 또는 `log`
- `display_order`, `is_active`

카테고리를 DB 행으로 관리하면 새 카테고리를 추가할 때 코드를 다시 배포하지 않아도 된다. 새로운 콘텐츠 종류가 추가될 때는 해당 종류의 전용 테이블을 추가하고 카테고리 범위를 확장한다.

### 태그

초기에는 문자열 배열로 단순하게 시작할 수 있지만, 관리자 화면에서 태그 병합·이름 변경·집계를 제공하려면 `tags`와 연결 테이블을 사용한다. 구현 전에 실제 관리 요구 수준을 보고 확정한다.

## 5. 관리자 화면 범위

예상 경로:

- `/admin/login`: Google 로그인
- `/admin`: 콘텐츠 현황 대시보드
- `/admin/projects`: 프로젝트 목록과 상태 필터
- `/admin/projects/new`: 프로젝트 작성
- `/admin/projects/[id]/edit`: 프로젝트 수정
- `/admin/logs`: 학습 기록 목록과 상태 필터
- `/admin/logs/new`: 학습 기록 작성
- `/admin/logs/[id]/edit`: 학습 기록 수정
- `/admin/categories`: 카테고리 관리

1차 관리자 기능:

- 작성, 수정, 삭제
- 임시저장, 비공개 저장, 공개 발행
- 미리보기
- slug 중복 확인
- 카테고리와 태그 선택
- 이미지 업로드 및 본문 삽입
- 저장되지 않은 변경 이탈 경고
- 저장/발행 오류 표시

자동 저장과 변경 이력은 1차 필수 범위에서 제외하고 이후 필요에 따라 추가한다.

## 6. 권한과 보안 원칙

- `public` 등 Data API에 노출되는 모든 테이블에 RLS를 활성화한다.
- 익명 사용자는 `published` 행만 조회할 수 있다.
- 일반 로그인 사용자는 관리자 콘텐츠를 작성·수정·삭제할 수 없다.
- 관리자만 프로젝트, 학습 기록, 카테고리를 생성·수정·삭제할 수 있다.
- `TO authenticated`만 사용하는 정책은 관리자 권한 검사가 아니므로 사용하지 않는다.
- UPDATE 정책에는 `USING`과 `WITH CHECK`를 모두 둔다.
- 관리자 판별에 사용자가 수정 가능한 `user_metadata`를 사용하지 않는다.
- `service_role` 또는 secret key는 브라우저와 `NEXT_PUBLIC_*` 환경변수에 절대 넣지 않는다.
- 프런트엔드에는 Supabase publishable key만 사용한다.
- Storage 업로드, 조회, 수정, 삭제 정책을 DB RLS와 별도로 설정한다.
- Storage 파일 교체(upsert)가 필요하면 INSERT뿐 아니라 SELECT와 UPDATE 권한도 함께 검토한다.
- Vercel 환경변수와 로컬 `.env.local`을 별도로 설정하며 비밀값은 Git에 커밋하지 않는다.

## 7. 최초 구현 순서 (역사 기록)

### 0단계 — 연결 확인

1. 연결된 Supabase 프로젝트 식별
2. Supabase 도구/MCP 연결과 로그인 상태 확인
3. 프로젝트 URL과 publishable key 확보
4. Google OAuth Provider 및 리디렉션 URL 계획
5. Supabase 변경 로그와 최신 Next.js SSR/Auth 문서 확인

### 1단계 — DB와 보안

1. 스키마 초안 검토
2. 테이블, 타입, 인덱스 생성
3. RLS와 GRANT 설정
4. 관리자 권한 기준 설정
5. DB 보안·성능 Advisor 확인
6. 정상/비정상 권한 테스트

### 2단계 — Next.js 연결과 Auth

1. `@supabase/supabase-js`, `@supabase/ssr` 설치 및 버전 고정
2. 브라우저/서버 Supabase 클라이언트 구성
3. Google 로그인과 콜백 처리
4. 관리자 Route 보호
5. 비관리자 접근 차단 검증

### 3단계 — 관리자 CRUD와 에디터

1. 프로젝트 관리 화면
2. 학습 기록 관리 화면
3. TipTap 에디터와 JSON 저장/렌더링
4. draft/private/published 처리
5. 카테고리 관리
6. 이미지 업로드

### 4단계 — MDX 이전

1. MDX frontmatter와 본문 변환 스크립트 작성
2. 16개 콘텐츠 시험 이전
3. slug, 날짜, 정렬, 카테고리, 태그 확인
4. Callout/InputBox 변환 및 수동 검수
5. 중복 실행 시 데이터가 복제되지 않도록 이전 절차 설계

### 5단계 — 공개 사이트 전환

1. 목록과 상세 데이터 소스를 DB로 변경
2. 공개 글만 노출되는지 확인
3. 검색·필터·metadata·sitemap 확인
4. 로컬 품질 검사와 프로덕션 빌드
5. Vercel 환경변수 설정 및 배포
6. 운영 검증 후 기존 MDX 보관 또는 삭제

## 8. 완료 조건

- 본인 Google 계정만 관리자 화면에 접근한다.
- 일반 방문자는 공개 글만 볼 수 있다.
- 임시저장과 비공개 글은 URL을 알아도 일반 사용자에게 노출되지 않는다.
- 관리자 화면에서 프로젝트와 학습 기록을 작성·수정·삭제할 수 있다.
- 카테고리를 코드 수정 없이 추가할 수 있다.
- 관리자만 이미지를 업로드할 수 있다.
- 기존 16개 글의 URL과 주요 데이터가 유지된다.
- 특수 MDX 블록이 누락되거나 깨지지 않는다.
- lint, type-check, format-check, build가 모두 통과한다.
- RLS, Storage 정책, 노출 키를 검토하고 실제 허용/거부 요청으로 검증한다.
- Vercel 배포 후 공개·비공개·관리자 흐름을 확인한다.

## 9. 최초 기획에서 남긴 미결정 사항 (역사 기록)

- 실제로 연결된 Supabase 프로젝트 ID와 리전
- 관리자 사용자 UUID 또는 `app_metadata` 설정 방법
- TipTap 확장 목록과 Callout/InputBox 편집 UI
- 비공개 이미지의 버킷 및 signed URL 정책
- 태그를 배열로 시작할지 별도 테이블로 정규화할지
- 글 삭제를 즉시 삭제로 할지 휴지통(soft delete)으로 할지
- 자동 저장과 수정 이력의 도입 시점

## 10. 최초 기획 당시의 다음 채팅 예시 (역사 기록)

다음과 같이 요청하면 된다.

> `docs/planning/SUPABASE_ADMIN_PLAN.md`를 먼저 읽고 현재 코드와 Supabase 연결 상태를 다시 확인해줘. 아직 구현하지 말고, 0단계 연결 확인 결과와 실제 DB 스키마/RLS 초안을 제시해줘.

실제 구현까지 바로 진행하려면 다음처럼 요청한다.

> `docs/planning/SUPABASE_ADMIN_PLAN.md`를 읽고 0~1단계인 Supabase 연결 확인, DB 스키마, RLS 구현과 검증까지 진행해줘. 기존 공개 사이트와 MDX 파일은 아직 삭제하거나 전환하지 마.
