-- Project와 Log 댓글을 섞지 않아, 나중에 콘텐츠별 통계·정책을 독립적으로 관리할 수 있게 합니다.
create table public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null references public.projects (slug) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  -- 이메일 대신 작성 시점의 표시 이름만 저장합니다.
  author_name text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create index project_comments_project_slug_idx on public.project_comments (project_slug);
create index project_comments_author_id_idx on public.project_comments (author_id);

-- 새 public 테이블은 Data API에 자동 공개되지 않을 수 있어, 필요한 역할에만 권한을 명시합니다.
grant select on public.project_comments to anon;
grant select, insert, update, delete on public.project_comments to authenticated;
grant select, insert, update, delete on public.project_comments to service_role;

alter table public.project_comments enable row level security;

-- 소속 Project·작성자·작성 시각은 API를 직접 호출해도 바꿀 수 없고, 실제 변경 때만 수정 시각을 남깁니다.
create function public.set_project_comment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_slug is distinct from old.project_slug
    or new.author_id is distinct from old.author_id
    or new.author_name is distinct from old.author_name
    or new.created_at is distinct from old.created_at then
    raise exception '댓글의 글·작성자·작성 시각은 변경할 수 없습니다.' using errcode = '42501';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create trigger set_project_comment_updated_at
  before update on public.project_comments
  for each row execute function public.set_project_comment_updated_at();

-- 일반 방문자는 공개 Project의 활성 댓글만 읽고, 관리자는 삭제된 원문과 비공개 Project 댓글도 확인합니다.
create policy "read active comments on published projects"
  on public.project_comments for select
  to anon, authenticated
  using (
    (
      deleted_at is null
      and exists (
        select 1 from public.projects
        where projects.slug = project_comments.project_slug
          and projects.publication_status = 'published'
      )
    )
    or (select public.is_admin())
  );

-- 로그인한 회원은 공개 Project에 자기 계정의 댓글만 작성합니다.
create policy "members insert comments on published projects"
  on public.project_comments for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.projects
      where projects.slug = project_comments.project_slug
        and projects.publication_status = 'published'
    )
  );

-- 물리 삭제는 허용하지 않고, 일반 회원은 자기 활성 댓글만, 관리자는 모든 댓글을 수정·삭제·복구합니다.
create policy "update own active project comment or admin"
  on public.project_comments for update
  to authenticated
  using (
    (deleted_at is null and (select auth.uid()) = author_id)
    or (select public.is_admin())
  )
  with check (
    (select auth.uid()) = author_id
    or (select public.is_admin())
  );
