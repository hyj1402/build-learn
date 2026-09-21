-- 프로젝트/로그 상세 조회수를 기록하기 위한 컬럼
alter table public.projects add column view_count integer not null default 0;
alter table public.logs add column view_count integer not null default 0;

-- 방문자(anon)가 조회수만 늘릴 수 있도록 RLS를 우회하는 좁은 범위의 SECURITY DEFINER 함수.
-- 공개(published) 글만 대상으로 하고, view_count 외의 컬럼은 절대 건드리지 않습니다.
create or replace function public.increment_project_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.projects
  set view_count = view_count + 1
  where slug = p_slug and publication_status = 'published';
$$;

create or replace function public.increment_log_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.logs
  set view_count = view_count + 1
  where slug = p_slug and publication_status = 'published';
$$;

revoke all on function public.increment_project_view(text) from public;
revoke all on function public.increment_log_view(text) from public;
grant execute on function public.increment_project_view(text) to anon, authenticated;
grant execute on function public.increment_log_view(text) to anon, authenticated;
