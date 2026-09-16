# 프로젝트 현재 상태

## 목적

BUILD & LEARN은 만든 결과와 개발 과정에서 배운 내용을 함께 기록하는 개인 개발 아카이브입니다.

## 현재 구현 상태 (2026-09-13)

- Next.js 16 기반 App Router 프로젝트
- 기존 MDX 기반 콘텐츠 구조와 공개 URL 보존
- 검색, 카테고리 및 태그 필터
- 프로젝트 데모의 링크, 임베드, 다운로드 표시
- metadata, robots.txt, sitemap.xml 구성
- GitHub 품질 검사와 Vercel 배포 연결
- 다크 모드: 시스템 설정 자동 감지 + 토글(자동/라이트/다크), 선택값 localStorage 저장, 첫 렌더 전 적용해 깜빡임 방지. 토글 버튼은 헤더가 아니라 **관리자 사이드바 하단**(로그아웃 버튼 옆)에 있습니다 — 실제로 쓰는 사람이 사이트 소유자뿐이라는 판단
- 공개 헤더: 로그아웃 상태면 "로그인" 링크, 로그인 상태면 `user_roles`를 직접 조회해 role이 `admin`일 때만 "Admin" 링크 표시(`AuthNavLink`). 이전에는 로그인만 했으면(일반 회원도) Admin 링크가 보이는 문제가 있어 수정함 — `/admin` 서버 쪽 차단은 항상 유지되고 있었음
- 배포 주소: https://build-learn-five.vercel.app/

## Supabase·관리자 기능

자세한 설계 결정은 `docs/planning/SUPABASE_ADMIN_PLAN.md`, 남은 실행 항목은 `docs/planning/SUPABASE_EXECUTION_PLAN.md`에서 관리합니다.

- 완료: Supabase 프로젝트 연결, `categories`/`projects`/`logs` 테이블과 RLS 정책 생성, `@supabase/supabase-js`·`@supabase/ssr` 설치와 브라우저/서버 클라이언트 코드(`src/lib/supabase/`) 추가
- 완료: Google OAuth·이메일/비밀번호 로그인, 세션 갱신, `user_roles` 역할 기반 관리자 판별
- 완료: `/admin`의 Project·Log 작성·수정·삭제, 공개/비공개/임시저장과 프로젝트 진행 상태 관리
- 완료: **공개 사이트가 이제 MDX가 아니라 DB를 읽습니다.** Home, Projects 목록/상세, Log 목록/상세가 모두 `public.projects`/`public.logs`의 `published` 행을 조회합니다 (`src/lib/projects-db.ts`, `src/lib/logs-db.ts`). 기존 MDX 파일(`src/content/`)은 이전 데이터를 그대로 옮긴 뒤 삭제하지 않고 백업으로 남겨뒀습니다.
- 완료: `/admin/projects`의 프로젝트 목록·작성·수정·삭제, 공개/진행 상태·기술 스택·기간·대표 노출 관리
- 완료: TipTap 기반 Markdown 호환 에디터, 대표·본문 이미지 업로드(WebP 최적화), Storage 파일 관리
- 완료: Contact 폼의 DB 저장·스팸 방지·관리자 수신함·읽음/일괄 처리·삭제·Excel 다운로드
- 완료: Resend 새 문의 알림 코드. 환경변수가 비어 있으면 알림만 건너뜁니다.
- 완료: Tech Radar RSS 수동 수집, 목록 페이지네이션, Claude 기반 일일 다이제스트 초안 생성
- 완료: About 페이지 커리어 타임라인을 공개 Projects 데이터(제목·기간·기술 스택)로 자동 구성, Contact의 이메일·GitHub 링크 재사용
- 완료: Log 게시글 회원 댓글(`log_comments` 테이블·RLS) — 누구나 공개 글 댓글 조회, 로그인한 회원(Google/이메일 로그인 시 자동 생성되는 `user_roles` 'member' 행)만 자신의 댓글 작성, 작성자 또는 관리자만 삭제
- 아직 없음: 카테고리 관리 UI, Tech Radar 자동 수집/다이제스트 실행, 방문 통계·좋아요·조회수

## 현재 제약

- Resend 알림은 `RESEND_API_KEY`, `CONTACT_NOTIFY_TO`, `CONTACT_NOTIFY_FROM`을 로컬·Vercel에 설정해야 실제 발송됩니다.
- Claude 다이제스트는 `ANTHROPIC_API_KEY`가 있어야 실제 생성·품질·비용을 검증할 수 있습니다.
- 공개·관리자·비공개 콘텐츠 흐름은 로컬 검증을 마쳤지만, 현재 배포본에서의 회귀 검증이 남아 있습니다.

## 다음 작업 후보

1. Vercel에서 로그인·관리자·공개/비공개·댓글 작성/삭제·다크 모드·sitemap·모바일 흐름을 운영 검증하고 MDX 보관 정책 결정
2. Resend·Claude 환경변수를 설정한 뒤 실제 이메일 알림과 일일 다이제스트를 검증
3. 카테고리 관리 UI와 콘텐츠 미리보기/이탈 경고의 필요 범위를 결정
4. Tech Radar 자동 수집/다이제스트 실행(Cron 또는 GitHub Actions)을 설계

작업이 완료되거나 프로젝트 범위가 바뀌면 이 문서를 함께 갱신합니다.
