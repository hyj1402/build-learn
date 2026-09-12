-- 관리자 역할에게 categories/projects/logs 전체 권한(select/insert/update/delete)을 부여합니다.
-- "TO authenticated"만 쓰면 로그인한 아무나 허용되므로 user_roles의 admin 역할을 함께 확인합니다.
create policy "admin full access categories"
  on "public"."categories" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access projects"
  on "public"."projects" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin full access logs"
  on "public"."logs" for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
