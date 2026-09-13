-- 공개 Log 글에 로그인한 회원이 댓글을 남길 수 있게 합니다.
-- 회원가입 화면은 따로 만들지 않고, 이미 있는 Google/이메일 로그인으로 생기는 계정을 그대로 씁니다
-- (로그인만 하면 user_roles 트리거가 자동으로 'member' 역할을 만들어 줍니다).
create table public.log_comments (
  id uuid primary key default gen_random_uuid(),
  log_slug text not null references public.logs (slug) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  -- 이메일을 그대로 공개하지 않기 위해, 작성 시점의 표시 이름만 스냅샷으로 저장합니다.
  author_name text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index log_comments_log_slug_idx on public.log_comments (log_slug);

alter table public.log_comments enable row level security;

-- 공개된 글의 댓글은 누구나 읽을 수 있고, 관리자는 비공개 글의 댓글도 볼 수 있습니다.
create policy "read comments on published logs"
  on public.log_comments for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.logs
      where logs.slug = log_comments.log_slug
        and logs.publication_status = 'published'
    )
    or (select public.is_admin())
  );

-- 로그인한 회원은 공개된 글에만, 자기 계정으로만 댓글을 남길 수 있습니다.
create policy "members insert comments on published logs"
  on public.log_comments for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.logs
      where logs.slug = log_comments.log_slug
        and logs.publication_status = 'published'
    )
  );

-- 작성자 본인 또는 관리자만 댓글을 지울 수 있습니다. 수정 기능은 만들지 않습니다.
create policy "delete own comment or admin"
  on public.log_comments for delete
  to authenticated
  using (auth.uid() = author_id or (select public.is_admin()));
