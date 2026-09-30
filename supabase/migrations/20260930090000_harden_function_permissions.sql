-- 운영 DB 점검 결과, is_admin()/create_default_user_role()이 anon 역할에도 EXECUTE 권한이
-- 직접 부여되어 있었습니다(과거 마이그레이션 이력이 로컬과 어긋나며 생긴 차이).
-- PUBLIC에서만 revoke하는 것으로는 부족하므로 anon에서도 명시적으로 회수합니다.

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- create_default_user_role()은 auth.users insert 트리거 전용입니다.
-- 트리거는 함수 소유자 권한(SECURITY DEFINER)으로 실행되므로 호출자의 EXECUTE 권한이 필요 없습니다.
revoke execute on function public.create_default_user_role() from public;
revoke execute on function public.create_default_user_role() from anon;
revoke execute on function public.create_default_user_role() from authenticated;

-- 조회수 증가 함수는 비로그인 방문자도 호출해야 하므로 anon 실행 권한은 유지하고,
-- search_path만 빈 값으로 고정해 스키마 하이재킹 위험을 줄입니다.
alter function public.increment_log_view(text) set search_path = '';
alter function public.increment_project_view(text) set search_path = '';

-- 사용하는 트리거가 없는 것으로 확인된 레거시 함수를 정리합니다.
drop function if exists public.update_modified_column();
