-- 외부 기술 블로그(당근/토스/배민/네이버 D2)의 RSS를 모아두는 "수집함"입니다.
-- 원문을 그대로 옮겨 발행하지 않고, 제목·링크·요약만 보관해 관리자가 검토 후
-- 직접 쓴 학습 기록(Log)의 초안 재료로만 사용합니다 (저작권 문제 회피).
-- 방문자에게 노출되는 데이터가 아니라 관리자 전용 내부 도구라 공개 조회 정책은 두지 않습니다.

create table if not exists "public"."tech_sources" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  site_url text not null,
  feed_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists "public"."tech_articles" (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references "public"."tech_sources" (id) on delete cascade,
  title text not null,
  -- 같은 글을 여러 번 수집해도 중복 저장되지 않도록 원문 URL을 고유값으로 둡니다.
  url text not null unique,
  summary text,
  published_at timestamptz,
  -- new: 아직 안 봄 / drafted: 학습 기록 초안을 만듦 / dismissed: 관심 없음으로 치움
  status text not null default 'new' check (status in ('new', 'drafted', 'dismissed')),
  fetched_at timestamptz not null default now()
);

create index if not exists tech_articles_source_id_idx on "public"."tech_articles" (source_id);
create index if not exists tech_articles_status_idx on "public"."tech_articles" (status);
create index if not exists tech_articles_published_at_idx on "public"."tech_articles" (published_at desc);

alter table "public"."tech_sources" enable row level security;
alter table "public"."tech_articles" enable row level security;

create policy "admin full access tech_sources"
  on "public"."tech_sources" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access tech_articles"
  on "public"."tech_articles" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into "public"."tech_sources" (name, slug, site_url, feed_url) values
  ('당근 (Medium)', 'daangn', 'https://medium.com/daangn', 'https://medium.com/feed/daangn'),
  ('우아한형제들 기술블로그', 'baemin', 'https://techblog.woowahan.com', 'https://techblog.woowahan.com/feed/'),
  ('토스 기술 블로그', 'toss', 'https://toss.tech', 'https://toss.tech/rss.xml'),
  ('네이버 D2', 'naver-d2', 'https://d2.naver.com', 'https://d2.naver.com/d2.atom')
on conflict (slug) do nothing;
