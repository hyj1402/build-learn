# 프로젝트 현재 상태

## 목적

BUILD & LEARN은 만든 결과와 개발 과정에서 배운 내용을 함께 기록하는 개인 개발 아카이브입니다.

## 완료된 기반

- Next.js 16 기반 App Router 프로젝트
- MDX 기반 Project 및 Log 콘텐츠 관리
- 검색, 카테고리 및 태그 필터
- 프로젝트 데모의 링크, 임베드, 다운로드 표시
- metadata, robots.txt, sitemap.xml 구성
- GitHub 저장소와 Vercel 배포 연결
- 배포 주소: https://build-learn-five.vercel.app/

## Supabase 연결 상태 (2026-09-11 기준)

DB·로그인·관리자 기능 도입을 시작했습니다. 자세한 설계는 `docs/planning/SUPABASE_ADMIN_PLAN.md`를 참고합니다.

- 완료: Supabase 프로젝트 연결, `categories`/`projects`/`logs` 테이블과 RLS 정책 생성, `@supabase/supabase-js`·`@supabase/ssr` 설치와 브라우저/서버 클라이언트 코드(`src/lib/supabase/`) 추가
- 완료: Google OAuth 로그인, 이메일·비밀번호 로그인 화면, 세션 갱신, UUID 기반 관리자 판별
- 완료: `/admin` 학습 기록(Log) 작성·수정·삭제·공개 상태 관리 화면과 관리자 RLS 정책
- 완료: **공개 사이트가 이제 MDX가 아니라 DB를 읽습니다.** Home, Projects 목록/상세, Log 목록/상세가 모두 `public.projects`/`public.logs`의 `published` 행을 조회합니다 (`src/lib/projects-db.ts`, `src/lib/logs-db.ts`). 기존 MDX 파일(`src/content/`)은 이전 데이터를 그대로 옮긴 뒤 삭제하지 않고 백업으로 남겨뒀습니다.
- 완료: `/admin/projects`의 프로젝트 목록·작성·수정·삭제, 공개/진행 상태·기술 스택·기간·대표 노출 관리
- 완료: Contact 폼이 `contact_messages` 테이블에 실제로 저장되고, `/admin/messages` 수신함에서 확인·읽음 처리·삭제할 수 있습니다 (이메일 발송 대신 DB 보관 방식)
- 아직 없음: 카테고리 관리, 리치 텍스트 에디터, 이미지 업로드, 새 문의 이메일 알림

## 현재 제약

- Contact 문의는 DB에 저장되며 관리자 수신함에서 확인합니다. 새 문의가 왔을 때의 이메일 알림은 아직 없습니다.
- 관리자 글쓰기는 아직 일반 텍스트(Markdown)이며 리치 텍스트 에디터·이미지 업로드는 없습니다.
- 방문 통계, 댓글, 좋아요, 조회수 기능은 없습니다.

## 다음 작업 후보

1. 카테고리 관리와 프로젝트 대표 이미지 업로드 추가
2. TipTap 리치 텍스트 에디터와 관리자 이미지 업로드 구현
3. 로컬 검증이 끝난 MDX → DB 전환을 프로덕션(Vercel)에서도 재확인 후 기존 MDX 파일 보관/삭제 결정
4. 새 문의 이메일 알림(Resend 등) 연결 검토

작업이 완료되거나 프로젝트 범위가 바뀌면 이 문서를 함께 갱신합니다.
