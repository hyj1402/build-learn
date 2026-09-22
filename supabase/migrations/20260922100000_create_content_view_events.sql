-- 공개 Log·Project 상세를 "언제 누가(익명 세션 단위로) 봤는지" 관리자만 볼 수 있는 방문 로그입니다.
-- 기존 view_count(총 조회수)와 달리 낱개 방문 기록을 남기므로, 시간대별 추이와 유입 경로를 볼 수 있습니다.
-- 이름·이메일·IP는 저장하지 않습니다. visitor_id는 브라우저 localStorage에 저장되는 임의의 UUID일 뿐이라,
-- 그 자체로는 실제 방문자를 특정할 수 없는 익명 값입니다.
create table "public"."content_view_events" (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('log', 'project')),
  slug text not null,
  -- 브라우저가 만들어 localStorage에 저장하는 임의 UUID. 같은 브라우저의 재방문을 구분하는 용도일 뿐,
  -- 로그인 계정이나 실제 신원과 연결되지 않습니다.
  visitor_id uuid not null,
  -- 유입 경로 파악용. 길이를 제한해 실수로 긴 값이 들어와도 저장 용량 문제가 생기지 않게 합니다.
  referrer text check (referrer is null or char_length(referrer) <= 300),
  created_at timestamptz not null default now()
);

create index content_view_events_type_slug_idx
  on "public"."content_view_events" (content_type, slug, created_at desc);
create index content_view_events_created_at_idx
  on "public"."content_view_events" (created_at desc);

alter table "public"."content_view_events" enable row level security;

-- 공개 상세 화면에서 누구나(로그인 여부 무관) 이벤트를 남길 수 있지만,
-- 실제로 공개(published) 상태인 글의 slug에만 남길 수 있도록 한 번 더 제한합니다.
create policy "anyone can log a view on published content"
  on "public"."content_view_events" for insert
  to anon, authenticated
  with check (
    (
      content_type = 'log'
      and exists (
        select 1 from public.logs
        where logs.slug = content_view_events.slug
          and logs.publication_status = 'published'
      )
    )
    or (
      content_type = 'project'
      and exists (
        select 1 from public.projects
        where projects.slug = content_view_events.slug
          and projects.publication_status = 'published'
      )
    )
  );

-- 방문 기록 조회·삭제는 관리자만 가능합니다. 방문자 본인도 이 기록을 볼 방법은 없습니다.
create policy "admin read content_view_events"
  on "public"."content_view_events" for select
  to authenticated
  using ((select public.is_admin()));

create policy "admin delete content_view_events"
  on "public"."content_view_events" for delete
  to authenticated
  using ((select public.is_admin()));
