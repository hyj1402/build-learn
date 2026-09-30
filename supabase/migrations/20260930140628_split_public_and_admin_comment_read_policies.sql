-- is_admin()은 authenticated 역할만 실행할 수 있으므로, anon도 사용하는 공개 읽기 정책에서 호출하면 안 됩니다.
-- 공개 댓글 조회와 관리자 삭제 원문 조회를 역할별 정책으로 분리해 최소 권한과 기존 기능을 함께 유지합니다.

drop policy if exists "read active comments on published logs" on public.log_comments;

create policy "read active comments on published logs"
  on public.log_comments for select
  to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.logs
      where logs.slug = log_comments.log_slug
        and logs.publication_status = 'published'
    )
  );

create policy "admin read all log comments"
  on public.log_comments for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "read active comments on published projects" on public.project_comments;

create policy "read active comments on published projects"
  on public.project_comments for select
  to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.projects
      where projects.slug = project_comments.project_slug
        and projects.publication_status = 'published'
    )
  );

create policy "admin read all project comments"
  on public.project_comments for select
  to authenticated
  using ((select public.is_admin()));
