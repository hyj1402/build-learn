-- 댓글 작성자 조건을 쿼리마다 한 번만 계산하게 해 RLS의 행별 함수 호출을 줄입니다.
drop policy if exists "members insert comments on published logs" on public.log_comments;
create policy "members insert comments on published logs"
  on public.log_comments for insert
  to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.logs
      where logs.slug = log_comments.log_slug
        and logs.publication_status = 'published'
    )
  );

drop policy if exists "delete own comment or admin" on public.log_comments;
create policy "delete own comment or admin"
  on public.log_comments for delete
  to authenticated
  using ((select auth.uid()) = author_id or (select public.is_admin()));

-- 사용자 삭제 시 연결 댓글을 찾거나 작성자별 댓글을 관리할 때 FK 전체 검색을 피합니다.
create index if not exists log_comments_author_id_idx on public.log_comments (author_id);
