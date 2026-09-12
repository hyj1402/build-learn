-- 기존 UUID 직접 비교 정책을 public.is_admin() 역할 확인으로 교체합니다.
-- 이 마이그레이션은 이미 운영 DB에 생성된 정책도 같은 규칙으로 맞춥니다.
drop policy if exists "admin full access categories" on public.categories;
drop policy if exists "admin full access projects" on public.projects;
drop policy if exists "admin full access logs" on public.logs;
drop policy if exists "admin manages contact messages" on public.contact_messages;
drop policy if exists "admin manage content images" on storage.objects;

create policy "admin full access categories"
  on public.categories for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access projects"
  on public.projects for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access logs"
  on public.logs for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin manages contact messages"
  on public.contact_messages for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin manage content images"
  on storage.objects for all to authenticated
  using (bucket_id = 'content-images' and (select public.is_admin()))
  with check (bucket_id = 'content-images' and (select public.is_admin()));
