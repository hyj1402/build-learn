-- 베이스라인 마이그레이션입니다.
-- 지금까지 Claude/Codex가 Supabase MCP로 원격 DB에 직접 적용해온 변경 내용을
-- 이 시점의 실제 상태 그대로 옮겨 적은 파일입니다 (2026-09-09 기준 원격 DB 실제 조회 결과).
-- 이 파일 자체를 지금 프로젝트 DB에 다시 실행할 필요는 없습니다 (이미 적용되어 있음).
-- 앞으로 스키마를 바꿀 때는 이 파일을 수정하지 말고, 새 마이그레이션 파일을 이 폴더에 추가합니다.

-- =========================================================
-- categories: 프로젝트/학습 기록 공통 카테고리 (코드 재배포 없이 관리자 화면에서 추가/수정 가능하도록 DB 행으로 관리)
-- =========================================================
create table if not exists "public"."categories" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  content_type text not null check (content_type in ('project', 'log')),
  -- 같은 slug라도 project용/log용 카테고리는 따로 존재할 수 있어 두 컬럼을 묶어 unique로 둡니다.
  unique (content_type, slug),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- projects
-- =========================================================
create table if not exists "public"."projects" (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  -- TipTap 리치 에디터가 저장하는 구조화된 본문 (JSON)
  body_json jsonb not null default '{}'::jsonb,
  -- 검색·미리보기용으로 body_json에서 뽑아낸 순수 텍스트
  body_text text not null default '',
  thumbnail_path text,
  -- 카테고리나 작성자가 삭제되어도 글 자체는 남도록 참조만 비웁니다 (on delete set null)
  category_id uuid references "public"."categories" (id) on delete set null,
  -- 글 자체의 공개 여부: draft(임시저장, 관리자만) / private(비공개, 관리자만) / published(공개)
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'private', 'published')),
  -- 프로젝트 진행 상태: publication_status와 별개 개념 (진행 중이지만 공개된 글도 가능)
  project_status text not null
    check (project_status in ('planned', 'in_progress', 'completed', 'archived')),
  tech_stack text[] not null default '{}',
  period_start text,
  period_end text,
  demo_type text check (demo_type in ('embed', 'link', 'download')),
  demo_url text,
  download_url text,
  is_featured boolean not null default false,
  -- 작성자: Supabase Auth의 auth.users를 참조 (관리자 판별에 사용)
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- =========================================================
-- logs
-- =========================================================
create table if not exists "public"."logs" (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body_json jsonb not null default '{}'::jsonb,
  body_text text not null default '',
  thumbnail_path text,
  category_id uuid references "public"."categories" (id) on delete set null,
  tags text[] not null default '{}',
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'private', 'published')),
  author_id uuid references auth.users (id) on delete set null,
  -- 같은 날짜 글의 노출 순서를 정하기 위한 값 (기존 MDX의 order 대체)
  display_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- =========================================================
-- Row Level Security
-- 방문자(anon/authenticated)는 공개된 행만 조회 가능. 쓰기 정책은 아직 없음
-- (= 관리자 기능을 만들기 전까지는 service role 키로만 쓰기 가능).
-- =========================================================
alter table "public"."categories" enable row level security;
alter table "public"."projects" enable row level security;
alter table "public"."logs" enable row level security;

create policy "public read active categories"
  on "public"."categories" for select
  to anon, authenticated
  using (is_active = true);

create policy "public read published projects"
  on "public"."projects" for select
  to anon, authenticated
  using (publication_status = 'published');

create policy "public read published logs"
  on "public"."logs" for select
  to anon, authenticated
  using (publication_status = 'published');
