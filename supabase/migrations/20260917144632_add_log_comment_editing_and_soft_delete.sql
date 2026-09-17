-- 작성 뒤 실제로 고친 시점과, 일반 사용자에게 숨길 삭제 시점을 분리해 보관합니다.
alter table public.log_comments
  add column updated_at timestamptz,
  add column deleted_at timestamptz;

-- 댓글의 소속 글·작성자·작성 시각은 수정으로 바꾸지 못하게 하고, 본문·삭제 상태가 바뀔 때만 수정 시각을 남깁니다.
create or replace function public.set_log_comment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.log_slug is distinct from old.log_slug
    or new.author_id is distinct from old.author_id
    or new.author_name is distinct from old.author_name
    or new.created_at is distinct from old.created_at then
    raise exception '댓글의 글·작성자·작성 시각은 변경할 수 없습니다.' using errcode = '42501';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_log_comment_updated_at on public.log_comments;
create trigger set_log_comment_updated_at
  before update on public.log_comments
  for each row execute function public.set_log_comment_updated_at();

-- 삭제된 댓글은 일반 공개 조회에서 제외하고, 관리자는 삭제 여부와 관계없이 모두 확인합니다.
drop policy if exists "read comments on published logs" on public.log_comments;
create policy "read active comments on published logs"
  on public.log_comments for select
  to anon, authenticated
  using (
    (
      deleted_at is null
      and exists (
        select 1 from public.logs
        where logs.slug = log_comments.log_slug
          and logs.publication_status = 'published'
      )
    )
    or (select public.is_admin())
  );

-- 물리 DELETE를 없애고 UPDATE로 삭제 시각을 기록합니다. 일반 회원은 본인 활성 댓글만,
-- 관리자는 모든 댓글(삭제된 댓글 포함)을 수정·삭제·복구할 수 있습니다.
drop policy if exists "delete own comment or admin" on public.log_comments;
create policy "update own active comment or admin"
  on public.log_comments for update
  to authenticated
  using (
    (deleted_at is null and (select auth.uid()) = author_id)
    or (select public.is_admin())
  )
  with check (
    (select auth.uid()) = author_id
    or (select public.is_admin())
  );
