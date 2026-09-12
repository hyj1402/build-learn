-- 서비스 권한은 Supabase Auth 계정(auth.users)과 분리해 public.user_roles에서 관리합니다.
-- user_metadata는 사용자가 수정할 수 있으므로 권한 판별에 사용하지 않습니다.
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- 로그인 사용자는 자신의 역할만 읽습니다. 역할 변경은 관리자용 SQL/기능이 생기기 전까지 클라이언트에 열지 않습니다.
create policy "users read own role"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- RLS 정책과 서버 코드가 같은 기준을 쓰도록 만드는 내부 권한 확인 함수입니다.
-- 반환값은 true/false뿐이며, 일반 사용자가 다른 사람의 역할 데이터를 읽을 수는 없습니다.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Google 등 어떤 로그인 방식을 쓰더라도 Auth 계정이 생기면 기본 역할을 member로 함께 만듭니다.
create function public.create_default_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.create_default_user_role() from public;

create trigger on_auth_user_created_assign_member_role
  after insert on auth.users
  for each row execute procedure public.create_default_user_role();

-- 트리거를 만들기 전에 존재했던 계정도 빠짐없이 member로 보정합니다.
insert into public.user_roles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- 사이트 소유자 계정만 최초 관리자 역할로 승격합니다.
update public.user_roles
set role = 'admin', updated_at = now()
where user_id = '6ec0a086-62f9-46f5-b4d9-c38f85b451a2'::uuid;
